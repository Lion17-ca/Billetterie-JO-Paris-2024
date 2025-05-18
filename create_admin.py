import sys
import os

# Ajouter le répertoire du service d'authentification au chemin de recherche
sys.path.append(os.path.join(os.path.dirname(__file__), 'services/auth'))

from database import SessionLocal
from models import User
from main import get_password_hash, generate_security_key
import pyotp

def create_admin():
    print("Création d'un utilisateur administrateur...")
    db = SessionLocal()
    
    # Vérifier si l'utilisateur existe déjà
    from sqlalchemy import select
    from models import User
    stmt = select(User).where(User.email == 'admin@example.com')
    existing_user = db.execute(stmt).scalar_one_or_none()
    
    if existing_user:
        print("L'utilisateur admin@example.com existe déjà !")
        return
    
    # Créer l'utilisateur administrateur
    admin = User(
        email='admin@example.com',
        first_name='Admin',
        last_name='User',
        hashed_password=get_password_hash('Password123!'),
        is_admin=True,
        is_employee=False,
        security_key_1=generate_security_key(),
        mfa_secret=pyotp.random_base32()
    )
    
    db.add(admin)
    db.commit()
    print("Utilisateur administrateur créé avec succès !")
    
    # Créer un utilisateur normal
    user = User(
        email='user@example.com',
        first_name='Normal',
        last_name='User',
        hashed_password=get_password_hash('Password123!'),
        is_admin=False,
        is_employee=False,
        security_key_1=generate_security_key(),
        mfa_secret=pyotp.random_base32()
    )
    
    db.add(user)
    db.commit()
    print("Utilisateur normal créé avec succès !")
    
    # Créer un utilisateur employé
    employee = User(
        email='employee@example.com',
        first_name='Employee',
        last_name='User',
        hashed_password=get_password_hash('Password123!'),
        is_admin=False,
        is_employee=True,
        security_key_1=generate_security_key(),
        mfa_secret=pyotp.random_base32()
    )
    
    db.add(employee)
    db.commit()
    print("Utilisateur employé créé avec succès !")
    
    db.close()

if __name__ == "__main__":
    create_admin()
