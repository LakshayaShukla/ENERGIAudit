from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    admin = "admin"
    auditor = "auditor"
    client = "client"


class OrgType(str, Enum):
    office = "office"
    school = "school"
    hospital = "hospital"
    factory = "factory"
    retail = "retail"
    other = "other"


class AuditStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"


class NotificationType(str, Enum):
    audit_update = "audit_update"
    recommendation = "recommendation"
    alert = "alert"
    system = "system"


class BadgeType(str, Enum):
    energy_efficient = "energy_efficient"
    carbon_reducer = "carbon_reducer"
    quick_adopter = "quick_adopter"
    top_saver = "top_saver"


# ── Auth ───────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.client
    org_type: Optional[OrgType] = None
    org_size: Optional[int] = Field(None, ge=1)
    floor_area_sqft: Optional[float] = Field(None, ge=1)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    name: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    org_type: Optional[OrgType] = None
    org_size: Optional[int] = None
    floor_area_sqft: Optional[float] = None
    about: Optional[str] = None
    location: Optional[str] = None
    is_active: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Energy Data ────────────────────────────────────────────────────────────────
class EnergyDataCreate(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    units_kwh: float = Field(..., gt=0)
    cost_inr: float = Field(..., gt=0)
    source: str = "manual"


class EnergyDataOut(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    units_kwh: float
    cost_inr: float
    source: str
    created_at: datetime

    class Config:
        from_attributes = True


class EnergySummary(BaseModel):
    total_kwh: float
    total_cost_inr: float
    avg_monthly_kwh: float
    avg_monthly_cost: float
    efficiency_score: float
    cost_per_sqft: Optional[float]
    kwh_per_person: Optional[float]
    carbon_kg: float
    sustainability_score: float
    months_count: int


class EnergyPrediction(BaseModel):
    next_month: int
    next_year: int
    predicted_kwh: float
    predicted_cost_inr: float
    trend_pct: float
    message: str


class AnomalyResult(BaseModel):
    month: int
    year: int
    units_kwh: float
    z_score: float
    is_anomaly: bool


# ── Audits ─────────────────────────────────────────────────────────────────────
class AuditRequest(BaseModel):
    notes: Optional[str] = None


class AuditComplete(BaseModel):
    recommendations: str
    efficiency_score: float = Field(..., ge=0, le=100)
    estimated_savings_inr: float = Field(..., ge=0)
    report_url: Optional[str] = None


class AuditReject(BaseModel):
    rejection_reason: str


class AuditOut(BaseModel):
    id: int
    client_id: int
    auditor_id: Optional[int]
    status: AuditStatus
    report_url: Optional[str]
    recommendations: Optional[str]
    efficiency_score: Optional[float]
    estimated_savings_inr: Optional[float]
    rejection_reason: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    client_name: Optional[str] = None
    auditor_name: Optional[str] = None
    client_org_type: Optional[str] = None
    client_floor_area: Optional[float] = None
    client_org_size: Optional[int] = None
    client_about: Optional[str] = None
    client_location: Optional[str] = None

    class Config:
        from_attributes = True


# ── Savings ────────────────────────────────────────────────────────────────────
class SavingsCreate(BaseModel):
    audit_id: Optional[int] = None
    period_before: str
    period_after: str
    before_usage_kwh: float = Field(..., gt=0)
    after_usage_kwh: float = Field(..., gt=0)
    savings_amount_inr: float
    pct_improvement: float


class SavingsOut(BaseModel):
    id: int
    user_id: int
    audit_id: Optional[int]
    period_before: str
    period_after: str
    before_usage_kwh: float
    after_usage_kwh: float
    savings_amount_inr: float
    pct_improvement: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notifications ──────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── ROI ────────────────────────────────────────────────────────────────────────
class ROICreate(BaseModel):
    investment_inr: float = Field(..., gt=0)
    monthly_savings_inr: float = Field(..., gt=0)
    investment_type: Optional[str] = None


class ROIOut(BaseModel):
    id: int
    user_id: int
    investment_inr: float
    monthly_savings_inr: float
    payback_months: float
    roi_pct: float
    investment_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Badges ─────────────────────────────────────────────────────────────────────
class BadgeOut(BaseModel):
    id: int
    user_id: int
    badge_type: BadgeType
    awarded_at: datetime

    class Config:
        from_attributes = True


# ── Admin Stats ────────────────────────────────────────────────────────────────
class PlatformStats(BaseModel):
    total_users: int
    total_clients: int
    total_auditors: int
    total_admins: int
    total_audits: int
    pending_audits: int
    completed_audits: int
    active_users: int
    pending_auditor_approvals: int


# ── Benchmarking ───────────────────────────────────────────────────────────────
class BenchmarkResult(BaseModel):
    user_avg_kwh: float
    industry_avg_kwh: float
    pct_vs_industry: float
    rank: str        # "above_average" | "average" | "below_average"
    org_type: str
    peers_count: int
