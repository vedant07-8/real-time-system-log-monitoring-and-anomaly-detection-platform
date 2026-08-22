# backend/anomaly_engine.py

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Set

from backend.database import LogEntry


# ============================================================
# DETECTION CONFIGURATION
# ============================================================

# Multiple failed logins
# Same user, regardless of IP.
MULTIPLE_FAILED_LOGIN_THRESHOLD = 3
MULTIPLE_FAILED_LOGIN_WINDOW_MINUTES = 10

# Brute force
# Same user + same IP within a short window.
BRUTE_FORCE_THRESHOLD = 5
BRUTE_FORCE_WINDOW_MINUTES = 5

# Suspicious IP
# Same IP targeting multiple different users.
SUSPICIOUS_IP_USER_THRESHOLD = 3
SUSPICIOUS_IP_WINDOW_MINUTES = 10

# Privilege escalation
# Successful login followed by privileged activity.
PRIVILEGE_ESCALATION_WINDOW_MINUTES = 10

# Unusual login time
# Normal login window is 09:00 inclusive to 21:00 exclusive.
UNUSUAL_LOGIN_START_HOUR = 9
UNUSUAL_LOGIN_END_HOUR = 21

# Rolling in-memory history.
HISTORY_WINDOW_MINUTES = 30


# ============================================================
# DETACHED-SAFE LOG SNAPSHOT
# ============================================================

@dataclass
class LogSnapshot:
    """
    Lightweight copy of the fields required by the anomaly
    engine.

    IMPORTANT:
    We intentionally do NOT store SQLAlchemy LogEntry objects
    in the in-memory detection history.

    SQLAlchemy objects can become expired/detached after a
    database commit. A plain snapshot cannot.
    """

    id: Optional[int]
    timestamp: Optional[datetime]

    source: Optional[str]
    event_type: Optional[str]

    username: Optional[str]
    ip_address: Optional[str]

    status_code: Optional[int]
    level: Optional[str]

    message: Optional[str]
    raw_message: Optional[str]
    raw_log: Optional[str]

    source_ip: Optional[str]
    user: Optional[str]


class AnomalyEngine:
    """
    Real-time anomaly detection engine.

    Detection rules:

    1. BRUTE_FORCE
    2. SUSPICIOUS_IP
    3. PRIVILEGE_ESCALATION
    4. MULTIPLE_FAILED_LOGINS
    5. UNUSUAL_LOGIN_TIME

    The database is the source of truth.

    recent_logs contains detached-safe snapshots rather than
    SQLAlchemy ORM objects.
    """

    def __init__(self):
        self.recent_logs: List[LogSnapshot] = []

    # ========================================================
    # SNAPSHOT CREATION
    # ========================================================

    @staticmethod
    def _snapshot_log(
        log: LogEntry,
    ) -> LogSnapshot:
        """
        Convert a SQLAlchemy LogEntry into a plain Python
        snapshot.

        All required attributes are copied while the ORM object
        is still available to the caller.
        """

        return LogSnapshot(
            id=getattr(log, "id", None),
            timestamp=getattr(log, "timestamp", None),

            source=getattr(log, "source", None),
            event_type=getattr(log, "event_type", None),

            username=getattr(log, "username", None),
            ip_address=getattr(log, "ip_address", None),

            status_code=getattr(log, "status_code", None),
            level=getattr(log, "level", None),

            message=getattr(log, "message", None),
            raw_message=getattr(log, "raw_message", None),
            raw_log=getattr(log, "raw_log", None),

            source_ip=getattr(log, "source_ip", None),
            user=getattr(log, "user", None),
        )

    # ========================================================
    # MAIN ENTRY POINT
    # ========================================================

    def analyze(
        self,
        log_entry: LogEntry,
    ) -> List[Dict[str, Any]]:
        """
        Run all detection rules against a new log entry.

        The incoming SQLAlchemy object is immediately converted
        into a plain snapshot so the anomaly engine never keeps
        a detached ORM object.
        """

        current_log = self._snapshot_log(
            log_entry
        )

        self.recent_logs.append(
            current_log
        )

        self._cleanup_history()

        anomalies: List[Dict[str, Any]] = []

        # ----------------------------------------------------
        # 1. Brute force
        # ----------------------------------------------------

        anomaly = self.check_brute_force(
            current_log,
            self.recent_logs,
        )

        if anomaly:
            anomalies.append(anomaly)

        # ----------------------------------------------------
        # 2. Suspicious IP
        # ----------------------------------------------------

        anomaly = self.check_suspicious_ip(
            current_log,
            self.recent_logs,
        )

        if anomaly:
            anomalies.append(anomaly)

        # ----------------------------------------------------
        # 3. Privilege escalation
        # ----------------------------------------------------

        anomaly = self.check_privilege_escalation(
            current_log,
            self.recent_logs,
        )

        if anomaly:
            anomalies.append(anomaly)

        # ----------------------------------------------------
        # 4. Multiple failed logins
        # ----------------------------------------------------

        anomaly = self.check_multiple_failed_logins(
            current_log,
            self.recent_logs,
        )

        if anomaly:
            anomalies.append(anomaly)

        # ----------------------------------------------------
        # 5. Unusual login time
        # ----------------------------------------------------

        anomaly = self.check_unusual_login_time(
            current_log,
        )

        if anomaly:
            anomalies.append(anomaly)

        return anomalies

    # ========================================================
    # RULE 1 — BRUTE FORCE
    # ========================================================

    def check_brute_force(
        self,
        log: LogSnapshot,
        recent_logs: List[LogSnapshot],
    ) -> Optional[Dict[str, Any]]:
        """
        Detect concentrated failed logins against the same
        username from the same IP.

        Trigger:
            >= 5 failed attempts

        Window:
            5 minutes
        """

        if log.event_type != "login_failed":
            return None

        if not log.username:
            return None

        if not log.ip_address:
            return None

        if not log.timestamp:
            return None

        cutoff = (
            log.timestamp
            - timedelta(
                minutes=BRUTE_FORCE_WINDOW_MINUTES
            )
        )

        matching_logs: List[LogSnapshot] = []

        for previous_log in recent_logs:

            if previous_log.event_type != "login_failed":
                continue

            if previous_log.username != log.username:
                continue

            if previous_log.ip_address != log.ip_address:
                continue

            if not previous_log.timestamp:
                continue

            if previous_log.timestamp < cutoff:
                continue

            matching_logs.append(
                previous_log
            )

        failed_count = len(
            matching_logs
        )

        if failed_count < BRUTE_FORCE_THRESHOLD:
            return None

        return {
            "type": "BRUTE_FORCE",

            "severity": "LOW",

            "description": (
                f"Possible brute-force attack detected against "
                f"{log.username} from {log.ip_address}: "
                f"{failed_count} failed login attempts within "
                f"{BRUTE_FORCE_WINDOW_MINUTES} minutes"
            ),

            "source_ip": log.ip_address,

            "user": log.username,

            "score": min(
                1.0,
                failed_count / 10,
            ),

            "metadata": {
                "failed_count": failed_count,
                "window_minutes": BRUTE_FORCE_WINDOW_MINUTES,
                "username": log.username,
                "source_ip": log.ip_address,
            },
        }

    # ========================================================
    # RULE 2 — SUSPICIOUS IP
    # ========================================================

    def check_suspicious_ip(
        self,
        log: LogSnapshot,
        recent_logs: List[LogSnapshot],
    ) -> Optional[Dict[str, Any]]:
        """
        Detect one IP attempting authentication against
        multiple different users.

        Trigger:
            >= 3 different usernames

        Window:
            10 minutes
        """

        if log.event_type != "login_failed":
            return None

        if not log.ip_address:
            return None

        if not log.timestamp:
            return None

        cutoff = (
            log.timestamp
            - timedelta(
                minutes=SUSPICIOUS_IP_WINDOW_MINUTES
            )
        )

        targeted_users: Set[str] = set()

        for previous_log in recent_logs:

            if previous_log.event_type != "login_failed":
                continue

            if previous_log.ip_address != log.ip_address:
                continue

            if not previous_log.timestamp:
                continue

            if previous_log.timestamp < cutoff:
                continue

            if previous_log.username:
                targeted_users.add(
                    previous_log.username
                )

        if (
            len(targeted_users)
            < SUSPICIOUS_IP_USER_THRESHOLD
        ):
            return None

        return {
            "type": "SUSPICIOUS_IP",

            "severity": "LOW",

            "description": (
                f"Suspicious IP {log.ip_address} targeted "
                f"{len(targeted_users)} different users within "
                f"{SUSPICIOUS_IP_WINDOW_MINUTES} minutes"
            ),

            "source_ip": log.ip_address,

            "user": log.username,

            "score": min(
                1.0,
                len(targeted_users) / 6,
            ),

            "metadata": {
                "unique_users": len(targeted_users),
                "targeted_users": sorted(
                    targeted_users
                ),
                "window_minutes": (
                    SUSPICIOUS_IP_WINDOW_MINUTES
                ),
                "source_ip": log.ip_address,
            },
        }

    # ========================================================
    # RULE 3 — PRIVILEGE ESCALATION
    # ========================================================

    def check_privilege_escalation(
        self,
        log: LogSnapshot,
        recent_logs: List[LogSnapshot],
    ) -> Optional[Dict[str, Any]]:
        """
        Detect privileged activity shortly after a successful
        login by the same user.

        Supported indicators:

        - sudo
        - USER=root
        - sudo:
        - sudo[
        - privilege_escalation
        - privilege_change
        - role_change
        """

        if not self._is_privilege_event(log):
            return None

        username = (
            self._extract_user_from_privilege_log(
                log
            )
        )

        if not username:
            return None

        if not log.timestamp:
            return None

        cutoff = (
            log.timestamp
            - timedelta(
                minutes=PRIVILEGE_ESCALATION_WINDOW_MINUTES
            )
        )

        recent_login: Optional[LogSnapshot] = None

        for previous_log in reversed(
            recent_logs
        ):

            # Skip the current log.
            if (
                previous_log.id is not None
                and log.id is not None
                and previous_log.id == log.id
            ):
                continue

            if not previous_log.timestamp:
                continue

            if previous_log.timestamp < cutoff:
                continue

            if previous_log.username != username:
                continue

            if previous_log.event_type != "login_success":
                continue

            # Use the most recent successful login.
            recent_login = previous_log
            break

        if not recent_login:
            return None

        return {
            "type": "PRIVILEGE_ESCALATION",

            "severity": "LOW",

            "description": (
                f"Privilege escalation detected for {username}: "
                f"privileged activity occurred shortly after "
                f"a successful login"
            ),

            "source_ip": (
                log.ip_address
                or recent_login.ip_address
            ),

            "user": username,

            "score": 0.85,

            "metadata": {
                "username": username,

                "login_timestamp": (
                    recent_login.timestamp.isoformat()
                ),

                "escalation_timestamp": (
                    log.timestamp.isoformat()
                ),

                "event_type": log.event_type,
            },
        }

    # ========================================================
    # RULE 4 — MULTIPLE FAILED LOGINS
    # ========================================================

    def check_multiple_failed_logins(
        self,
        log: LogSnapshot,
        recent_logs: List[LogSnapshot],
    ) -> Optional[Dict[str, Any]]:
        """
        Detect repeated failed logins for the same user.

        Trigger:
            >= 3 failed attempts

        Window:
            10 minutes

        IP address does not have to remain the same.
        """

        if log.event_type != "login_failed":
            return None

        if not log.username:
            return None

        if not log.timestamp:
            return None

        cutoff = (
            log.timestamp
            - timedelta(
                minutes=MULTIPLE_FAILED_LOGIN_WINDOW_MINUTES
            )
        )

        matching_logs: List[LogSnapshot] = []

        for previous_log in recent_logs:

            if previous_log.event_type != "login_failed":
                continue

            if previous_log.username != log.username:
                continue

            if not previous_log.timestamp:
                continue

            if previous_log.timestamp < cutoff:
                continue

            matching_logs.append(
                previous_log
            )

        failed_count = len(
            matching_logs
        )

        if (
            failed_count
            < MULTIPLE_FAILED_LOGIN_THRESHOLD
        ):
            return None

        return {
            "type": "MULTIPLE_FAILED_LOGINS",

            "severity": "LOW",

            "description": (
                f"Multiple failed login attempts detected "
                f"for {log.username}: {failed_count} attempts "
                f"within {MULTIPLE_FAILED_LOGIN_WINDOW_MINUTES} "
                f"minutes"
            ),

            "source_ip": log.ip_address,

            "user": log.username,

            "score": min(
                1.0,
                failed_count / 10,
            ),

            "metadata": {
                "failed_count": failed_count,

                "window_minutes": (
                    MULTIPLE_FAILED_LOGIN_WINDOW_MINUTES
                ),

                "username": log.username,

                "source_ip": log.ip_address,
            },
        }

    # ========================================================
    # RULE 5 — UNUSUAL LOGIN TIME
    # ========================================================

    def check_unusual_login_time(
        self,
        log: LogSnapshot,
    ) -> Optional[Dict[str, Any]]:
        """
        Detect successful logins outside normal working hours.

        Normal:
            09:00 - 21:00

        Suspicious:
            21:00 - 09:00
        """

        if log.event_type != "login_success":
            return None

        if not log.username:
            return None

        if not log.timestamp:
            return None

        hour = log.timestamp.hour

        if (
            UNUSUAL_LOGIN_START_HOUR
            <= hour
            < UNUSUAL_LOGIN_END_HOUR
        ):
            return None

        return {
            "type": "UNUSUAL_LOGIN_TIME",

            "severity": "LOW",

            "description": (
                f"Login for {log.username} occurred at "
                f"{log.timestamp.strftime('%H:%M:%S')}, "
                f"outside normal login hours "
                f"({UNUSUAL_LOGIN_START_HOUR:02d}:00-"
                f"{UNUSUAL_LOGIN_END_HOUR:02d}:00)"
            ),

            "source_ip": log.ip_address,

            "user": log.username,

            "score": 0.40,

            "metadata": {
                "username": log.username,

                "hour": hour,

                "normal_start": (
                    UNUSUAL_LOGIN_START_HOUR
                ),

                "normal_end": (
                    UNUSUAL_LOGIN_END_HOUR
                ),
            },
        }

    # ========================================================
    # PRIVILEGE EVENT DETECTION
    # ========================================================

    @staticmethod
    def _is_privilege_event(
        log: LogSnapshot,
    ) -> bool:
        """
        Determine whether a log represents privileged activity.
        """

        event_type = (
            (log.event_type or "")
            .strip()
            .lower()
        )

        source = (
            (log.source or "")
            .strip()
            .lower()
        )

        message = (
            (log.message or "")
            .lower()
        )

        raw_message = (
            (log.raw_message or "")
            .lower()
        )

        raw_log = (
            (log.raw_log or "")
            .lower()
        )

        combined = " ".join(
            [
                event_type,
                source,
                message,
                raw_message,
                raw_log,
            ]
        )

        if event_type in {
            "privilege_escalation",
            "privilege_change",
            "role_change",
            "sudo",
        }:
            return True

        if source == "sudo":
            return True

        if "sudo:" in combined:
            return True

        if "sudo[" in combined:
            return True

        if "user=root" in combined:
            return True

        if "user=root " in combined:
            return True

        return False

    # ========================================================
    # PRIVILEGE USER EXTRACTION
    # ========================================================

    @staticmethod
    def _extract_user_from_privilege_log(
        log: LogSnapshot,
    ) -> Optional[str]:
        """
        Extract the acting user from a privilege event.

        The parser should populate username whenever possible.

        Fallback supports common sudo format:

            john.doe : TTY=pts/0 ; PWD=/home/john.doe ;
            USER=root ; COMMAND=ls
        """

        if log.username:
            return log.username

        message = (
            log.message
            or log.raw_message
            or log.raw_log
            or ""
        ).strip()

        if not message:
            return None

        # Standard sudo format:
        # username : TTY=...
        if " : " in message:
            candidate = message.split(
                " : ",
                1,
            )[0].strip()

            if candidate:
                return candidate

        return None

    # ========================================================
    # HISTORY MANAGEMENT
    # ========================================================

    def _cleanup_history(self):
        """
        Keep only logs inside the rolling history window.

        This method operates exclusively on LogSnapshot objects,
        so it can never trigger SQLAlchemy DetachedInstanceError.
        """

        if not self.recent_logs:
            return

        valid_logs = [
            log
            for log in self.recent_logs
            if log.timestamp is not None
        ]

        if not valid_logs:
            self.recent_logs.clear()
            return

        latest_timestamp = max(
            log.timestamp
            for log in valid_logs
            if log.timestamp is not None
        )

        cutoff = (
            latest_timestamp
            - timedelta(
                minutes=HISTORY_WINDOW_MINUTES
            )
        )

        self.recent_logs = [
            log
            for log in valid_logs
            if (
                log.timestamp is not None
                and log.timestamp >= cutoff
            )
        ]

    # ========================================================
    # RESET
    # ========================================================

    def clear_history(self):
        """
        Clear in-memory detection history.
        """

        self.recent_logs.clear()