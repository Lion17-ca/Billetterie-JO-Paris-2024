from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    is_employee: bool = False
    is_admin: bool = False

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool = False
    is_employee: bool = False
    mfa_enabled: bool = False
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class TokenData(BaseModel):
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    is_employee: bool = False
    is_admin: bool = False

class MFAToken(BaseModel):
    token: str

class MFASetup(BaseModel):
    secret: str
    uri: str
    current_code: str
    valid_until: int
