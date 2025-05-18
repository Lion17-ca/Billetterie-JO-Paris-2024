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
    
    # Vérifier si des utilisateurs existent déjà
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        print(f"{existing_users} utilisateurs existent déjà dans la base de données.")
        return
    
    # Créer un utilisateur administrateur
    create_admin_user(db)
    
    # Créer un utilisateur employé
    create_employee_user(db)
    
    # Créer un utilisateur normal
    create_normal_user(db)
    
    db.close()
    print("Utilisateurs créés avec succès !")

def create_admin_user(db):
    # Mot de passe haché pour 'admin123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("admin123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur admin
    admin_data = UserCreate(
        email="admin@jo2024.fr",
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

def create_employee_user(db):
    # Mot de passe haché pour 'employee123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("employee123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur employé
    employee_data = UserCreate(
        email="employee@jo2024.fr",
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

def create_normal_user(db):
    # Mot de passe haché pour 'user123'
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("user123")
    
    # Générer les clés de sécurité
    security_key_1 = secrets.token_hex(32)
    mfa_secret = pyotp.random_base32()
    
    # Créer l'utilisateur normal
    user_data = UserCreate(
        email="user@example.com",
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

if __name__ == "__main__":
    init_db()
