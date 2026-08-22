from backend.database import SessionLocal, init_db
from backend.alert_manager import AlertManager


init_db()

db = SessionLocal()

manager = AlertManager(db)

alert = {
    "type": "MULTIPLE_FAILED_LOGINS",
    "severity": "LOW",
    "description": "Multiple failed login attempts",
    "source_ip": "185.220.101.1",
    "user": "john.doe",
    "risk_score": 30,
}

print("Creating first alert...")

first = manager.create_or_update(
    alert,
    log_entry_id=1,
)

print(
    f"Alert ID: {first.id} | "
    f"Score: {first.risk_score} | "
    f"Severity: {first.severity}"
)


print("\nSending same alert again...")

alert["risk_score"] = 40
alert["severity"] = "MEDIUM"

second = manager.create_or_update(
    alert,
    log_entry_id=2,
)

print(
    f"Alert ID: {second.id} | "
    f"Score: {second.risk_score} | "
    f"Severity: {second.severity}"
)


print(
    f"\nSame alert reused: {first.id == second.id}"
)

db.close()
