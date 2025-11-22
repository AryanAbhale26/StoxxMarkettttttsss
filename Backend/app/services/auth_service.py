from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from app.core.database import get_database
from app.core.security import verify_password, get_password_hash, create_access_token, generate_otp
from app.core.config import settings
from app.models.user import UserCreate, UserInDB, UserResponse
from app.services.email_service import send_otp_email, send_welcome_email

class AuthService:
    @property
    def db(self):
        return get_database()
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        user = await self.db.users.find_one({"email": email})
        return user
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user document
        user_dict = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": get_password_hash(user_data.password),
            "is_active": True,
            "is_verified": True,  # Set to True for now, can enable email verification later
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        result = await self.db.users.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        # Send welcome email
        try:
            await send_welcome_email(user_data.email, user_data.full_name)
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        return UserResponse(
            id=str(result.inserted_id),
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            is_active=user_dict["is_active"],
            is_verified=user_dict["is_verified"],
            created_at=user_dict["created_at"]
        )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user
    
    async def login(self, email: str, password: str) -> dict:
        """Login user and return access token"""
        user = await self.authenticate_user(email, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"], "user_id": str(user["_id"])}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                full_name=user["full_name"],
                is_active=user["is_active"],
                is_verified=user.get("is_verified", False),
                created_at=user["created_at"]
            )
        }
    
    async def generate_password_reset_otp(self, email: str) -> bool:
        """Generate and send OTP for password reset"""
        user = await self.get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate OTP
        otp = generate_otp()
        otp_expiry = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        # Store OTP in database
        await self.db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "reset_otp": otp,
                    "reset_otp_expiry": otp_expiry,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Send OTP email
        email_sent = await send_otp_email(email, otp, "password reset")
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email"
            )
        
        return True
    
    async def verify_otp(self, email: str, otp: str) -> bool:
        """Verify OTP"""
        user = await self.get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        stored_otp = user.get("reset_otp")
        otp_expiry = user.get("reset_otp_expiry")
        
        if not stored_otp or not otp_expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OTP found. Please request a new one."
            )
        
        if datetime.utcnow() > otp_expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one."
            )
        
        if stored_otp != otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
        
        return True
    
    async def reset_password(self, email: str, otp: str, new_password: str) -> bool:
        """Reset password using OTP"""
        # Verify OTP first
        await self.verify_otp(email, otp)
        
        # Update password
        await self.db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "hashed_password": get_password_hash(new_password),
                    "updated_at": datetime.utcnow()
                },
                "$unset": {
                    "reset_otp": "",
                    "reset_otp_expiry": ""
                }
            }
        )
        
        return True

auth_service = AuthService()
