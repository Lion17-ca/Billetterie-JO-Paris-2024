#!/usr/bin/env python3
import os
import sys
import json
import sqlite3
import psycopg2
from passlib.context import CryptContext
from datetime import datetime
import pyotp
import secrets

# Configuration
SQLITE_DB_PATH = "./services/auth/auth.db"  # Chemin vers la base SQLite locale
TARGET_DB_URL = "postgresql://postgres:postgres@postgres-db:5432/auth_db"  # URL PostgreSQL de production

# Configuration du hachage de mot de passe (pour vérification uniquement)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def export_users_from_sqlite():
    """Exporte les utilisateurs de la base de données SQLite"""
    try:
        # Vérifier si le fichier SQLite existe
        if not os.path.exists(SQLITE_DB_PATH):
            print(f"Base de données SQLite non trouvée à {SQLITE_DB_PATH}")
            return None
            
        # Connexion à la base de données SQLite
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Vérifier si la table users existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("La table 'users' n'existe pas dans la base de données SQLite.")
            conn.close()
            return None
        
        # Récupération des utilisateurs
        cursor.execute("SELECT * FROM users")
        users = []
        
        for row in cursor.fetchall():
            user = {key: row[key] for key in row.keys()}
            # Convertir les dates en chaînes pour la sérialisation JSON si nécessaire
            for key, value in user.items():
                if isinstance(value, datetime):
                    user[key] = value.isoformat()
            users.append(user)
        
        conn.close()
        
        # Écriture dans un fichier JSON
        with open('users_sqlite_export.json', 'w') as f:
            json.dump(users, f, indent=2)
        
        print(f"Exportation réussie : {len(users)} utilisateurs exportés vers users_sqlite_export.json")
        return users
    except Exception as e:
        print(f"Erreur lors de l'exportation depuis SQLite : {e}")
        return None

def import_users_to_postgres(users=None):
    """Importe les utilisateurs dans la base de données PostgreSQL cible"""
    try:
        # Si aucun utilisateur n'est fourni, charger depuis le fichier
        if users is None:
            try:
                with open('users_sqlite_export.json', 'r') as f:
                    users = json.load(f)
            except FileNotFoundError:
                print("Fichier d'exportation non trouvé. Exécutez d'abord l'exportation.")
                return False
        
        # Connexion à la base de données PostgreSQL cible
        conn = psycopg2.connect(TARGET_DB_URL)
        cursor = conn.cursor()
        
        # Vérifier si la table users existe
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("La table 'users' n'existe pas dans la base de données PostgreSQL cible.")
            print("Assurez-vous que les migrations Alembic ont été exécutées.")
            conn.close()
            return False
        
        # Importation des utilisateurs
        for user in users:
            # Vérifier si l'utilisateur existe déjà
            cursor.execute("SELECT id FROM users WHERE email = %s", (user['email'],))
            existing_user = cursor.fetchone()
            
            if existing_user:
                print(f"L'utilisateur {user['email']} existe déjà, mise à jour...")
                # Mise à jour de l'utilisateur existant
                update_query = """
                UPDATE users SET 
                    first_name = %s, 
                    last_name = %s, 
                    hashed_password = %s,
                    security_key_1 = %s,
                    mfa_secret = %s,
                    mfa_enabled = %s,
                    is_active = %s,
                    is_admin = %s,
                    is_employee = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = %s
                """
                cursor.execute(update_query, (
                    user['first_name'],
                    user['last_name'],
                    user['hashed_password'],
                    user['security_key_1'],
                    user['mfa_secret'],
                    user['mfa_enabled'],
                    user['is_active'],
                    user['is_admin'],
                    user['is_employee'],
                    user['email']
                ))
            else:
                print(f"Création de l'utilisateur {user['email']}...")
                # Insertion d'un nouvel utilisateur
                insert_query = """
                INSERT INTO users (
                    email, first_name, last_name, hashed_password, 
                    security_key_1, mfa_secret, mfa_enabled, 
                    is_active, is_admin, is_employee, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """
                cursor.execute(insert_query, (
                    user['email'],
                    user['first_name'],
                    user['last_name'],
                    user['hashed_password'],
                    user['security_key_1'],
                    user['mfa_secret'],
                    user['mfa_enabled'],
                    user['is_active'],
                    user['is_admin'],
                    user['is_employee']
                ))
        
        conn.commit()
        conn.close()
        
        print(f"Importation réussie : {len(users)} utilisateurs importés dans PostgreSQL")
        return True
    except Exception as e:
        print(f"Erreur lors de l'importation vers PostgreSQL : {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False

def create_admin_user():
    """Crée un utilisateur administrateur directement dans la base de données PostgreSQL"""
    try:
        # Connexion à la base de données PostgreSQL cible
        conn = psycopg2.connect(TARGET_DB_URL)
        cursor = conn.cursor()
        
        # Créer un utilisateur administrateur
        admin_email = "admin@jo2024.fr"
        cursor.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        if not cursor.fetchone():
            # Hacher le mot de passe
            hashed_password = pwd_context.hash("admin123")
            
            # Générer les clés de sécurité
            security_key_1 = secrets.token_hex(32)
            mfa_secret = pyotp.random_base32()
            
            # Insertion d'un nouvel utilisateur administrateur
            insert_query = """
            INSERT INTO users (
                email, first_name, last_name, hashed_password, 
                security_key_1, mfa_secret, mfa_enabled, 
                is_active, is_admin, is_employee, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            cursor.execute(insert_query, (
                admin_email,
                "Admin",
                "User",
                hashed_password,
                security_key_1,
                mfa_secret,
                False,
                True,
                True,
                True
            ))
            print(f"Utilisateur administrateur {admin_email} créé avec succès")
        else:
            print(f"L'utilisateur administrateur {admin_email} existe déjà")
        
        conn.commit()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Erreur lors de la création de l'utilisateur administrateur : {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    command = "all"
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
    
    if command == "export":
        export_users_from_sqlite()
    elif command == "import":
        import_users_to_postgres()
    elif command == "create_admin":
        create_admin_user()
    elif command == "all":
        users = export_users_from_sqlite()
        if users:
            import_users_to_postgres(users)
        create_admin_user()
    else:
        print("Commande non reconnue. Utilisez 'export', 'import', 'create_admin' ou 'all'.")
