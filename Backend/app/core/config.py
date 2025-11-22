from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # MongoDB
    MONGO_URL: str
    DB_NAME: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # SMTP
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_SENDER: str
    EMAIL_VERIFICATION_ENABLED: bool = True
    
    # OTP
    OTP_EXPIRE_MINUTES: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
