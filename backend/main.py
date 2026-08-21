import asyncio
import json
import random

from datetime import datetime, timedelta
from typing import List
from collections import defaultdict
from backend.risk_scoring import score_alert

import uvicorn

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database import (
    init_db,
    get_db,
    LogEntry,
    Alert,
)

from backend.log_parser import parse_log_line

from backend.anomaly_engine import AnomalyEngine

from backend.alert_manager import AlertManager

from backend.generator import (
    LogGenerator,
    generate_logs_batch,
    generate_anomaly_burst,
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="IT System Log Analyzer",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBAL STATE
# ============================================================

anomaly_engine = AnomalyEngine()

log_generator = LogGenerator()

connected_clients: List[WebSocket] = []

generator_running = False


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup():
    """
    Initialize the database when the server starts.
    """

    init_db()

    print("✅ Database initialized")
    print("🚀 IT System Log Analyzer started")


# ============================================================
# PROCESS LOG
# ============================================================

def process_log_entry(
    db_entry: LogEntry,
    db: Session,
) -> List[Alert]:
    """
    Run anomaly detection and create/update alerts.

    This is the central processing pipeline used by all
    ingestion methods.
    """

    anomalies = anomaly_engine.analyze(
        db_entry
    )

    alerts: List[Alert] = []

    for anomaly in anomalies:

        # ----------------------------------------------------
        # Mark the log as an anomaly
        # ----------------------------------------------------

        db_entry.is_anomaly = True

        db_entry.anomaly_type = anomaly.get(
            "type"
        )

        # Use the normalized anomaly score for the log.
        db_entry.anomaly_score = float(
            anomaly.get(
                "score",
                0,
            )
        )

        db.add(db_entry)

        # ----------------------------------------------------
        # Create/update alert
        # ----------------------------------------------------

        alert_manager = AlertManager(db)

        alert = alert_manager.create_or_update(
            anomaly=anomaly,
            log_entry_id=db_entry.id,
        )

        alerts.append(alert)

    # --------------------------------------------------------
    # Persist anomaly state if necessary
    # --------------------------------------------------------

    db.commit()
    db.refresh(db_entry)

    return alerts


# ============================================================
# REST API — INGEST SINGLE LOG
# ============================================================

@app.post("/api/logs/ingest")
async def ingest_log(
    log_line: str,
    db: Session = Depends(get_db),
):
    """
    Ingest a single log line.
    """

    parsed = parse_log_line(
        log_line
    )

    if not parsed:
        raise HTTPException(
            status_code=400,
            detail="Could not parse log line",
        )

    db_entry = LogEntry(
        **parsed
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # Run detection + alert management.
    alerts = process_log_entry(
        db_entry,
        db,
    )

    # Broadcast to connected frontend clients.
    await broadcast_log(
        db_entry,
        alerts,
    )

    return {
        "log_id": db_entry.id,

        "parsed": parsed,

        "anomalies": [
            {
                "id": alert.id,
                "type": alert.anomaly_type,
                "severity": alert.severity,
                "description": alert.description,
                "risk_score": alert.risk_score,
            }
            for alert in alerts
        ],
    }


# ============================================================
# REST API — BATCH INGEST
# ============================================================

@app.post("/api/logs/batch")
async def ingest_batch(
    log_lines: List[str],
    db: Session = Depends(get_db),
):
    """
    Ingest multiple log lines.
    """

    results = []

    for line in log_lines:

        parsed = parse_log_line(
            line
        )

        if not parsed:
            continue

        db_entry = LogEntry(
            **parsed
        )

        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)

        alerts = process_log_entry(
            db_entry,
            db,
        )

        await broadcast_log(
            db_entry,
            alerts,
        )

        results.append(
            {
                "log_id": db_entry.id,
                "anomalies": len(alerts),
                "alert_ids": [
                    alert.id
                    for alert in alerts
                ],
            }
        )

    return {
        "ingested": len(results),
        "results": results,
    }


# ============================================================
# REST API — LOGS
# ============================================================

@app.get("/api/logs")
async def get_logs(
    limit: int = 100,
    offset: int = 0,
    source: str = None,
    level: str = None,
    anomaly_only: bool = False,
    search: str = None,
    db: Session = Depends(get_db),
):
    """
    Get logs with filtering.
    """

    query = db.query(
        LogEntry
    )

    if source:
        query = query.filter(
            LogEntry.source == source
        )

    if level:
        query = query.filter(
            LogEntry.level == level
        )

    if anomaly_only:
        query = query.filter(
            LogEntry.is_anomaly.is_(True)
        )

    if search:
        query = query.filter(
            LogEntry.message.contains(search)
        )

    total = query.count()

    logs = (
        query
        .order_by(
            desc(LogEntry.timestamp)
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,

        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "source": log.source,
                "event_type": log.event_type,
                "level": log.level,
                "message": log.message,
                "source_ip": log.source_ip,
                "user": log.user,
                "raw_log": log.raw_log,
                "is_anomaly": log.is_anomaly,
                "anomaly_type": log.anomaly_type,
                "anomaly_score": log.anomaly_score,
            }
            for log in logs
        ],
    }


# ============================================================
# REST API — ALERTS
# ============================================================

@app.get("/api/alerts")
async def get_alerts(
    limit: int = 50,
    severity: str = None,
    resolved: bool = None,
    db: Session = Depends(get_db),
):
    """
    Get alerts.
    """

    query = db.query(
        Alert
    )

    if severity:
        query = query.filter(
            Alert.severity == severity
        )

    if resolved is not None:
        query = query.filter(
            Alert.resolved == resolved
        )

    alerts = (
        query
        .order_by(
            desc(Alert.timestamp)
        )
        .limit(limit)
        .all()
    )

    return {
        "alerts": [
            {
                "id": alert.id,
                "timestamp": alert.timestamp.isoformat(),
                "anomaly_type": alert.anomaly_type,
                "severity": alert.severity,
                "description": alert.description,
                "source_ip": alert.source_ip,
                "user": alert.user,
                "resolved": alert.resolved,
                "log_entry_id": alert.log_entry_id,
                "risk_score": alert.risk_score,
            }
            for alert in alerts
        ]
    }


# ============================================================
# REST API — RESOLVE ALERT
# ============================================================

@app.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Resolve an alert.
    """

    alert_manager = AlertManager(
        db
    )

    alert = alert_manager.resolve_alert(
        alert_id
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return {
        "message": "Alert resolved",
        "alert": {
            "id": alert.id,
            "resolved": alert.resolved,
            "severity": alert.severity,
            "risk_score": alert.risk_score,
        },
    }


# ============================================================
# REST API — STATS
# ============================================================

@app.get("/api/stats")
async def get_stats(
    db: Session = Depends(get_db),
):
    """
    Get dashboard statistics.
    """

    now = datetime.utcnow()

    last_hour = (
        now - timedelta(hours=1)
    )

    # --------------------------------------------------------
    # Logs
    # --------------------------------------------------------

    total_logs = (
        db.query(
            func.count(LogEntry.id)
        ).scalar()
        or 0
    )

    recent_logs = (
        db.query(
            func.count(LogEntry.id)
        )
        .filter(
            LogEntry.timestamp > last_hour
        )
        .scalar()
        or 0
    )

    # --------------------------------------------------------
    # Anomalies
    # --------------------------------------------------------

    total_anomalies = (
        db.query(
            func.count(LogEntry.id)
        )
        .filter(
            LogEntry.is_anomaly.is_(True)
        )
        .scalar()
        or 0
    )

    recent_anomalies = (
        db.query(
            func.count(LogEntry.id)
        )
        .filter(
            LogEntry.is_anomaly.is_(True),
            LogEntry.timestamp > last_hour,
        )
        .scalar()
        or 0
    )

    # --------------------------------------------------------
    # Alerts by severity
    # --------------------------------------------------------

    severity_counts = (
        db.query(
            Alert.severity,
            func.count(Alert.id),
        )
        .group_by(
            Alert.severity
        )
        .all()
    )

    # --------------------------------------------------------
    # Recent alerts
    # --------------------------------------------------------

    recent_alerts = (
        db.query(Alert)
        .filter(
            Alert.timestamp > last_hour
        )
        .count()
    )

    # --------------------------------------------------------
    # Logs by source
    # --------------------------------------------------------

    source_counts = (
        db.query(
            LogEntry.source,
            func.count(LogEntry.id),
        )
        .group_by(
            LogEntry.source
        )
        .order_by(
            desc(
                func.count(
                    LogEntry.id
                )
            )
        )
        .limit(10)
        .all()
    )

    # --------------------------------------------------------
    # Logs by level
    # --------------------------------------------------------

    level_counts = (
        db.query(
            LogEntry.level,
            func.count(LogEntry.id),
        )
        .group_by(
            LogEntry.level
        )
        .all()
    )

    # --------------------------------------------------------
    # Anomaly types
    # --------------------------------------------------------

    anomaly_type_counts = (
        db.query(
            LogEntry.anomaly_type,
            func.count(LogEntry.id),
        )
        .filter(
            LogEntry.is_anomaly.is_(True)
        )
        .group_by(
            LogEntry.anomaly_type
        )
        .all()
    )

    # --------------------------------------------------------
    # Top anomaly IPs
    # --------------------------------------------------------

    top_anomaly_ips = (
        db.query(
            LogEntry.source_ip,
            func.count(LogEntry.id),
        )
        .filter(
            LogEntry.is_anomaly.is_(True),
            LogEntry.source_ip.isnot(None),
        )
        .group_by(
            LogEntry.source_ip
        )
        .order_by(
            desc(
                func.count(
                    LogEntry.id
                )
            )
        )
        .limit(10)
        .all()
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "total_logs": total_logs,

        "recent_logs": recent_logs,

        "total_anomalies": total_anomalies,

        "recent_anomalies": recent_anomalies,

        "recent_alerts": recent_alerts,

        "severity_counts": {
            severity: count
            for severity, count
            in severity_counts
        },

        "source_counts": {
            source: count
            for source, count
            in source_counts
        },

        "level_counts": {
            level: count
            for level, count
            in level_counts
        },

        "anomaly_type_counts": {
            anomaly_type: count
            for anomaly_type, count
            in anomaly_type_counts
            if anomaly_type
        },

        "top_anomaly_ips": {
            ip: count
            for ip, count
            in top_anomaly_ips
        },

        "anomaly_rate": round(
            (
                total_anomalies
                / total_logs
                * 100
            )
            if total_logs > 0
            else 0,
            2,
        ),
    }


# ============================================================
# REST API — TIMELINE
# ============================================================

@app.get("/api/stats/timeline")
async def get_timeline(
    hours: int = 24,
    db: Session = Depends(get_db),
):
    """
    Get log/anomaly counts grouped by hour.
    """

    now = datetime.utcnow()

    start = (
        now - timedelta(
            hours=hours
        )
    )

    logs = (
        db.query(LogEntry)
        .filter(
            LogEntry.timestamp >= start
        )
        .all()
    )

    hourly_data = defaultdict(
        lambda: {
            "total": 0,
            "anomalies": 0,
        }
    )

    for log in logs:

        hour_key = log.timestamp.strftime(
            "%Y-%m-%d %H:00"
        )

        hourly_data[
            hour_key
        ]["total"] += 1

        if log.is_anomaly:
            hourly_data[
                hour_key
            ]["anomalies"] += 1

    timeline = [
        {
            "timestamp": key,
            "total": value["total"],
            "anomalies": value["anomalies"],
        }
        for key, value
        in sorted(
            hourly_data.items()
        )
    ]

    return {
        "timeline": timeline
    }


# ============================================================
# REST API — SAMPLE DATA
# ============================================================

@app.post("/api/generate/sample")
async def generate_sample_data(
    count: int = 100,
    db: Session = Depends(get_db),
):
    """
    Generate sample logs for demonstration.
    """

    logs = generate_logs_batch(
        count,
        include_anomalies=True,
    )

    if count > 20:

        logs.extend(
            generate_anomaly_burst(
                "brute_force",
                15,
            )
        )

        logs.extend(
            generate_anomaly_burst(
                "privilege",
                5,
            )
        )

    results = []

    for line in logs:

        parsed = parse_log_line(
            line
        )

        if not parsed:
            continue

        db_entry = LogEntry(
            **parsed
        )

        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)

        alerts = process_log_entry(
            db_entry,
            db,
        )

        results.append(
            {
                "id": db_entry.id,
                "alerts": len(alerts),
            }
        )

    return {
        "message": (
            f"Generated {len(results)} sample logs"
        ),

        "total_logs": (
            db.query(
                func.count(LogEntry.id)
            ).scalar()
        ),

        "total_anomalies": (
            db.query(
                func.count(LogEntry.id)
            )
            .filter(
                LogEntry.is_anomaly.is_(True)
            )
            .scalar()
        ),
    }


# ============================================================
# REST API — ANOMALY BURST
# ============================================================

@app.post("/api/generate/burst")
async def generate_anomaly_burst_endpoint(
    burst_type: str = "brute_force",
    count: int = 20,
    db: Session = Depends(get_db),
):
    """
    Generate an anomaly burst for a live demo.
    """

    logs = generate_anomaly_burst(
        burst_type,
        count,
    )

    results = []

    for line in logs:

        parsed = parse_log_line(
            line
        )

        if not parsed:
            continue

        db_entry = LogEntry(
            **parsed
        )

        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)

        alerts = process_log_entry(
            db_entry,
            db,
        )

        await broadcast_log(
            db_entry,
            alerts,
        )

        results.append(
            {
                "id": db_entry.id,
                "alerts": len(alerts),
            }
        )

    return {
        "message": (
            f"Generated {burst_type} burst "
            f"with {len(results)} logs"
        ),
        "results": results,
    }


# ============================================================
# REST API — SOURCES
# ============================================================

@app.get("/api/logs/sources")
async def get_log_sources(
    db: Session = Depends(get_db),
):
    """
    Get unique log sources.
    """

    sources = (
        db.query(
            LogEntry.source
        )
        .distinct()
        .all()
    )

    return {
        "sources": [
            source[0]
            for source in sources
        ]
    }


# ============================================================
# WEBSOCKET
# ============================================================

@app.websocket("/ws/logs")
async def websocket_logs(
    websocket: WebSocket,
):
    """
    Real-time WebSocket log stream.
    """

    await websocket.accept()

    connected_clients.append(
        websocket
    )

    print(
        "🔌 WebSocket client connected. "
        f"Total: {len(connected_clients)}"
    )

    try:

        while True:

            data = await websocket.receive_text()

            if data == "ping":
                await websocket.send_text(
                    "pong"
                )

    except WebSocketDisconnect:

        if websocket in connected_clients:
            connected_clients.remove(
                websocket
            )

        print(
            "🔌 WebSocket client disconnected. "
            f"Total: {len(connected_clients)}"
        )

    except Exception as error:

        if websocket in connected_clients:
            connected_clients.remove(
                websocket
            )

        print(
            f"🔌 WebSocket error: {error}"
        )


# ============================================================
# WEBSOCKET BROADCAST
# ============================================================

async def broadcast_log(
    log_entry: LogEntry,
    alerts: List[Alert] = None,
):
    """
    Broadcast a processed log to all connected clients.
    """

    message = {
        "type": "log",

        "data": {
            "id": log_entry.id,
            "timestamp": log_entry.timestamp.isoformat(),
            "source": log_entry.source,
            "event_type": log_entry.event_type,
            "level": log_entry.level,
            "message": log_entry.message,
            "source_ip": log_entry.source_ip,
            "user": log_entry.user,
            "raw_log": log_entry.raw_log,
            "is_anomaly": log_entry.is_anomaly,
            "anomaly_type": log_entry.anomaly_type,
            "anomaly_score": log_entry.anomaly_score,
        },
    }

    if alerts:

        message["data"]["alerts"] = [
            {
                "id": alert.id,
                "anomaly_type": alert.anomaly_type,
                "severity": alert.severity,
                "description": alert.description,
                "source_ip": alert.source_ip,
                "user": alert.user,
                "risk_score": alert.risk_score,
            }
            for alert in alerts
        ]

    disconnected = []

    for client in connected_clients:

        try:

            await client.send_text(
                json.dumps(message)
            )

        except Exception:

            disconnected.append(
                client
            )

    for client in disconnected:

        if client in connected_clients:
            connected_clients.remove(
                client
            )


# ============================================================
# BACKGROUND LOG GENERATOR
# ============================================================

@app.post("/api/generator/start")
async def start_generator():
    """
    Start the background log generator.
    """

    global generator_running

    if generator_running:
        return {
            "message": "Background generator already running"
        }

    asyncio.create_task(
        background_generator()
    )

    return {
        "message": "Background generator started"
    }


@app.post("/api/generator/stop")
async def stop_generator():
    """
    Stop the background log generator.
    """

    global generator_running

    generator_running = False

    return {
        "message": "Background generator stopped"
    }


async def background_generator():
    """
    Generate logs continuously in the background.
    """

    global generator_running

    generator_running = True

    db = next(
        get_db()
    )

    print(
        "🔄 Background log generator started"
    )

    try:

        while generator_running:

            try:

                count = random.randint(
                    1,
                    3,
                )

                for _ in range(count):

                    if random.random() < 0.8:

                        line = (
                            log_generator
                            .generate_syslog()
                        )

                    else:

                        line = (
                            log_generator
                            .generate_apache_log()
                        )

                    parsed = parse_log_line(
                        line
                    )

                    if not parsed:
                        continue

                    db_entry = LogEntry(
                        **parsed
                    )

                    db.add(db_entry)
                    db.commit()
                    db.refresh(db_entry)

                    alerts = process_log_entry(
                        db_entry,
                        db,
                    )

                    await broadcast_log(
                        db_entry,
                        alerts,
                    )

                await asyncio.sleep(
                    1
                )

            except Exception as error:

                print(
                    f"Generator error: {error}"
                )

                db.rollback()

                await asyncio.sleep(
                    1
                )

    finally:

        db.close()

        generator_running = False

        print(
            "🔄 Background log generator stopped"
        )


# ============================================================
# SERVER
# ============================================================

if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )