# 🛡️ IT System Log Analyzer - SIH1408

> **Smart India Hackathon 2024** | Real-time System Log Analysis with Anomaly Detection

A comprehensive IT system log analyzer that ingests, parses, and detects anomalies from system logs in real-time. Built with a modern web dashboard for monitoring and alerting.

## 🎯 Problem Statement

**SIH1408: IT System Log Analyzer**

Organizations generate massive volumes of system logs daily. Manually monitoring these logs for security threats, anomalies, and system issues is impractical. This project provides an automated solution for:
- Real-time log ingestion and parsing
- Rule-based anomaly detection
- Live dashboard monitoring
- Alert generation and tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │Dashboard │  │Live Logs │  │  Alerts  │  │   Charts     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       └──────────────┴─────────────┴───────────────┘           │
│                         WebSocket + REST                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ Log Ingestion│  │   Anomaly    │  │   Log Generator   │    │
│  │    & Parser  │  │   Engine     │  │   (Fake Streams)  │    │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘    │
│         └─────────────────┴─────────────────────┘              │
│                         SQLite DB                               │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Core Features
- **📥 Log Ingestion**: Accept logs via REST API from any source
- **🔍 Smart Parsing**: Parse syslog, Apache, kernel, and custom log formats
- **🧠 Anomaly Detection**: 10+ rule-based detection algorithms
- **📊 Real-time Dashboard**: Live monitoring with WebSocket updates
- **🚨 Alert System**: Severity-based alerting (CRITICAL/HIGH/MEDIUM/LOW)

### Anomaly Detection Rules
1. **Brute Force Attack** - Multiple failed login attempts from same IP
2. **Invalid User Access** - Login attempts with non-existent usernames
3. **Unusual Hour Activity** - Suspicious activity during off-hours (1-5 AM)
4. **Privilege Escalation** - Unauthorized sudo/su attempts
5. **Port Scanning** - Multiple port access from single IP
6. **Data Exfiltration** - Suspicious file transfer commands
7. **Admin Direct Login** - Direct root/admin SSH access
8. **System Crash** - Segmentation faults and crashes
9. **High Severity Logs** - ERROR/CRITICAL level entries
10. **Failed Authentication** - General auth failures

### Dashboard Features
- **Stats Cards**: Total logs, anomalies, rates, alerts
- **Timeline Chart**: 24-hour log activity visualization
- **Severity Distribution**: Pie chart of alert severities
- **Source Analysis**: Bar chart of logs by source
- **Top Anomaly IPs**: Ranked list of suspicious IPs
- **Live Log Stream**: Real-time log viewer with filtering

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone & Setup Backend

```bash
# Navigate to project
cd IT-System-Log-Analyzer

# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### 2. Setup Frontend

```bash
# In a new terminal
cd frontend
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Access the Dashboard

Open your browser and go to: **http://localhost:3000**

## 📖 Usage Guide

### Step 1: Generate Sample Data
Click the **"📊 Generate 200 Logs"** button in the header to create sample log data with built-in anomalies.

### Step 2: Start Live Generator
Click **"▶ Start Generator"** to begin real-time log generation (1-3 logs per second).

### Step 3: Trigger Anomaly Bursts
Use the **"⚡ Anomaly Burst"** dropdown to simulate:
- 🔐 Brute Force attacks
- 🔍 Port scanning activity
- 👑 Privilege escalation attempts

### Step 4: Monitor Dashboard
- **Dashboard Tab**: Overview of stats and charts
- **Live Logs Tab**: Filterable real-time log viewer
- **Alerts Tab**: Detailed alert management

## 🔌 API Reference

### Log Ingestion
```bash
# Single log
POST /api/logs/ingest?log_line=<your_log>

# Batch logs
POST /api/logs/batch
Body: ["log1", "log2", ...]
```

### Data Retrieval
```bash
# Get logs (with filters)
GET /api/logs?limit=100&anomaly_only=true&source=sshd

# Get alerts
GET /api/alerts?severity=CRITICAL

# Get statistics
GET /api/stats

# Get timeline
GET /api/stats/timeline?hours=24
```

### Data Generation
```bash
# Generate sample data
POST /api/generate/sample?count=200

# Generate anomaly burst
POST /api/generate/burst?burst_type=brute_force&count=20
```

### Real-time Streaming
```javascript
// WebSocket connection
const ws = new WebSocket('ws://localhost:8000/ws/logs');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New log:', data);
};
```

## 🗂️ Project Structure

```
IT-System-Log-Analyzer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy models & DB setup
│   ├── log_parser.py        # Log parsing utilities
│   ├── anomaly_engine.py    # Anomaly detection rules
│   ├── generator.py         # Fake log generator
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Tailwind CSS styles
│   ├── index.html           # HTML template
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   └── postcss.config.js    # PostCSS configuration
│
└── README.md                # This file
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python, FastAPI, SQLAlchemy |
| **Frontend** | React, Vite, TailwindCSS |
| **Database** | SQLite (file-based) |
| **Real-time** | WebSocket |
| **Charts** | Recharts |
| **Styling** | TailwindCSS |

## 🎨 UI Features

- **Dark Theme**: Professional cybersecurity-inspired design
- **Responsive**: Works on desktop and tablet
- **Real-time Updates**: WebSocket-powered live data
- **Interactive Charts**: Hover tooltips and legends
- **Animated Alerts**: Visual attention for critical issues
- **Log Syntax Highlighting**: Color-coded severity levels

## 🔒 Anomaly Detection Rules (Detailed)

### 1. Brute Force Detection
- **Trigger**: ≥5 failed login attempts from same IP within 10 minutes
- **Severity**: CRITICAL
- **Action**: Alert generated, IP flagged

### 2. Port Scanning
- **Trigger**: ≥20 unique ports accessed from single IP within 5 minutes
- **Severity**: HIGH
- **Action**: Alert generated

### 3. Privilege Escalation
- **Trigger**: sudo/su commands, chmod 777, chown root
- **Severity**: MEDIUM-HIGH
- **Action**: Alert generated with command details

### 4. Unusual Hour Activity
- **Trigger**: Auth-related activity between 1-5 AM
- **Severity**: MEDIUM
- **Action**: Alert for investigation

### 5. Data Exfiltration
- **Trigger**: curl/wget to external, scp/rsync, accessing /etc/passwd or /etc/shadow
- **Severity**: HIGH
- **Action**: Critical alert

## 📊 Dashboard Metrics

- **Total Logs**: All ingested log entries
- **Anomaly Rate**: Percentage of anomalous logs
- **Alert Counts**: By severity level
- **Top Offending IPs**: Ranked by anomaly count
- **Source Distribution**: Logs by service/process
- **Timeline**: Hourly log volume

## 🧪 Testing

### Test Backend API
```bash
# Generate sample data
curl -X POST "http://localhost:8000/api/generate/sample?count=100"

# Check stats
curl "http://localhost:8000/api/stats"

# Get recent logs
curl "http://localhost:8000/api/logs?limit=10"
```

### Test Anomaly Detection
```bash
# Trigger brute force burst
curl -X POST "http://localhost:8000/api/generate/burst?burst_type=brute_force&count=20"

# Check alerts
curl "http://localhost:8000/api/alerts?severity=CRITICAL"
```

## 🚧 Future Enhancements

- [ ] Machine Learning-based anomaly detection
- [ ] User authentication & multi-tenancy
- [ ] Log export (CSV/JSON)
- [ ] Custom rule configuration
- [ ] Email/SMS alert notifications
- [ ] Log retention policies
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Elasticsearch integration
- [ ] Grafana dashboard export

## 👥 Team

Built for **Smart India Hackathon 2024**

- **Log Ingestion/Parsing Module**
- **Anomaly Detection Engine**
- **Web Dashboard**
- **Fake Log Stream Generator**

## 📄 License

MIT License - Feel free to use and modify for your hackathon!

## 🙏 Acknowledgments

- FastAPI for the amazing async framework
- React + Vite for fast frontend development
- TailwindCSS for beautiful styling
- Recharts for interactive visualizations

---

**Built with ❤️ for SIH1408**
