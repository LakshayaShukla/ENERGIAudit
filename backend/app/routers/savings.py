from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/savings", tags=["savings"])


@router.get("/", response_model=List[schemas.SavingsOut])
def get_my_savings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Savings)
        .filter(models.Savings.user_id == current_user.id)
        .order_by(models.Savings.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.SavingsOut, status_code=201)
def create_savings(
    payload: schemas.SavingsCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saving = models.Savings(
        user_id=current_user.id,
        audit_id=payload.audit_id,
        period_before=payload.period_before,
        period_after=payload.period_after,
        before_usage_kwh=payload.before_usage_kwh,
        after_usage_kwh=payload.after_usage_kwh,
        savings_amount_inr=payload.savings_amount_inr,
        pct_improvement=payload.pct_improvement,
    )
    db.add(saving)
    db.commit()
    db.refresh(saving)

    if payload.pct_improvement >= 20:
        existing = db.query(models.Badge).filter(
            models.Badge.user_id == current_user.id,
            models.Badge.badge_type == models.BadgeType.top_saver,
        ).first()
        if not existing:
            badge = models.Badge(user_id=current_user.id, badge_type=models.BadgeType.top_saver)
            db.add(badge)
            db.commit()
    return saving
