from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/badges", tags=["badges"])


@router.get("/", response_model=List[schemas.BadgeOut])
def get_my_badges(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Badge)
        .filter(models.Badge.user_id == current_user.id)
        .order_by(models.Badge.awarded_at.desc())
        .all()
    )
