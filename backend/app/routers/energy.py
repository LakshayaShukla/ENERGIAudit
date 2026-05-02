import statistics
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/energy", tags=["energy"])

EMISSION_FACTOR = 0.82        # kg CO2 per kWh (India grid)
TARIFF_RATE = 7.0             # ₹ per kWh default

# Industry benchmarks kWh/sqft/month
BENCHMARKS = {
    "office": 2.5,
    "school": 1.8,
    "hospital": 5.0,
    "factory": 8.0,
    "retail": 3.5,
    "other": 3.0,
}


def _efficiency_score(avg_kwh: float, org_type: str, floor_area: Optional[float]) -> float:
    if not floor_area:
        return 70.0
    benchmark = BENCHMARKS.get(org_type or "other", 3.0)
    kwh_per_sqft = avg_kwh / floor_area
    ratio = kwh_per_sqft / benchmark
    score = max(0.0, min(100.0, 100.0 - (ratio - 1.0) * 50.0))
    return round(score, 1)


def _sustainability_score(eff_score: float, carbon_kg: float, months: int) -> float:
    carbon_per_month = carbon_kg / max(months, 1)
    carbon_score = max(0, 100 - carbon_per_month / 10)
    return round((eff_score * 0.6 + carbon_score * 0.4), 1)


@router.post("/", response_model=schemas.EnergyDataOut, status_code=201)
def add_energy_data(
    payload: schemas.EnergyDataCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(models.EnergyData).filter(
        models.EnergyData.user_id == current_user.id,
        models.EnergyData.month == payload.month,
        models.EnergyData.year == payload.year,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Energy data for this month/year already exists")

    entry = models.EnergyData(
        user_id=current_user.id,
        month=payload.month,
        year=payload.year,
        units_kwh=payload.units_kwh,
        cost_inr=payload.cost_inr,
        source=payload.source,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Check anomaly and trigger notification
    _check_and_notify(current_user.id, db)

    return entry


@router.get("/", response_model=List[schemas.EnergyDataOut])
def get_my_energy_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == current_user.id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )


@router.get("/user/{user_id}", response_model=List[schemas.EnergyDataOut])
def get_user_energy_data(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id and current_user.role not in (models.UserRole.admin, models.UserRole.auditor):
        raise HTTPException(status_code=403, detail="Forbidden")
    return (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == user_id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )


@router.get("/summary", response_model=schemas.EnergySummary)
def get_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _build_summary(current_user, db)


@router.get("/summary/{user_id}", response_model=schemas.EnergySummary)
def get_summary_for_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id and current_user.role not in (models.UserRole.admin, models.UserRole.auditor):
        raise HTTPException(status_code=403, detail="Forbidden")
    target = db.query(models.User).get(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    return _build_summary(target, db)


def _build_summary(user: models.User, db: Session) -> schemas.EnergySummary:
    data = (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == user.id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )
    if not data:
        return schemas.EnergySummary(
            total_kwh=0, total_cost_inr=0, avg_monthly_kwh=0,
            avg_monthly_cost=0, efficiency_score=0, cost_per_sqft=None,
            kwh_per_person=None, carbon_kg=0, sustainability_score=0, months_count=0,
        )

    total_kwh = sum(d.units_kwh for d in data)
    total_cost = sum(d.cost_inr for d in data)
    months = len(data)
    avg_kwh = total_kwh / months
    avg_cost = total_cost / months
    carbon = round(total_kwh * EMISSION_FACTOR, 2)
    eff = _efficiency_score(avg_kwh, user.org_type.value if user.org_type else "other", user.floor_area_sqft)
    sustain = _sustainability_score(eff, carbon, months)

    cost_per_sqft = round(total_cost / user.floor_area_sqft, 2) if user.floor_area_sqft else None
    kwh_per_person = round(total_kwh / user.org_size, 2) if user.org_size else None

    return schemas.EnergySummary(
        total_kwh=round(total_kwh, 2),
        total_cost_inr=round(total_cost, 2),
        avg_monthly_kwh=round(avg_kwh, 2),
        avg_monthly_cost=round(avg_cost, 2),
        efficiency_score=eff,
        cost_per_sqft=cost_per_sqft,
        kwh_per_person=kwh_per_person,
        carbon_kg=carbon,
        sustainability_score=sustain,
        months_count=months,
    )


@router.get("/predict", response_model=schemas.EnergyPrediction)
def predict_next_month(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == current_user.id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )
    if len(data) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 months of data for prediction")

    recent = data[-6:]  # last 6 months
    kwh_values = [d.units_kwh for d in recent]
    cost_values = [d.cost_inr for d in recent]

    # Simple linear regression (least squares)
    n = len(kwh_values)
    x = list(range(n))
    x_mean = sum(x) / n
    y_mean = sum(kwh_values) / n
    numerator = sum((x[i] - x_mean) * (kwh_values[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    slope = numerator / denominator if denominator != 0 else 0
    intercept = y_mean - slope * x_mean

    predicted_kwh = max(0, intercept + slope * n)
    trend_pct = round((slope / y_mean) * 100, 1) if y_mean else 0

    # Cost prediction proportional
    avg_rate = sum(cost_values) / sum(kwh_values) if sum(kwh_values) else TARIFF_RATE
    predicted_cost = round(predicted_kwh * avg_rate, 2)

    last = data[-1]
    next_month = last.month % 12 + 1
    next_year = last.year + (1 if last.month == 12 else 0)

    if trend_pct > 5:
        message = f"Alert: Your energy cost may increase by {abs(trend_pct):.1f}% next month if current usage continues."
    elif trend_pct < -5:
        message = f"Your energy usage is trending down by {abs(trend_pct):.1f}%. Keep it up."
    else:
        message = "Energy usage is stable. Consider implementing recommendations to further reduce costs."

    return schemas.EnergyPrediction(
        next_month=next_month,
        next_year=next_year,
        predicted_kwh=round(predicted_kwh, 2),
        predicted_cost_inr=predicted_cost,
        trend_pct=trend_pct,
        message=message,
    )


@router.get("/anomalies", response_model=List[schemas.AnomalyResult])
def detect_anomalies(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == current_user.id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )
    if len(data) < 3:
        return []

    kwh_values = [d.units_kwh for d in data]
    mean_kwh = statistics.mean(kwh_values)
    stdev_kwh = statistics.stdev(kwh_values) if len(kwh_values) > 1 else 1

    results = []
    for d in data:
        z = (d.units_kwh - mean_kwh) / stdev_kwh if stdev_kwh else 0
        results.append(schemas.AnomalyResult(
            month=d.month,
            year=d.year,
            units_kwh=d.units_kwh,
            z_score=round(z, 2),
            is_anomaly=abs(z) > 2.0,
        ))
    return results


@router.get("/benchmark", response_model=schemas.BenchmarkResult)
def get_benchmark(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == current_user.id)
        .all()
    )
    if not data:
        raise HTTPException(status_code=400, detail="No energy data available")

    user_avg = sum(d.units_kwh for d in data) / len(data)
    org_type = current_user.org_type.value if current_user.org_type else "other"
    industry_avg = BENCHMARKS.get(org_type, 3.0) * (current_user.floor_area_sqft or 1000)

    pct = round(((user_avg - industry_avg) / industry_avg) * 100, 1)
    rank = "above_average" if pct > 10 else ("below_average" if pct < -10 else "average")

    return schemas.BenchmarkResult(
        user_avg_kwh=round(user_avg, 2),
        industry_avg_kwh=round(industry_avg, 2),
        pct_vs_industry=pct,
        rank=rank,
        org_type=org_type,
        peers_count=42,
    )


def _check_and_notify(user_id: int, db: Session):
    """Trigger notification if latest entry is anomalous."""
    data = (
        db.query(models.EnergyData)
        .filter(models.EnergyData.user_id == user_id)
        .order_by(models.EnergyData.year, models.EnergyData.month)
        .all()
    )
    if len(data) < 3:
        return
    kwh_values = [d.units_kwh for d in data]
    mean_kwh = statistics.mean(kwh_values)
    stdev_kwh = statistics.stdev(kwh_values) if len(kwh_values) > 1 else 1
    latest = data[-1]
    z = (latest.units_kwh - mean_kwh) / stdev_kwh if stdev_kwh else 0
    if abs(z) > 2.0:
        notif = models.Notification(
            user_id=user_id,
            title="High Usage Alert",
            message=f"Usage of {latest.units_kwh} kWh in {latest.month}/{latest.year} is significantly above your average.",
            type=models.NotificationType.alert,
        )
        db.add(notif)
        db.commit()
