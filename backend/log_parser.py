import re
from datetime import datetime
from typing import Optional, Dict, Any

from dateutil import parser as date_parser


# ============================================================
# REGEX PATTERNS
# ============================================================

SYSLOG_PATTERN = re.compile(
    r'(\w{3}\s+\d{1,2}\s+[\d:]+)\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.+)'
)

SSH_FAILED_PATTERN = re.compile(
    r'Failed password for (?:invalid user )?(\S+) from (\S+) port (\d+)'
)

SSH_ACCEPTED_PATTERN = re.compile(
    r'Accepted (password|publickey) for (\S+) from (\S+) port (\d+)'
)

INVALID_USER_PATTERN = re.compile(
    r'Invalid user (\S+) from (\S+)'
)

SUDO_PATTERN = re.compile(
    r'(\S+)\s*:\s+TTY=(\S+)\s*;\s+PWD=(\S+)\s*;\s+USER=(\S+)\s*;\s+COMMAND=(.+)'
)

APACHE_PATTERN = re.compile(
    r'(\S+)\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d{3})\s+(\d+)'
)

KERNEL_PATTERN = re.compile(
    r'\[\s*(\d+\.\d+)\]\s+(.+)'
)

IP_PATTERN = re.compile(
    r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
)


# ============================================================
# CONSTANTS
# ============================================================

UNUSUAL_HOURS_START = 1
UNUSUAL_HOURS_END = 5


# ============================================================
# TIMESTAMP HELPERS
# ============================================================

def parse_syslog_timestamp(time_str: str) -> datetime:
    """
    Parse a syslog timestamp and attach the current year.
    """

    try:
        return date_parser.parse(
            f"{datetime.now().year} {time_str}"
        )
    except (ValueError, OverflowError):
        return datetime.now()


# ============================================================
# EVENT CLASSIFICATION
# ============================================================

def classify_event(
    message: str,
    source: str,
    timestamp: datetime,
) -> str:

    message_lower = message.lower()
    source_lower = source.lower()

    # --------------------------------------------------------
    # SSH authentication
    # --------------------------------------------------------

    if "failed password" in message_lower:
        return "login_failed"

    if "invalid user" in message_lower:
        return "invalid_login"

    if "accepted password" in message_lower:
        if (
            UNUSUAL_HOURS_START
            <= timestamp.hour
            <= UNUSUAL_HOURS_END
        ):
            return "login_unusual_time"

        return "login_success"

    if "accepted publickey" in message_lower:
        if (
            UNUSUAL_HOURS_START
            <= timestamp.hour
            <= UNUSUAL_HOURS_END
        ):
            return "login_unusual_time"

        return "login_success"

    # --------------------------------------------------------
    # Session events
    # --------------------------------------------------------

    if "session opened" in message_lower:
        return "session_opened"

    if "session closed" in message_lower:
        return "session_closed"

    # --------------------------------------------------------
    # Privilege escalation
    # --------------------------------------------------------

    if source_lower in {"sudo", "su"}:
        return "privilege_escalation"

    if "user=root" in message_lower:
        return "privilege_escalation"

    if "chmod 777" in message_lower:
        return "privilege_escalation"

    if "chown root" in message_lower:
        return "privilege_escalation"

    # --------------------------------------------------------
    # Network / firewall
    # --------------------------------------------------------

    if "iptables" in message_lower:
        return "firewall_event"

    if "fail2ban" in message_lower and "ban" in message_lower:
        return "ip_banned"

    # --------------------------------------------------------
    # System events
    # --------------------------------------------------------

    if "segfault" in message_lower:
        return "system_crash"

    if "out of memory" in message_lower:
        return "memory_error"

    if "error" in message_lower:
        return "system_error"

    if "warning" in message_lower:
        return "system_warning"

    # --------------------------------------------------------
    # Apache
    # --------------------------------------------------------

    if source_lower == "apache":
        return "http_request"

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    return "system_event"


# ============================================================
# LOG LEVEL
# ============================================================

def determine_level(
    message: str,
    status_code: Optional[int] = None,
) -> str:

    message_upper = message.upper()

    if status_code is not None:

        if status_code >= 500:
            return "ERROR"

        if status_code >= 400:
            return "WARNING"

        return "INFO"

    if any(
        word in message_upper
        for word in [
            "CRITICAL",
            "FATAL",
            "PANIC",
            "SEGFAULT",
        ]
    ):
        return "CRITICAL"

    if any(
        word in message_upper
        for word in [
            "ERROR",
            "FAILED",
            "FAILURE",
        ]
    ):
        return "ERROR"

    if any(
        word in message_upper
        for word in [
            "WARN",
            "WARNING",
        ]
    ):
        return "WARNING"

    return "INFO"


# ============================================================
# SYSLOG PARSER
# ============================================================

def parse_syslog(
    line: str,
) -> Optional[Dict[str, Any]]:

    match = SYSLOG_PATTERN.match(line)

    if not match:
        return None

    (
        time_str,
        hostname,
        process,
        pid,
        message,
    ) = match.groups()

    timestamp = parse_syslog_timestamp(time_str)

    source = process or "system"

    # --------------------------------------------------------
    # Extract IP
    # --------------------------------------------------------

    ip_match = re.search(
        r'from ((?:\d{1,3}\.){3}\d{1,3})',
        message,
    )

    source_ip = (
        ip_match.group(1)
        if ip_match
        else None
    )

    # --------------------------------------------------------
    # Extract user
    # --------------------------------------------------------

    user = None

    failed_match = SSH_FAILED_PATTERN.search(message)

    if failed_match:
        user = failed_match.group(1)

    if user is None:

        accepted_match = SSH_ACCEPTED_PATTERN.search(
            message
        )

        if accepted_match:
            user = accepted_match.group(2)

    if user is None:

        invalid_match = INVALID_USER_PATTERN.search(
            message
        )

        if invalid_match:
            user = invalid_match.group(1)

    if user is None:

        sudo_match = SUDO_PATTERN.search(message)

        if sudo_match:
            user = sudo_match.group(1)

    # --------------------------------------------------------
    # Event type
    # --------------------------------------------------------

    event_type = classify_event(
        message,
        source,
        timestamp,
    )

    # --------------------------------------------------------
    # Level
    # --------------------------------------------------------

    level = determine_level(message)

    # --------------------------------------------------------
    # Standardized schema
    # --------------------------------------------------------

    return {
        "timestamp": timestamp,

        "source": source,

        "event_type": event_type,

        "username": user,

        "ip_address": source_ip,

        "status_code": (
            401
            if event_type in {
                "login_failed",
                "invalid_login",
            }
            else None
        ),

        "level": level,

        "message": message,

        "raw_message": line,

        # ----------------------------------------------------
        # Backward compatibility with existing database/API
        # ----------------------------------------------------

        "source_ip": source_ip,

        "user": user,

        "raw_log": line,
    }


# ============================================================
# APACHE PARSER
# ============================================================

def parse_apache(
    line: str,
) -> Optional[Dict[str, Any]]:

    match = APACHE_PATTERN.match(line)

    if not match:
        return None

    (
        ip,
        user,
        time_str,
        request,
        status,
        size,
    ) = match.groups()

    try:

        timestamp = date_parser.parse(
            time_str
        )

    except (ValueError, OverflowError):

        timestamp = datetime.now()

    status_code = int(status)

    level = determine_level(
        request,
        status_code,
    )

    return {
        "timestamp": timestamp,

        "source": "apache",

        "event_type": "http_request",

        "username": (
            user
            if user != "-"
            else None
        ),

        "ip_address": ip,

        "status_code": status_code,

        "level": level,

        "message": (
            f"{request} - "
            f"{status} "
            f"({size} bytes)"
        ),

        "raw_message": line,

        # Backward compatibility
        "source_ip": ip,

        "user": (
            user
            if user != "-"
            else None
        ),

        "raw_log": line,
    }


# ============================================================
# KERNEL PARSER
# ============================================================

def parse_kernel(
    line: str,
) -> Optional[Dict[str, Any]]:

    match = KERNEL_PATTERN.search(line)

    if not match:
        return None

    _, message = match.groups()

    timestamp = datetime.now()

    level = determine_level(message)

    event_type = classify_event(
        message,
        "kernel",
        timestamp,
    )

    return {
        "timestamp": timestamp,

        "source": "kernel",

        "event_type": event_type,

        "username": None,

        "ip_address": None,

        "status_code": None,

        "level": level,

        "message": message,

        "raw_message": line,

        # Backward compatibility
        "source_ip": None,

        "user": None,

        "raw_log": line,
    }


# ============================================================
# MAIN NORMALIZER
# ============================================================

def parse_log_line(
    line: str,
) -> Optional[Dict[str, Any]]:

    """
    Normalize any supported raw log line into
    one consistent schema.
    """

    if not line:
        return None

    line = line.strip()

    if not line:
        return None

    # --------------------------------------------------------
    # Apache
    # --------------------------------------------------------

    result = parse_apache(line)

    if result:
        return result

    # --------------------------------------------------------
    # Syslog
    # --------------------------------------------------------

    result = parse_syslog(line)

    if result:
        return result

    # --------------------------------------------------------
    # Kernel
    # --------------------------------------------------------

    result = parse_kernel(line)

    if result:
        return result

    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    timestamp = datetime.now()

    event_type = classify_event(
        line,
        "unknown",
        timestamp,
    )

    level = determine_level(line)

    ip_match = IP_PATTERN.search(line)

    source_ip = (
        ip_match.group(0)
        if ip_match
        else None
    )

    return {
        "timestamp": timestamp,

        "source": "unknown",

        "event_type": event_type,

        "username": None,

        "ip_address": source_ip,

        "status_code": None,

        "level": level,

        "message": line,

        "raw_message": line,

        # Backward compatibility
        "source_ip": source_ip,

        "user": None,

        "raw_log": line,
    }


# ============================================================
# EXTRACTION HELPERS
# ============================================================

def extract_failed_login_ip(
    message: str,
) -> Optional[str]:

    match = SSH_FAILED_PATTERN.search(
        message
    )

    return (
        match.group(2)
        if match
        else None
    )


def extract_invalid_user_info(
    message: str,
):

    match = INVALID_USER_PATTERN.search(
        message
    )

    if match:

        return (
            match.group(1),
            match.group(2),
        )

    return None, None