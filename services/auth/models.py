from sqlalchemy import Boolean, Column, Integer, String, DateTime, select, func
from database import Base, engine, SessionLocal
from schemas import UserCreate
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    security_key_1 = Column(String, nullable=False)  # Première clé générée à la création du compte
    mfa_secret = Column(String, nullable=True)       # Secret pour l'authentification MFA
    mfa_enabled = Column(Boolean, default=False)     # Si l'utilisateur a activé MFA
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_employee = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Fonctions d'accès à la base de données
def get_user(db, user_id: int):
    stmt = select(User).where(User.id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_user_by_email(db, email: str):
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()

def get_users(db, skip: int = 0, limit: int = 100):
    stmt = select(User).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_user(db, user: UserCreate, hashed_password: str, security_key_1: str, mfa_secret: str):
    db_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        security_key_1=security_key_1,
        mfa_secret=mfa_secret,
        is_employee=user.is_employee,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db, email: str, password: str):
    from main import verify_password  # Import ici pour éviter les imports circulaires
    
    user = get_user_by_email(db, email=email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Création des tables dans la base de données
def create_tables():
    Base.metadata.create_all(bind=engine)
