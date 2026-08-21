from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
import re
from database import LogEntry, Alert, SessionLocal


# Anomaly detection rules
BRUTE_FORCE_THRESHOLD = 5
BRUTE_FORCE_WINDOW_MINUTES = 10
UNUSUAL_HOURS = (1, 5)  # 1 AM to 5 AM
PRIVILEGE_ESCALATION_KEYWORDS = ["sudo", "su ", "chmod 777", "chown root", "setuid"]
PORT_SCAN_PORTS = 20
PORT_SCAN_WINDOW_MINUTES = 5
DATA_EXFIL_KEYWORDS = ["curl", "wget", "scp", "rsync", "/etc/passwd", "/etc/shadow"]


class AnomalyEngine:
    def __init__(self):
        self.failed_logins = defaultdict(list)  # IP -> list of timestamps
        self.port_access = defaultdict(lambda: defaultdict(list))  # IP -> port -> [timestamps]
        self.alert_cache = []

    def analyze(self, log_entry: LogEntry) -> List[Dict[str, Any]]:
        """Analyze a log entry for anomalies. Returns list of detected anomalies."""
        anomalies = []
        now = datetime.utcnow()

        # Rule 1: Failed Login Detection
        if "failed" in log_entry.message.lower() and "password" in log_entry.message.lower():
            if log_entry.source_ip:
                self.failed_logins[log_entry.source_ip].append(now)
                # Clean old entries
                cutoff = now - timedelta(minutes=BRUTE_FORCE_WINDOW_MINUTES)
                self.failed_logins[log_entry.source_ip] = [
                    t for t in self.failed_logins[log_entry.source_ip] if t > cutoff
                ]
                count = len(self.failed_logins[log_entry.source_ip])

                if count >= BRUTE_FORCE_THRESHOLD:
                    anomalies.append({
                        "type": "BRUTE_FORCE_ATTACK",
                        "severity": "CRITICAL",
                        "description": f"Brute force attack detected from {log_entry.source_ip}: {count} failed attempts in {BRUTE_FORCE_WINDOW_MINUTES} minutes",
                        "source_ip": log_entry.source_ip,
                        "user": log_entry.user,
                        "score": min(1.0, count / (BRUTE_FORCE_THRESHOLD * 2)),
                    })
                elif count >= 3:
                    anomalies.append({
                        "type": "FAILED_LOGIN",
                        "severity": "MEDIUM",
                        "description": f"Multiple failed login attempts from {log_entry.source_ip}: {count} attempts",
                        "source_ip": log_entry.source_ip,
                        "user": log_entry.user,
                        "score": min(0.7, count / (BRUTE_FORCE_THRESHOLD * 2)),
                    })

        # Rule 2: Invalid User Detection
        if "invalid user" in log_entry.message.lower():
            anomalies.append({
                "type": "INVALID_USER_ACCESS",
                "severity": "MEDIUM",
                "description": f"Login attempt with invalid username from {log_entry.source_ip or 'unknown'}: {log_entry.message}",
                "source_ip": log_entry.source_ip,
                "user": log_entry.user,
                "score": 0.5,
            })

        # Rule 3: Unusual Hours Activity
        hour = log_entry.timestamp.hour
        if UNUSUAL_HOURS[0] <= hour <= UNUSUAL_HOURS[1]:
            if log_entry.source in ["sshd", "sudo", "login", "auth"]:
                anomalies.append({
                    "type": "UNUSUAL_HOUR_ACCESS",
                    "severity": "MEDIUM",
                    "description": f"Suspicious login activity during unusual hours ({hour}:00) from {log_entry.source_ip or 'local'}",
                    "source_ip": log_entry.source_ip,
                    "user": log_entry.user,
                    "score": 0.6,
                })

        # Rule 4: Privilege Escalation
        msg_lower = log_entry.message.lower()
        if any(keyword in msg_lower for keyword in PRIVILEGE_ESCALATION_KEYWORDS):
            if log_entry.source in ["sudo", "su", "polkitd"]:
                severity = "HIGH" if "chmod 777" in msg_lower or "chown root" in msg_lower else "MEDIUM"
                anomalies.append({
                    "type": "PRIVILEGE_ESCALATION",
                    "severity": severity,
                    "description": f"Privilege escalation attempt by {log_entry.user or 'unknown'}: {log_entry.message[:100]}",
                    "source_ip": log_entry.source_ip,
                    "user": log_entry.user,
                    "score": 0.8 if severity == "HIGH" else 0.5,
                })

        # Rule 5: Port Scanning Detection
        port_match = re.search(r'port (\d+)', log_entry.message)
        if port_match and log_entry.source_ip:
            port = port_match.group(1)
            self.port_access[log_entry.source_ip][port].append(now)
            cutoff = now - timedelta(minutes=PORT_SCAN_WINDOW_MINUTES)
            unique_ports = sum(
                1 for ports in self.port_access[log_entry.source_ip].values()
                if any(t > cutoff for t in ports)
            )
            if unique_ports >= PORT_SCAN_PORTS:
                anomalies.append({
                    "type": "PORT_SCAN",
                    "severity": "HIGH",
                    "description": f"Port scanning detected from {log_entry.source_ip}: {unique_ports} unique ports accessed",
                    "source_ip": log_entry.source_ip,
                    "user": None,
                    "score": 0.9,
                })

        # Rule 6: Data Exfiltration Indicators
        if any(keyword in msg_lower for keyword in DATA_EXFIL_KEYWORDS):
            anomalies.append({
                "type": "POTENTIAL_DATA_EXFIL",
                "severity": "HIGH",
                "description": f"Potential data exfiltration activity: {log_entry.message[:100]}",
                "source_ip": log_entry.source_ip,
                "user": log_entry.user,
                "score": 0.7,
            })

        # Rule 7: Authentication from New IP (simplified)
        if "accepted" in log_entry.message.lower() and log_entry.source_ip:
            # In a real system, we'd check against known IPs
            pass

        # Rule 8: Root/Admin Direct Login
        if log_entry.user in ["root", "admin"] and log_entry.source in ["sshd", "login"]:
            if "accepted" in log_entry.message.lower():
                anomalies.append({
                    "type": "ADMIN_DIRECT_LOGIN",
                    "severity": "HIGH",
                    "description": f"Direct login as {log_entry.user} from {log_entry.source_ip}",
                    "source_ip": log_entry.source_ip,
                    "user": log_entry.user,
                    "score": 0.8,
                })

        # Rule 9: Segmentation Fault / Crash
        if "segfault" in msg_lower or "segmentation fault" in msg_lower:
            anomalies.append({
                "type": "SYSTEM_CRASH",
                "severity": "CRITICAL",
                "description": f"Segmentation fault detected: {log_entry.message[:100]}",
                "source_ip": log_entry.source_ip,
                "user": log_entry.user,
                "score": 0.9,
            })

        # Rule 10: Error Rate Spike (high-severity logs)
        if log_entry.level in ["ERROR", "CRITICAL"]:
            anomalies.append({
                "type": "HIGH_SEVERITY_LOG",
                "severity": "MEDIUM",
                "description": f"High severity log from {log_entry.source}: {log_entry.message[:100]}",
                "source_ip": log_entry.source_ip,
                "user": log_entry.user,
                "score": 0.4,
            })

        return anomalies

    def create_alert(self, anomaly: Dict[str, Any], log_entry_id: int) -> Alert:
        """Create an alert from an anomaly."""
        db = SessionLocal()
        try:
            alert = Alert(
                anomaly_type=anomaly["type"],
                severity=anomaly["severity"],
                description=anomaly["description"],
                source_ip=anomaly.get("source_ip"),
                user=anomaly.get("user"),
                log_entry_id=log_entry_id,
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        finally:
            db.close()

    def update_log_as_anomaly(self, log_entry_id: int, anomaly: Dict[str, Any]):
        """Mark a log entry as anomalous."""
        db = SessionLocal()
        try:
            log_entry = db.query(LogEntry).filter(LogEntry.id == log_entry_id).first()
            if log_entry:
                log_entry.is_anomaly = True
                log_entry.anomaly_type = anomaly["type"]
                log_entry.anomaly_score = anomaly.get("score", 0.0)
                db.commit()
        finally:
            db.close()
