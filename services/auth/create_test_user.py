#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import secrets
import string
from dotenv import load_dotenv

# Ajouter le répertoire courant au chemin de recherche des modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importer les modèles après avoir ajouté le répertoire au chemin
from models import Base, User

# Chargement des variables d'environnement
load_dotenv()

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auth.db")

# Création du moteur SQLAlchemy
connect_args = {}
if DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Création d'une session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(User).filter(User.email == "employee@example.com").first()
    if existing_user:
        print("L'utilisateur de test existe déjà.")
        return
    
    # Générer une clé de sécurité aléatoire
    security_key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    # Créer un nouvel utilisateur
    new_user = User(
        first_name="Test",
        last_name="Employee",
        email="employee@example.com",
        hashed_password=pwd_context.hash("Password123!"),
        security_key_1=security_key,
        is_active=True,
        is_admin=False,
        is_employee=True,
        mfa_enabled=False
    )
    
    # Ajouter l'utilisateur à la base de données
    db.add(new_user)
    db.commit()
    
    print(f"Utilisateur de test créé avec succès: {new_user.email}")
    print(f"Mot de passe: Password123!")

if __name__ == "__main__":
    create_test_user()
