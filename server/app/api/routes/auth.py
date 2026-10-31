from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models import AdminUser
from app.schemas import (
    LoginRequest,
    TokenResponse,
    UserProfile,
    UpdateProfileRequest,
    ChangePasswordRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )

    access_token = create_access_token(subject=user.user_id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfile(
            user_id=user.user_id,
            username=user.username,
            name=user.name or "Administrator",
            email=user.email or "admin@bank.com",
            role=user.role or "Administrator"
        )
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: AdminUser = Depends(get_current_user)):
    return UserProfile(
        user_id=current_user.user_id,
        username=current_user.username,
        name=current_user.name or "Administrator",
        email=current_user.email or "admin@bank.com",
        role=current_user.role or "Administrator"
    )

@router.patch("/profile", response_model=UserProfile)
def update_profile(
    request: UpdateProfileRequest,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if request.name is not None:
        current_user.name = request.name.strip()
    if request.email is not None:
        current_user.email = request.email.strip()
    db.commit()
    db.refresh(current_user)
    return UserProfile(
        user_id=current_user.user_id,
        username=current_user.username,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role
    )

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters"
        )
    current_user.password_hash = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
