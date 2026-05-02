from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    auditor = "auditor"
    client = "client"


class OrgType(str, enum.Enum):
    office = "office"
    school = "school"
    hospital = "hospital"
    factory = "factory"
    retail = "retail"
    other = "other"


class AuditStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"


class BadgeType(str, enum.Enum):
    energy_efficient = "energy_efficient"
    carbon_reducer = "carbon_reducer"
    quick_adopter = "quick_adopter"
    top_saver = "top_saver"


class NotificationType(str, enum.Enum):
    audit_update = "audit_update"
    recommendation = "recommendation"
    alert = "alert"
    system = "system"


# ── Users ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.client, nullable=False)
    org_type = Column(SAEnum(OrgType), nullable=True)
    org_size = Column(Integer, nullable=True)          # number of employees/students
    floor_area_sqft = Column(Float, nullable=True)     # sq feet
    about = Column(Text, nullable=True)                # company briefing
    location = Column(String(255), nullable=True)      # city, state
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)        # auditors need admin approval
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    energy_data = relationship("EnergyData", back_populates="user", cascade="all, delete")
    client_audits = relationship("Audit", foreign_keys="Audit.client_id", back_populates="client", cascade="all, delete")
    auditor_audits = relationship("Audit", foreign_keys="Audit.auditor_id", back_populates="auditor")
    savings = relationship("Savings", back_populates="user", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    roi_calcs = relationship("ROICalculation", back_populates="user", cascade="all, delete")
    badges = relationship("Badge", back_populates="user", cascade="all, delete")


# ── Energy Data ────────────────────────────────────────────────────────────────
class EnergyData(Base):
    __tablename__ = "energy_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)   # 1–12
    year = Column(Integer, nullable=False)
    units_kwh = Column(Float, nullable=False)
    cost_inr = Column(Float, nullable=False)
    source = Column(String(50), default="manual")  # manual | simulated
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="energy_data")


# ── Audits ─────────────────────────────────────────────────────────────────────
class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    auditor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(SAEnum(AuditStatus), default=AuditStatus.pending)
    report_url = Column(String(500), nullable=True)
    recommendations = Column(Text, nullable=True)
    efficiency_score = Column(Float, nullable=True)        # 0–100
    estimated_savings_inr = Column(Float, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    client = relationship("User", foreign_keys=[client_id], back_populates="client_audits")
    auditor = relationship("User", foreign_keys=[auditor_id], back_populates="auditor_audits")


# ── Savings ────────────────────────────────────────────────────────────────────
class Savings(Base):
    __tablename__ = "savings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=True)
    period_before = Column(String(20))   # e.g. "2024-Q1"
    period_after = Column(String(20))
    before_usage_kwh = Column(Float)
    after_usage_kwh = Column(Float)
    savings_amount_inr = Column(Float)
    pct_improvement = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="savings")


# ── Notifications ──────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    type = Column(SAEnum(NotificationType), default=NotificationType.system)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# ── ROI Calculations ───────────────────────────────────────────────────────────
class ROICalculation(Base):
    __tablename__ = "roi_calculations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    investment_inr = Column(Float, nullable=False)
    monthly_savings_inr = Column(Float, nullable=False)
    payback_months = Column(Float, nullable=False)
    roi_pct = Column(Float, nullable=False)
    investment_type = Column(String(100), nullable=True)  # solar, LED, HVAC…
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roi_calcs")


# ── Badges ─────────────────────────────────────────────────────────────────────
class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_type = Column(SAEnum(BadgeType), nullable=False)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="badges")
