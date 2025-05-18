#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import secrets
import string

# Configuration de la base de données
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/auth_db"

# Création du moteur SQLAlchemy
engine = create_engine(DATABASE_URL)

# Création d'une session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Définition de la classe User
class User:
    def __init__(self, email, hashed_password, first_name, last_name, security_key_1, is_active=True, is_admin=False, is_employee=False, mfa_enabled=False):
        self.email = email
        self.hashed_password = hashed_password
        self.first_name = first_name
        self.last_name = last_name
        self.security_key_1 = security_key_1
        self.is_active = is_active
        self.is_admin = is_admin
        self.is_employee = is_employee
        self.mfa_enabled = mfa_enabled

def create_test_user():
    # Générer une clé de sécurité aléatoire
    security_key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    # Hacher le mot de passe
    hashed_password = pwd_context.hash("Password123!")
    
    # Créer un utilisateur employé
    try:
        db.execute(
            "INSERT INTO users (email, hashed_password, first_name, last_name, security_key_1, is_active, is_admin, is_employee, mfa_enabled) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            ("employee@example.com", hashed_password, "Test", "Employee", security_key, True, False, True, False)
        )
        db.commit()
        print("Utilisateur employé créé avec succès.")
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la création de l'utilisateur employé: {e}")
    
    # Créer un utilisateur régulier
    try:
        db.execute(
            "INSERT INTO users (email, hashed_password, first_name, last_name, security_key_1, is_active, is_admin, is_employee, mfa_enabled) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            ("user@example.com", hashed_password, "Test", "User", security_key, True, False, False, False)
        )
        db.commit()
        print("Utilisateur régulier créé avec succès.")
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la création de l'utilisateur régulier: {e}")

if __name__ == "__main__":
    create_test_user()
