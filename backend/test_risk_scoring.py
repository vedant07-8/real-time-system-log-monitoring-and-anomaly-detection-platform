from backend.generator import LogGenerator
from backend.log_parser import parse_log_line
from backend.anomaly_engine import AnomalyEngine
from backend.database import LogEntry
from backend.risk_scoring import score_alert


engine = AnomalyEngine()
generator = LogGenerator()

logs = generator.generateBruteForce()

for i, raw in enumerate(logs):
    parsed = parse_log_line(raw)
    entry = LogEntry(**parsed)

    anomalies = engine.analyze(entry)

    if anomalies:
        scored = score_alert(anomalies[0])

        print(
            f"Attempt {i + 1}: "
            f"score={scored['risk_score']} "
            f"severity={scored['severity']}"
        )

