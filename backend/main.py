import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import uvicorn

from database import init_db, get_db, LogEntry, Alert, Metric
from log_parser import parse_log_line
from anomaly_engine import AnomalyEngine
from generator import LogGenerator, generate_logs_batch, generate_anomaly_burst


app = FastAPI(title="IT System Log Analyzer", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize
anomaly_engine = AnomalyEngine()
log_generator = LogGenerator()
connected_clients: List[WebSocket] = []


@app.on_event("startup")
def startup():
    init_db()
    print("✅ Database initialized")
    print("🚀 IT System Log Analyzer started")


# ==================== REST API Routes ====================

@app.post("/api/logs/ingest")
async def ingest_log(log_line: str, db: Session = Depends(get_db)):
    """Ingest a single log line."""
    parsed = parse_log_line(log_line)
    if not parsed:
        raise HTTPException(status_code=400, detail="Could not parse log line")

    db_entry = LogEntry(**parsed)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    # Run anomaly detection
    anomalies = anomaly_engine.analyze(db_entry)
    alerts = []
    for anomaly in anomalies:
        anomaly_engine.update_log_as_anomaly(db_entry.id, anomaly)
        alert = anomaly_engine.create_alert(anomaly, db_entry.id)
        alerts.append(alert)

    # Broadcast to connected WebSocket clients
    await broadcast_log(db_entry, alerts)

    return {
        "log_id": db_entry.id,
        "parsed": parsed,
        "anomalies": [{"type": a.anomaly_type, "severity": a.severity, "description": a.description} for a in alerts],
    }


@app.post("/api/logs/batch")
async def ingest_batch(log_lines: List[str], db: Session = Depends(get_db)):
    """Ingest multiple log lines."""
    results = []
    for line in log_lines:
        parsed = parse_log_line(line)
        if parsed:
            db_entry = LogEntry(**parsed)
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)

            anomalies = anomaly_engine.analyze(db_entry)
            alerts = []
            for anomaly in anomalies:
                anomaly_engine.update_log_as_anomaly(db_entry.id, anomaly)
                alert = anomaly_engine.create_alert(anomaly, db_entry.id)
                alerts.append(alert)

            await broadcast_log(db_entry, alerts)
            results.append({
                "log_id": db_entry.id,
                "anomalies": len(alerts),
            })

    return {"ingested": len(results), "results": results}


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
    """Get log entries with filtering."""
    query = db.query(LogEntry)

    if source:
        query = query.filter(LogEntry.source == source)
    if level:
        query = query.filter(LogEntry.level == level)
    if anomaly_only:
        query = query.filter(LogEntry.is_anomaly == True)
    if search:
        query = query.filter(LogEntry.message.contains(search))

    total = query.count()
    logs = query.order_by(desc(LogEntry.timestamp)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "source": log.source,
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


@app.get("/api/alerts")
async def get_alerts(
    limit: int = 50,
    severity: str = None,
    resolved: bool = None,
    db: Session = Depends(get_db),
):
    """Get alerts."""
    query = db.query(Alert)

    if severity:
        query = query.filter(Alert.severity == severity)
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)

    alerts = query.order_by(desc(Alert.timestamp)).limit(limit).all()

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
            }
            for alert in alerts
        ]
    }


@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    now = datetime.utcnow()
    last_hour = now - timedelta(hours=1)
    last_day = now - timedelta(days=1)

    # Total logs
    total_logs = db.query(func.count(LogEntry.id)).scalar()
    recent_logs = db.query(func.count(LogEntry.id)).filter(LogEntry.timestamp > last_hour).scalar()

    # Anomaly counts
    total_anomalies = db.query(func.count(LogEntry.id)).filter(LogEntry.is_anomaly == True).scalar()
    recent_anomalies = db.query(func.count(LogEntry.id)).filter(
        LogEntry.is_anomaly == True, LogEntry.timestamp > last_hour
    ).scalar()

    # Alert counts by severity
    severity_counts = db.query(
        Alert.severity, func.count(Alert.id)
    ).group_by(Alert.severity).all()

    # Recent alerts
    recent_alerts = db.query(Alert).filter(Alert.timestamp > last_hour).count()

    # Logs by source
    source_counts = db.query(
        LogEntry.source, func.count(LogEntry.id)
    ).group_by(LogEntry.source).order_by(desc(func.count(LogEntry.id))).limit(10).all()

    # Logs by level
    level_counts = db.query(
        LogEntry.level, func.count(LogEntry.id)
    ).group_by(LogEntry.level).all()

    # Anomaly types
    anomaly_type_counts = db.query(
        LogEntry.anomaly_type, func.count(LogEntry.id)
    ).filter(LogEntry.is_anomaly == True).group_by(LogEntry.anomaly_type).all()

    # Top IPs by anomaly count
    top_anomaly_ips = db.query(
        LogEntry.source_ip, func.count(LogEntry.id)
    ).filter(LogEntry.is_anomaly == True, LogEntry.source_ip.isnot(None)).group_by(
        LogEntry.source_ip
    ).order_by(desc(func.count(LogEntry.id))).limit(10).all()

    return {
        "total_logs": total_logs,
        "recent_logs": recent_logs,
        "total_anomalies": total_anomalies,
        "recent_anomalies": recent_anomalies,
        "recent_alerts": recent_alerts,
        "severity_counts": {s: c for s, c in severity_counts},
        "source_counts": {s: c for s, c in source_counts},
        "level_counts": {l: c for l, c in level_counts},
        "anomaly_type_counts": {t: c for t, c in anomaly_type_counts if t},
        "top_anomaly_ips": {ip: c for ip, c in top_anomaly_ips},
        "anomaly_rate": round((total_anomalies / total_logs * 100) if total_logs > 0 else 0, 2),
    }


@app.get("/api/stats/timeline")
async def get_timeline(hours: int = 24, db: Session = Depends(get_db)):
    """Get log counts over time for charts."""
    now = datetime.utcnow()
    start = now - timedelta(hours=hours)

    # Get logs grouped by hour
    logs = db.query(LogEntry).filter(LogEntry.timestamp >= start).all()

    # Group by hour
    hourly_data = defaultdict(lambda: {"total": 0, "anomalies": 0})
    for log in logs:
        hour_key = log.timestamp.strftime("%Y-%m-%d %H:00")
        hourly_data[hour_key]["total"] += 1
        if log.is_anomaly:
            hourly_data[hour_key]["anomalies"] += 1

    timeline = [
        {"timestamp": k, "total": v["total"], "anomalies": v["anomalies"]}
        for k, v in sorted(hourly_data.items())
    ]

    return {"timeline": timeline}


@app.post("/api/generate/sample")
async def generate_sample_data(count: int = 100, db: Session = Depends(get_db)):
    """Generate sample log data for demo."""
    logs = generate_logs_batch(count, include_anomalies=True)

    # Also add some brute force bursts
    if count > 20:
        logs.extend(generate_anomaly_burst("brute_force", 15))
        logs.extend(generate_anomaly_burst("port_scan", 10))
        logs.extend(generate_anomaly_burst("privilege", 5))

    results = []
    for line in logs:
        parsed = parse_log_line(line)
        if parsed:
            db_entry = LogEntry(**parsed)
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)

            anomalies = anomaly_engine.analyze(db_entry)
            for anomaly in anomalies:
                anomaly_engine.update_log_as_anomaly(db_entry.id, anomaly)
                anomaly_engine.create_alert(anomaly, db_entry.id)

            results.append(db_entry.id)

    return {
        "message": f"Generated {len(results)} sample logs",
        "total_logs": db.query(func.count(LogEntry.id)).scalar(),
        "total_anomalies": db.query(func.count(LogEntry.id)).filter(LogEntry.is_anomaly == True).scalar(),
    }


@app.post("/api/generate/burst")
async def generate_anomaly_burst_endpoint(burst_type: str = "brute_force", count: int = 20, db: Session = Depends(get_db)):
    """Generate an anomaly burst for live demo."""
    logs = generate_anomaly_burst(burst_type, count)

    results = []
    for line in logs:
        parsed = parse_log_line(line)
        if parsed:
            db_entry = LogEntry(**parsed)
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)

            anomalies = anomaly_engine.analyze(db_entry)
            alerts = []
            for anomaly in anomalies:
                anomaly_engine.update_log_as_anomaly(db_entry.id, anomaly)
                alert = anomaly_engine.create_alert(anomaly, db_entry.id)
                alerts.append(alert)

            await broadcast_log(db_entry, alerts)
            results.append({"id": db_entry.id, "alerts": len(alerts)})

    return {
        "message": f"Generated {burst_type} burst with {len(results)} logs",
        "results": results,
    }


@app.get("/api/logs/sources")
async def get_log_sources(db: Session = Depends(get_db)):
    """Get unique log sources."""
    sources = db.query(LogEntry.source).distinct().all()
    return {"sources": [s[0] for s in sources]}


# ==================== WebSocket ====================

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    """WebSocket endpoint for real-time log streaming."""
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"🔌 WebSocket client connected. Total: {len(connected_clients)}")

    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"🔌 WebSocket client disconnected. Total: {len(connected_clients)}")
    except Exception as e:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        print(f"🔌 WebSocket error: {e}")


async def broadcast_log(log_entry: LogEntry, alerts: List[Alert] = None):
    """Broadcast a log entry to all connected WebSocket clients."""
    message = {
        "type": "log",
        "data": {
            "id": log_entry.id,
            "timestamp": log_entry.timestamp.isoformat(),
            "source": log_entry.source,
            "level": log_entry.level,
            "message": log_entry.message,
            "source_ip": log_entry.source_ip,
            "user": log_entry.user,
            "raw_log": log_entry.raw_log,
            "is_anomaly": log_entry.is_anomaly,
            "anomaly_type": log_entry.anomaly_type,
            "anomaly_score": log_entry.anomaly_score,
        }
    }

    if alerts:
        message["data"]["alerts"] = [
            {
                "id": a.id,
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "description": a.description,
                "source_ip": a.source_ip,
                "user": a.user,
            }
            for a in alerts
        ]

    # Broadcast to all connected clients
    disconnected = []
    for client in connected_clients:
        try:
            await client.send_text(json.dumps(message))
        except Exception:
            disconnected.append(client)

    for client in disconnected:
        connected_clients.remove(client)


# ==================== Background Log Generator ====================

@app.post("/api/generator/start")
async def start_generator():
    """Start the background log generator."""
    asyncio.create_task(background_generator())
    return {"message": "Background generator started"}


@app.post("/api/generator/stop")
async def stop_generator():
    """Stop the background log generator."""
    global generator_running
    generator_running = False
    return {"message": "Background generator stopped"}


generator_running = False


async def background_generator():
    """Background task that generates logs continuously."""
    global generator_running
    generator_running = True
    db = next(get_db())

    print("🔄 Background log generator started")

    while generator_running:
        try:
            # Generate 1-3 logs per second
            count = random.randint(1, 3)
            for _ in range(count):
                if random.random() < 0.8:
                    line = log_generator.generate_syslog()
                else:
                    line = log_generator.generate_apache_log()

                parsed = parse_log_line(line)
                if parsed:
                    db_entry = LogEntry(**parsed)
                    db.add(db_entry)
                    db.commit()
                    db.refresh(db_entry)

                    anomalies = anomaly_engine.analyze(db_entry)
                    alerts = []
                    for anomaly in anomalies:
                        anomaly_engine.update_log_as_anomaly(db_entry.id, anomaly)
                        alert = anomaly_engine.create_alert(anomaly, db_entry.id)
                        alerts.append(alert)

                    await broadcast_log(db_entry, alerts)

            await asyncio.sleep(1)  # Generate every second
        except Exception as e:
            print(f"Generator error: {e}")
            await asyncio.sleep(1)

    db.close()
    print("🔄 Background log generator stopped")


import random


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
