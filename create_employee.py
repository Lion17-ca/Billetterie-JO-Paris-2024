#!/usr/bin/env python3
"""
Script pour créer un compte employé dans la base de données.
"""

import os
import sys
import secrets
from datetime import datetime
from passlib.context import CryptContext
import pyotp
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Boolean, Column, Integer, String, DateTime, func
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./services/auth/auth.db")

# Création du moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Création d'une session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Création d'une classe de base pour les modèles
Base = declarative_base()

# Définir le modèle User directement dans ce script pour éviter les problèmes d'importation
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
    is_employee = Column(Boolean, default=True)      # Par défaut à True pour ce script
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_security_key():
    return secrets.token_hex(32)

def create_employee_user(email, password, first_name, last_name):
    # Créer les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    
    # Créer une session
    db = SessionLocal()
    
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"L'utilisateur avec l'email {email} existe déjà.")
            # Mettre à jour le statut d'employé
            existing_user.is_employee = True
            db.commit()
            print(f"L'utilisateur a été promu au statut d'employé.")
            return existing_user
        
        # Générer les données de sécurité
        hashed_password = get_password_hash(password)
        security_key_1 = generate_security_key()
        mfa_secret = pyotp.random_base32()
        
        # Créer le nouvel utilisateur
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            hashed_password=hashed_password,
            security_key_1=security_key_1,
            mfa_secret=mfa_secret,
            is_employee=True,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"Compte employé créé avec succès : {email}")
        return new_user
    
    except Exception as e:
        print(f"Erreur lors de la création du compte employé : {e}")
        db.rollback()
        return None
    
    finally:
        db.close()

if __name__ == "__main__":
    # Utiliser des valeurs par défaut pour l'employé
    email = "employee@example.com"
    password = "Password123!"
    first_name = "John"
    last_name = "Employee"
    
    print(f"Création d'un compte employé avec les informations suivantes :")
    print(f"Email: {email}")
    print(f"Prénom: {first_name}")
    print(f"Nom: {last_name}")
    
    # Créer le compte employé
    create_employee_user(email, password, first_name, last_name)
