from datetime import datetime

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Float,
    Boolean,
    Text,
)

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_URL = "sqlite:///./logs.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


# ============================================================
# LOG ENTRY
# ============================================================

class LogEntry(Base):

    __tablename__ = "log_entries"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    timestamp = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # Log classification
    # --------------------------------------------------------

    source = Column(
        String(100),
        nullable=False,
        index=True,
    )

    event_type = Column(
        String(100),
        nullable=True,
        index=True,
    )

    level = Column(
        String(20),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # Authentication / network information
    # --------------------------------------------------------

    username = Column(
        String(100),
        nullable=True,
        index=True,
    )

    ip_address = Column(
        String(50),
        nullable=True,
        index=True,
    )

    status_code = Column(
        Integer,
        nullable=True,
    )

    # --------------------------------------------------------
    # Log content
    # --------------------------------------------------------

    message = Column(
        Text,
        nullable=False,
    )

    raw_message = Column(
        Text,
        nullable=True,
    )

    # --------------------------------------------------------
    # Backward-compatible fields
    # --------------------------------------------------------

    source_ip = Column(
        String(50),
        nullable=True,
    )

    user = Column(
        String(100),
        nullable=True,
    )

    raw_log = Column(
        Text,
        nullable=False,
    )

    # --------------------------------------------------------
    # Anomaly information
    # --------------------------------------------------------

    is_anomaly = Column(
        Boolean,
        default=False,
        index=True,
    )

    anomaly_type = Column(
        String(100),
        nullable=True,
    )

    anomaly_score = Column(
        Float,
        default=0.0,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# ALERT
# ============================================================

class Alert(Base):

    __tablename__ = "alerts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        index=True,
    )

    anomaly_type = Column(
        String(100),
        nullable=False,
    )

    severity = Column(
        String(20),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=False,
    )

    source_ip = Column(
        String(50),
        nullable=True,
    )

    user = Column(
        String(100),
        nullable=True,
    )

    resolved = Column(
        Boolean,
        default=False,
        index=True,
    )

    log_entry_id = Column(
        Integer,
        nullable=True,
    )

    # --------------------------------------------------------
    # Risk scoring
    # --------------------------------------------------------

    risk_score = Column(
        Float,
        default=0.0,
    )


# ============================================================
# METRICS
# ============================================================

class Metric(Base):

    __tablename__ = "metrics"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
    )

    metric_type = Column(
        String(50),
        nullable=False,
    )

    value = Column(
        Float,
        nullable=False,
    )

    label = Column(
        String(100),
        nullable=True,
    )


# ============================================================
# DATABASE SESSION
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# INITIALIZATION
# ============================================================

def init_db():

    Base.metadata.create_all(
        bind=engine,
    )