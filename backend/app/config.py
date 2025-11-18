from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    """
    Application configuration settings.
    Loads from environment variables or .env file
    """
    
    # Application Info
    APP_NAME: str = "TaxEase"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database (Supabase)
    DATABASE_URL: str  # Format: postgresql://postgres:[password]@[host]/[database]
    
    # AI APIs
    OPENAI_API_KEY: str = ""
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # File Upload (Only PDF and JPG)
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_FOLDER: str = "uploads"
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg"]  # Only PDF and images
    
    # Security
    SECRET_KEY: str = "default-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "chrome-extension://*",
        "http://localhost:3000"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_upload_path(self) -> Path:
        """Get the absolute path for uploads folder"""
        upload_path = Path(self.UPLOAD_FOLDER)
        upload_path.mkdir(exist_ok=True)  # Create if doesn't exist
        return upload_path

# Create a global settings instance
settings = Settings()

# Create uploads folder if it doesn't exist
settings.get_upload_path()