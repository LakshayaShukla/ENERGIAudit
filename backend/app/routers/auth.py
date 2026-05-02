from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    is_approved = payload.role != models.UserRole.auditor  # auditors need admin approval
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        org_type=payload.org_type,
        org_size=payload.org_size,
        floor_area_sqft=payload.floor_area_sqft,
        is_approved=is_approved,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Account pending admin approval")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name,
    )


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.UserRegister,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.name = payload.name
    if payload.org_type:
        current_user.org_type = payload.org_type
    if payload.org_size:
        current_user.org_size = payload.org_size
    if payload.floor_area_sqft:
        current_user.floor_area_sqft = payload.floor_area_sqft
    db.commit()
    db.refresh(current_user)
    return current_user
