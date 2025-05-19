import sys
import os

# Ajouter le répertoire du service d'authentification au chemin de recherche
sys.path.append(os.path.join(os.path.dirname(__file__), 'services/auth'))

from database import Base, engine, SessionLocal
import models  # Importe le modèle User pour créer la table
from schemas import UserCreate
import pyotp
import secrets

def init_db():
    print("Initialisation de la base de données...")
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès !")
    
    # Créer une session de base de données
    db = SessionLocal()
    
    # Vérifier si les utilisateurs essentiels existent et les créer si nécessaire
    ensure_admin_user_exists(db)
    ensure_employee_user_exists(db)
    ensure_normal_user_exists(db)
    
    db.close()
    print("Initialisation des utilisateurs terminée avec succès !")

def ensure_admin_user_exists(db):
    # Vérifier si l'utilisateur admin existe déjà
    from sqlalchemy import select
    admin_email = "admin@jo2024.fr"
    stmt = select(models.User).where(models.User.email == admin_email)
    existing_admin = db.execute(stmt).scalar_one_or_none()
    
    if existing_admin:
        print(f"L'utilisateur admin {admin_email} existe déjà")
        return existing_admin
    
    # Mot de passe haché pour 'admin123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("admin123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur admin
    admin_data = UserCreate(
        email=admin_email,
        password="admin123",  # Non utilisé directement
        first_name="Admin",
        last_name="User",
        is_admin=True,
        is_employee=True
    )
    
    admin_user = models.create_user(
        db=db,
        user=admin_data,
        hashed_password=hashed_password,
        security_key_1=security_key_1,
        mfa_secret=mfa_secret
    )
    
    print(f"Utilisateur admin créé: {admin_user.email}")
    return admin_user

def ensure_employee_user_exists(db):
    # Vérifier si l'utilisateur employé existe déjà
    from sqlalchemy import select
    employee_email = "employee@jo2024.fr"
    stmt = select(models.User).where(models.User.email == employee_email)
    existing_employee = db.execute(stmt).scalar_one_or_none()
    
    if existing_employee:
        print(f"L'utilisateur employé {employee_email} existe déjà")
        return existing_employee
    
    # Mot de passe haché pour 'employee123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("employee123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur employé
    employee_data = UserCreate(
        email=employee_email,
        password="employee123",  # Non utilisé directement
        first_name="Employee",
        last_name="User",
        is_admin=False,
        is_employee=True
    )
    
    employee_user = models.create_user(
        db=db,
        user=employee_data,
        hashed_password=hashed_password,
        security_key_1=security_key_1,
        mfa_secret=mfa_secret
    )
    
    print(f"Utilisateur employé créé: {employee_user.email}")
    return employee_user

def ensure_normal_user_exists(db):
    # Vérifier si l'utilisateur normal existe déjà
    from sqlalchemy import select
    user_email = "user@example.com"
    stmt = select(models.User).where(models.User.email == user_email)
    existing_user = db.execute(stmt).scalar_one_or_none()
    
    if existing_user:
        print(f"L'utilisateur normal {user_email} existe déjà")
        return existing_user
    
    # Mot de passe haché pour 'user123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("user123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur normal
    user_data = UserCreate(
        email=user_email,
        password="user123",  # Non utilisé directement
        first_name="Normal",
        last_name="User",
        is_admin=False,
        is_employee=False
    )
    
    normal_user = models.create_user(
        db=db,
        user=user_data,
        hashed_password=hashed_password,
        security_key_1=security_key_1,
        mfa_secret=mfa_secret
    )
    
    print(f"Utilisateur normal créé: {normal_user.email}")
    return normal_user

if __name__ == "__main__":
    init_db()
