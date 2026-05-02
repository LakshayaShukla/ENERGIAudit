from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user, require_auditor
from app.database import get_db

router = APIRouter(prefix="/api/audits", tags=["audits"])


def _enrich(audit: models.Audit) -> dict:
    d = {c.name: getattr(audit, c.name) for c in audit.__table__.columns}
    d["client_name"] = audit.client.name if audit.client else None
    d["auditor_name"] = audit.auditor.name if audit.auditor else None
    d["client_org_type"] = audit.client.org_type if audit.client else None
    d["client_floor_area"] = audit.client.floor_area_sqft if audit.client else None
    d["client_org_size"] = audit.client.org_size if audit.client else None
    d["client_about"] = audit.client.about if audit.client else None
    d["client_location"] = audit.client.location if audit.client else None
    return d


@router.post("/request", status_code=201)
def request_audit(
    payload: schemas.AuditRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != models.UserRole.client:
        raise HTTPException(status_code=403, detail="Only clients can request audits")

    # Check no pending audit already
    pending = db.query(models.Audit).filter(
        models.Audit.client_id == current_user.id,
        models.Audit.status.in_([models.AuditStatus.pending, models.AuditStatus.in_progress]),
    ).first()
    if pending:
        raise HTTPException(status_code=400, detail="You already have an active audit request")

    audit = models.Audit(
        client_id=current_user.id,
        notes=payload.notes,
        status=models.AuditStatus.pending,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    notif = models.Notification(
        user_id=current_user.id,
        message="Your audit request has been submitted. An auditor will be assigned shortly.",
        type=models.NotificationType.audit_update,
    )
    db.add(notif)
    db.commit()
    return _enrich(audit)


@router.get("/", response_model=List[schemas.AuditOut])
def list_audits(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Audit)
    if current_user.role == models.UserRole.client:
        q = q.filter(models.Audit.client_id == current_user.id)
    elif current_user.role == models.UserRole.auditor:
        q = q.filter(
            (models.Audit.auditor_id == current_user.id) |
            (models.Audit.status == models.AuditStatus.pending)
        )
    audits = q.order_by(models.Audit.created_at.desc()).all()
    return [schemas.AuditOut(**_enrich(a)) for a in audits]


@router.get("/{audit_id}")
def get_audit(
    audit_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    audit = db.query(models.Audit).get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if current_user.role == models.UserRole.client and audit.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return _enrich(audit)


@router.put("/{audit_id}/accept")
def accept_audit(
    audit_id: int,
    current_user: models.User = Depends(require_auditor),
    db: Session = Depends(get_db),
):
    audit = db.query(models.Audit).get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if audit.status != models.AuditStatus.pending:
        raise HTTPException(status_code=400, detail="Audit is not in pending state")

    audit.auditor_id = current_user.id
    audit.status = models.AuditStatus.in_progress
    db.commit()
    db.refresh(audit)

    notif = models.Notification(
        user_id=audit.client_id,
        message=f"Your audit has been accepted by {current_user.name} and is now in progress.",
        type=models.NotificationType.audit_update,
    )
    db.add(notif)
    db.commit()
    return _enrich(audit)


@router.put("/{audit_id}/reject")
def reject_audit(
    audit_id: int,
    payload: schemas.AuditReject,
    current_user: models.User = Depends(require_auditor),
    db: Session = Depends(get_db),
):
    audit = db.query(models.Audit).get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    audit.status = models.AuditStatus.rejected
    audit.rejection_reason = payload.rejection_reason
    db.commit()
    db.refresh(audit)

    notif = models.Notification(
        user_id=audit.client_id,
        message=f"Your audit request was rejected. Reason: {payload.rejection_reason}",
        type=models.NotificationType.audit_update,
    )
    db.add(notif)
    db.commit()
    return _enrich(audit)


@router.put("/{audit_id}/complete")
def complete_audit(
    audit_id: int,
    payload: schemas.AuditComplete,
    current_user: models.User = Depends(require_auditor),
    db: Session = Depends(get_db),
):
    audit = db.query(models.Audit).get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if audit.auditor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Forbidden")

    audit.status = models.AuditStatus.completed
    audit.recommendations = payload.recommendations
    audit.efficiency_score = payload.efficiency_score
    audit.estimated_savings_inr = payload.estimated_savings_inr
    audit.report_url = payload.report_url
    db.commit()
    db.refresh(audit)

    # Award badge if score is high
    if payload.efficiency_score >= 80:
        existing_badge = db.query(models.Badge).filter(
            models.Badge.user_id == audit.client_id,
            models.Badge.badge_type == models.BadgeType.energy_efficient,
        ).first()
        if not existing_badge:
            badge = models.Badge(user_id=audit.client_id, badge_type=models.BadgeType.energy_efficient)
            db.add(badge)

    notif = models.Notification(
        user_id=audit.client_id,
        message=f"Your energy audit is complete! Efficiency Score: {payload.efficiency_score}/100. Estimated savings: ₹{payload.estimated_savings_inr:,.0f}/year.",
        type=models.NotificationType.audit_update,
    )
    db.add(notif)
    db.commit()
    return _enrich(audit)
