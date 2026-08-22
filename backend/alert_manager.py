from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session

from backend.database import Alert
from backend.risk_scoring import score_alert


ALERT_DEDUP_WINDOW_MINUTES = 5


class AlertManager:
    """
    Creates and manages anomaly alerts.

    Repeated detections for the same anomaly/user/IP are merged
    into one open alert within the deduplication window.
    """

    def __init__(self, db: Session):
        self.db = db

    # ========================================================
    # CREATE OR UPDATE
    # ========================================================

    def create_or_update(
        self,
        anomaly: Dict[str, Any],
        log_entry_id: int,
    ) -> Alert:
        """
        Create a new alert or update an existing matching alert.
        """

        # ----------------------------------------------------
        # Calculate the current anomaly score FIRST
        # ----------------------------------------------------

        scored_anomaly = score_alert(anomaly)

        anomaly_type = scored_anomaly.get(
            "type",
            "UNKNOWN",
        )

        source_ip = scored_anomaly.get(
            "source_ip"
        )

        user = scored_anomaly.get(
            "user"
        )

        cutoff = (
            datetime.utcnow()
            - timedelta(
                minutes=ALERT_DEDUP_WINDOW_MINUTES
            )
        )

        # ----------------------------------------------------
        # Find existing unresolved alert
        # ----------------------------------------------------

        query = (
            self.db.query(Alert)
            .filter(
                Alert.anomaly_type == anomaly_type,
                Alert.resolved == False,
                Alert.timestamp >= cutoff,
            )
        )

        if source_ip:
            query = query.filter(
                Alert.source_ip == source_ip
            )

        if user:
            query = query.filter(
                Alert.user == user
            )

        existing_alert = (
            query
            .order_by(
                Alert.timestamp.desc()
            )
            .first()
        )

        # ----------------------------------------------------
        # Update existing alert
        # ----------------------------------------------------

        if existing_alert:

            return self._update_existing_alert(
                existing_alert,
                scored_anomaly,
                log_entry_id,
            )

        # ----------------------------------------------------
        # Create new alert
        # ----------------------------------------------------

        return self._create_alert(
            scored_anomaly,
            log_entry_id,
        )

    # ========================================================
    # CREATE
    # ========================================================

    def _create_alert(
        self,
        anomaly: Dict[str, Any],
        log_entry_id: int,
    ) -> Alert:

        alert = Alert(
            anomaly_type=anomaly.get(
                "type",
                "UNKNOWN",
            ),

            severity=anomaly.get(
                "severity",
                "LOW",
            ),

            description=anomaly.get(
                "description",
                "Anomaly detected",
            ),

            source_ip=anomaly.get(
                "source_ip"
            ),

            user=anomaly.get(
                "user"
            ),

            resolved=False,

            log_entry_id=log_entry_id,

            risk_score=float(
                anomaly.get(
                    "risk_score",
                    0,
                )
            ),

            timestamp=datetime.utcnow(),
        )

        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)

        return alert

    # ========================================================
    # UPDATE
    # ========================================================

    def _update_existing_alert(
        self,
        alert: Alert,
        anomaly: Dict[str, Any],
        log_entry_id: int,
    ) -> Alert:

        new_score = float(
            anomaly.get(
                "risk_score",
                0,
            )
        )

        # ----------------------------------------------------
        # Keep highest observed risk score
        # ----------------------------------------------------

        current_score = float(
            alert.risk_score or 0
        )

        alert.risk_score = max(
            current_score,
            new_score,
        )

        # ----------------------------------------------------
        # Keep highest severity
        # ----------------------------------------------------

        alert.severity = self._highest_severity(
            alert.severity,
            anomaly.get(
                "severity",
                "LOW",
            ),
        )

        # ----------------------------------------------------
        # Update latest information
        # ----------------------------------------------------

        alert.description = anomaly.get(
            "description",
            alert.description,
        )

        alert.log_entry_id = log_entry_id

        # Refresh timestamp so the dedup window continues
        # from the latest detection.
        alert.timestamp = datetime.utcnow()

        self.db.commit()
        self.db.refresh(alert)

        return alert

    # ========================================================
    # SEVERITY COMPARISON
    # ========================================================

    @staticmethod
    def _highest_severity(
        current: str,
        new: str,
    ) -> str:

        severity_order = {
            "LOW": 1,
            "MEDIUM": 2,
            "HIGH": 3,
            "CRITICAL": 4,
        }

        current_value = severity_order.get(
            current,
            0,
        )

        new_value = severity_order.get(
            new,
            0,
        )

        if new_value > current_value:
            return new

        return current

    # ========================================================
    # RESOLVE ALERT
    # ========================================================

    def resolve_alert(
        self,
        alert_id: int,
    ) -> Optional[Alert]:

        alert = (
            self.db.query(Alert)
            .filter(
                Alert.id == alert_id
            )
            .first()
        )

        if not alert:
            return None

        alert.resolved = True

        self.db.commit()
        self.db.refresh(alert)

        return alert

    # ========================================================
    # GET OPEN ALERTS
    # ========================================================

    def get_open_alerts(self):

        return (
            self.db.query(Alert)
            .filter(
                Alert.resolved == False
            )
            .order_by(
                Alert.timestamp.desc()
            )
            .all()
        )