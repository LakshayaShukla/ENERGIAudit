from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/roi", tags=["roi"])


@router.post("/calculate", response_model=schemas.ROIOut, status_code=201)
def calculate_roi(
    payload: schemas.ROICreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payback = round(payload.investment_inr / payload.monthly_savings_inr, 1)
    annual_savings = payload.monthly_savings_inr * 12
    roi_pct = round(((annual_savings - payload.investment_inr) / payload.investment_inr) * 100, 1)

    roi = models.ROICalculation(
        user_id=current_user.id,
        investment_inr=payload.investment_inr,
        monthly_savings_inr=payload.monthly_savings_inr,
        payback_months=payback,
        roi_pct=roi_pct,
        investment_type=payload.investment_type,
    )
    db.add(roi)
    db.commit()
    db.refresh(roi)
    return roi


@router.get("/", response_model=List[schemas.ROIOut])
def get_roi_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ROICalculation)
        .filter(models.ROICalculation.user_id == current_user.id)
        .order_by(models.ROICalculation.created_at.desc())
        .all()
    )
