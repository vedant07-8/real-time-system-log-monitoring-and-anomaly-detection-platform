import re
from datetime import datetime
from typing import Optional, Dict, Any
from dateutil import parser as date_parser


# Common log patterns
SYSLOG_PATTERN = re.compile(
    r'(\w{3}\s+\d{1,2}\s+[\d:]+)\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.+)'
)

SSH_FAILED_PATTERN = re.compile(
    r'Failed password for (?:invalid user )?(\S+) from (\S+) port (\d+)'
)

SSH_ACCEPTED_PATTERN = re.compile(
    r'Accepted (password|publickey) for (\S+) from (\S+) port (\d+)'
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

FAILED_LOGIN_PATTERN = re.compile(
    r'Failed password for (\S+) from (\S+)'
)

INVALID_USER_PATTERN = re.compile(
    r'Invalid user (\S+) from (\S+)'
)

BRUTE_FORCE_THRESHOLD = 5  # failed attempts within time window
UNUSUAL_HOURS_START = 1  # 1 AM
UNUSUAL_HOURS_END = 5    # 5 AM


def parse_syslog(line: str) -> Optional[Dict[str, Any]]:
    """Parse a standard syslog line."""
    match = SYSLOG_PATTERN.match(line)
    if not match:
        return None

    time_str, hostname, process, pid, message = match.groups()

    # Parse timestamp - add current year
    try:
        timestamp = date_parser.parse(f"{datetime.now().year} {time_str}")
    except (ValueError, OverflowError):
        timestamp = datetime.now()

    # Detect log level from message
    level = "INFO"
    msg_upper = message.upper()
    if any(word in msg_upper for word in ["ERROR", "FAILED", "FAILURE", "CRITICAL", "FATAL"]):
        level = "ERROR"
    elif any(word in msg_upper for word in ["WARN", "WARNING"]):
        level = "WARNING"

    # Extract source IP if present
    ip_match = re.search(r'from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', message)
    source_ip = ip_match.group(1) if ip_match else None

    # Extract user if present
    user = None
    user_match = re.search(r'for (?:invalid user )?(\S+)', message)
    if user_match:
        user = user_match.group(1)

    return {
        "timestamp": timestamp,
        "source": process or "system",
        "level": level,
        "message": message,
        "source_ip": source_ip,
        "user": user,
        "raw_log": line,
    }


def parse_apache(line: str) -> Optional[Dict[str, Any]]:
    """Parse an Apache access log line."""
    match = APACHE_PATTERN.match(line)
    if not match:
        return None

    ip, user, time_str, request, status, size = match.groups()

    try:
        timestamp = date_parser.parse(time_str)
    except (ValueError, OverflowError):
        timestamp = datetime.now()

    status_code = int(status)
    level = "INFO"
    if status_code >= 500:
        level = "ERROR"
    elif status_code >= 400:
        level = "WARNING"

    return {
        "timestamp": timestamp,
        "source": "apache",
        "level": level,
        "message": f"{request} - {status} ({size} bytes)",
        "source_ip": ip,
        "user": user if user != "-" else None,
        "raw_log": line,
    }


def parse_kernel(line: str) -> Optional[Dict[str, Any]]:
    """Parse a kernel log line."""
    match = KERNEL_PATTERN.match(line)
    if not match:
        return None

    uptime, message = match.groups()
    timestamp = datetime.now()

    level = "INFO"
    msg_upper = message.upper()
    if any(word in msg_upper for word in ["ERROR", "FAILED", "CRITICAL", "PANIC"]):
        level = "ERROR"
    elif any(word in msg_upper for word in ["WARN", "WARNING"]):
        level = "WARNING"

    return {
        "timestamp": timestamp,
        "source": "kernel",
        "level": level,
        "message": message,
        "source_ip": None,
        "user": None,
        "raw_log": line,
    }


def parse_log_line(line: str) -> Optional[Dict[str, Any]]:
    """Try to parse a log line with all available parsers."""
    line = line.strip()
    if not line:
        return None

    # Try each parser
    result = parse_syslog(line)
    if result:
        return result

    result = parse_apache(line)
    if result:
        return result

    result = parse_kernel(line)
    if result:
        return result

    # Fallback: treat as generic log
    return {
        "timestamp": datetime.now(),
        "source": "unknown",
        "level": "INFO",
        "message": line,
        "source_ip": None,
        "user": None,
        "raw_log": line,
    }


def extract_failed_login_ip(message: str) -> Optional[str]:
    """Extract IP from failed login message."""
    match = FAILED_LOGIN_PATTERN.search(message)
    return match.group(2) if match else None


def extract_invalid_user_info(message: str):
    """Extract user and IP from invalid user message."""
    match = INVALID_USER_PATTERN.search(message)
    if match:
        return match.group(1), match.group(2)
    return None, None
