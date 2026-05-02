from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user, require_admin
from app.database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.PlatformStats)
def platform_stats(
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(models.User).count()
    total_clients = db.query(models.User).filter(models.User.role == models.UserRole.client).count()
    total_auditors = db.query(models.User).filter(models.User.role == models.UserRole.auditor).count()
    total_admins = db.query(models.User).filter(models.User.role == models.UserRole.admin).count()
    total_audits = db.query(models.Audit).count()
    pending_audits = db.query(models.Audit).filter(models.Audit.status == models.AuditStatus.pending).count()
    completed_audits = db.query(models.Audit).filter(models.Audit.status == models.AuditStatus.completed).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    pending_approvals = db.query(models.User).filter(
        models.User.role == models.UserRole.auditor,
        models.User.is_approved == False,
    ).count()
    return schemas.PlatformStats(
        total_users=total_users,
        total_clients=total_clients,
        total_auditors=total_auditors,
        total_admins=total_admins,
        total_audits=total_audits,
        pending_audits=pending_audits,
        completed_audits=completed_audits,
        active_users=active_users,
        pending_auditor_approvals=pending_approvals,
    )


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.put("/users/{user_id}/approve")
def approve_auditor(
    user_id: int,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    db.commit()
    notif = models.Notification(
        user_id=user_id,
        message="Your auditor account has been approved! You can now accept audit requests.",
        type=models.NotificationType.system,
    )
    db.add(notif)
    db.commit()
    return {"status": "approved"}


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"status": "deactivated"}


@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"status": "activated"}


@router.get("/audits")
def list_all_audits(
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    audits = db.query(models.Audit).order_by(models.Audit.created_at.desc()).all()
    result = []
    for a in audits:
        d = {c.name: getattr(a, c.name) for c in a.__table__.columns}
        d["client_name"] = a.client.name if a.client else None
        d["auditor_name"] = a.auditor.name if a.auditor else None
        d["client_org_type"] = a.client.org_type if a.client else None
        d["client_floor_area"] = a.client.floor_area_sqft if a.client else None
        result.append(d)
    return result
