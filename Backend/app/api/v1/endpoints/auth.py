from fastapi import APIRouter, HTTPException, status
from app.models.user import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOTPRequest
)
from app.services.auth_service import auth_service

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Create a new user account
    """
    try:
        user = await auth_service.create_user(user_data)
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during signup: {str(e)}"
        )

@router.post("/login")
async def login(user_data: UserLogin):
    """
    Login with email and password
    """
    try:
        result = await auth_service.login(user_data.email, user_data.password)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login: {str(e)}"
        )

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request OTP for password reset
    """
    try:
        await auth_service.generate_password_reset_otp(request.email)
        return {"message": "OTP sent to your email address"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP for password reset
    """
    try:
        await auth_service.verify_otp(request.email, request.otp)
        return {"message": "OTP verified successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using OTP
    """
    try:
        await auth_service.reset_password(request.email, request.otp, request.new_password)
        return {"message": "Password reset successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
