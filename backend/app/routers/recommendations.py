from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

RULES = [
    {
        "id": 1,
        "condition": lambda avg_kwh, score, hour: avg_kwh > 5000,
        "title": "Reduce Peak Hour Usage",
        "description": "Your usage spikes during 9AM–6PM. Shift heavy equipment to off-peak hours to save up to 20% on costs.",
        "tags": ["High Impact", "Quick Win"],
        "potential_savings_pct": 20,
    },
    {
        "id": 2,
        "condition": lambda avg_kwh, score, hour: score < 60,
        "title": "Upgrade to LED Lighting",
        "description": "LED systems use 75% less energy than traditional lighting. Estimated payback period: 12–18 months.",
        "tags": ["Low Cost", "Quick Win"],
        "potential_savings_pct": 15,
    },
    {
        "id": 3,
        "condition": lambda avg_kwh, score, hour: score < 70,
        "title": "Optimize HVAC Schedule",
        "description": "Program HVAC to run only during occupied hours. This can reduce cooling/heating costs by up to 30%.",
        "tags": ["High Impact", "Low Cost"],
        "potential_savings_pct": 30,
    },
    {
        "id": 4,
        "condition": lambda avg_kwh, score, hour: avg_kwh > 3000,
        "title": "Install Solar Panels",
        "description": "With your current consumption, rooftop solar can offset 40–60% of your electricity bill.",
        "tags": ["High Impact"],
        "potential_savings_pct": 50,
    },
    {
        "id": 5,
        "condition": lambda avg_kwh, score, hour: True,
        "title": "Enable Power Management on Computers",
        "description": "Enable sleep mode and power-saving settings on all computers and monitors to cut idle consumption.",
        "tags": ["Quick Win", "Low Cost"],
        "potential_savings_pct": 5,
    },
    {
        "id": 6,
        "condition": lambda avg_kwh, score, hour: avg_kwh > 2000,
        "title": "Energy Audit for HVAC Equipment",
        "description": "Aging HVAC units can consume 40% more energy. Schedule a maintenance check to improve efficiency.",
        "tags": ["High Impact"],
        "potential_savings_pct": 25,
    },
    {
        "id": 7,
        "condition": lambda avg_kwh, score, hour: score < 80,
        "title": "Install Smart Energy Meters",
        "description": "Real-time sub-metering helps identify wasteful departments and reduce energy by up to 10%.",
        "tags": ["Low Cost"],
        "potential_savings_pct": 10,
    },
]


@router.get("/")
def get_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = db.query(models.EnergyData).filter(
        models.EnergyData.user_id == current_user.id
    ).all()

    avg_kwh = sum(d.units_kwh for d in data) / len(data) if data else 0

    # Get efficiency score (reuse simple calculation)
    from app.routers.energy import _efficiency_score
    score = _efficiency_score(
        avg_kwh,
        current_user.org_type.value if current_user.org_type else "other",
        current_user.floor_area_sqft,
    )

    results = []
    for rule in RULES:
        if rule["condition"](avg_kwh, score, 0):
            results.append({
                "id": rule["id"],
                "title": rule["title"],
                "description": rule["description"],
                "tags": rule["tags"],
                "potential_savings_pct": rule["potential_savings_pct"],
            })

    return results
