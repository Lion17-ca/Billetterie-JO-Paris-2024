#!/usr/bin/env python3
import os
import sys
import json
import psycopg2
from passlib.context import CryptContext
from datetime import datetime

# Configuration
SOURCE_DB_URL = "postgresql://postgres:postgres@localhost:5432/auth_db"
TARGET_DB_URL = "postgresql://postgres:postgres@postgres-db:5432/auth_db"

# Configuration du hachage de mot de passe (pour vérification uniquement)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def export_users_from_source():
    """Exporte les utilisateurs de la base de données source"""
    try:
        # Connexion à la base de données source
        conn = psycopg2.connect(SOURCE_DB_URL)
        cursor = conn.cursor()
        
        # Récupération des utilisateurs
        cursor.execute("SELECT * FROM users")
        columns = [desc[0] for desc in cursor.description]
        users = []
        
        for row in cursor.fetchall():
            user = dict(zip(columns, row))
            # Convertir les dates en chaînes pour la sérialisation JSON
            for key, value in user.items():
                if isinstance(value, datetime):
                    user[key] = value.isoformat()
            users.append(user)
        
        conn.close()
        
        # Écriture dans un fichier JSON
        with open('users_export.json', 'w') as f:
            json.dump(users, f, indent=2)
        
        print(f"Exportation réussie : {len(users)} utilisateurs exportés vers users_export.json")
        return users
    except Exception as e:
        print(f"Erreur lors de l'exportation : {e}")
        return None

def import_users_to_target(users=None):
    """Importe les utilisateurs dans la base de données cible"""
    try:
        # Si aucun utilisateur n'est fourni, charger depuis le fichier
        if users is None:
            try:
                with open('users_export.json', 'r') as f:
                    users = json.load(f)
            except FileNotFoundError:
                print("Fichier d'exportation non trouvé. Exécutez d'abord l'exportation.")
                return False
        
        # Connexion à la base de données cible
        conn = psycopg2.connect(TARGET_DB_URL)
        cursor = conn.cursor()
        
        # Vérifier si la table users existe
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("La table 'users' n'existe pas dans la base de données cible.")
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
        
        print(f"Importation réussie : {len(users)} utilisateurs importés dans la base de données cible")
        return True
    except Exception as e:
        print(f"Erreur lors de l'importation : {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False

def create_test_users():
    """Crée des utilisateurs de test directement dans la base de données cible"""
    try:
        # Connexion à la base de données cible
        conn = psycopg2.connect(TARGET_DB_URL)
        cursor = conn.cursor()
        
        # Vérifier si la table users existe
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("La table 'users' n'existe pas dans la base de données cible.")
            print("Assurez-vous que les migrations Alembic ont été exécutées.")
            conn.close()
            return False
        
        # Créer un utilisateur administrateur
        admin_email = "admin@example.com"
        cursor.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        if not cursor.fetchone():
            # Hacher le mot de passe
            hashed_password = pwd_context.hash("Admin123!")
            
            # Insertion d'un nouvel utilisateur admin
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
                "admin_security_key_1",
                "admin_mfa_secret",
                False,
                True,
                True,
                True
            ))
            print(f"Utilisateur administrateur {admin_email} créé avec succès")
        else:
            print(f"L'utilisateur administrateur {admin_email} existe déjà")
        
        # Créer un utilisateur employé
        employee_email = "employee@example.com"
        cursor.execute("SELECT id FROM users WHERE email = %s", (employee_email,))
        if not cursor.fetchone():
            # Hacher le mot de passe
            hashed_password = pwd_context.hash("Employee123!")
            
            # Insertion d'un nouvel utilisateur employé
            insert_query = """
            INSERT INTO users (
                email, first_name, last_name, hashed_password, 
                security_key_1, mfa_secret, mfa_enabled, 
                is_active, is_admin, is_employee, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            cursor.execute(insert_query, (
                employee_email,
                "Employee",
                "User",
                hashed_password,
                "employee_security_key_1",
                "employee_mfa_secret",
                False,
                True,
                False,
                True
            ))
            print(f"Utilisateur employé {employee_email} créé avec succès")
        else:
            print(f"L'utilisateur employé {employee_email} existe déjà")
        
        # Créer un utilisateur régulier
        user_email = "user@example.com"
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        if not cursor.fetchone():
            # Hacher le mot de passe
            hashed_password = pwd_context.hash("User123!")
            
            # Insertion d'un nouvel utilisateur régulier
            insert_query = """
            INSERT INTO users (
                email, first_name, last_name, hashed_password, 
                security_key_1, mfa_secret, mfa_enabled, 
                is_active, is_admin, is_employee, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            cursor.execute(insert_query, (
                user_email,
                "Regular",
                "User",
                hashed_password,
                "user_security_key_1",
                "user_mfa_secret",
                False,
                True,
                False,
                False
            ))
            print(f"Utilisateur régulier {user_email} créé avec succès")
        else:
            print(f"L'utilisateur régulier {user_email} existe déjà")
        
        conn.commit()
        conn.close()
        
        print("Création des utilisateurs de test terminée")
        return True
    except Exception as e:
        print(f"Erreur lors de la création des utilisateurs de test : {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python export_import_users.py [export|import|create_test_users|all]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "export":
        export_users_from_source()
    elif command == "import":
        import_users_to_target()
    elif command == "create_test_users":
        create_test_users()
    elif command == "all":
        users = export_users_from_source()
        if users:
            import_users_to_target(users)
        create_test_users()
    else:
        print("Commande non reconnue. Utilisez 'export', 'import', 'create_test_users' ou 'all'.")
