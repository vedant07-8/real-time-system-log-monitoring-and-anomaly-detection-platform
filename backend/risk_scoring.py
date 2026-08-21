from typing import Dict, Any


# ============================================================
# Base risk scores
# ============================================================

RISK_WEIGHTS = {
    "MULTIPLE_FAILED_LOGINS": 30,
    "BRUTE_FORCE": 40,
    "SUSPICIOUS_IP": 25,
    "PRIVILEGE_ESCALATION": 35,
    "UNUSUAL_LOGIN_TIME": 15,
}


# ============================================================
# Severity thresholds
# ============================================================

def get_severity(score: float) -> str:
    """
    Convert a numerical risk score into a severity level.

    0-30   -> LOW
    31-60  -> MEDIUM
    61-85  -> HIGH
    86-100 -> CRITICAL
    """

    if score >= 86:
        return "CRITICAL"

    if score >= 61:
        return "HIGH"

    if score >= 31:
        return "MEDIUM"

    return "LOW"


# ============================================================
# Risk scoring
# ============================================================

def score_alert(
    anomaly: Dict[str, Any],
    existing_score: float = 0,
) -> Dict[str, Any]:
    """
    Calculate the risk score for an anomaly.

    IMPORTANT:
    existing_score is NOT added to the current anomaly score.

    The current anomaly is scored from its own evidence.
    AlertManager is responsible for retaining the highest
    score when the same alert is updated repeatedly.

    This prevents:
        3 attempts -> 30
        next detection -> 30 + 30 = 60
        next detection -> 60 + 30 = 90

    Instead:
        3 attempts -> 30
        4 attempts -> 35
        5 attempts -> 40
        6 attempts -> 45
    """

    anomaly_type = anomaly.get(
        "type",
        "UNKNOWN",
    )

    base_score = RISK_WEIGHTS.get(
        anomaly_type,
        10,
    )

    metadata = anomaly.get(
        "metadata",
        {},
    )

    # ========================================================
    # Multiple failed login scoring
    # ========================================================

    failed_count = int(
        metadata.get(
            "failed_count",
            0,
        )
    )

    repeat_bonus = 0

    if failed_count > 3:
        repeat_bonus = min(
            (failed_count - 3) * 5,
            30,
        )

    # ========================================================
    # Final score
    # ========================================================

    total_score = min(
        float(base_score + repeat_bonus),
        100,
    )

    severity = get_severity(
        total_score
    )

    return {
        **anomaly,
        "risk_score": total_score,
        "severity": severity,
    }