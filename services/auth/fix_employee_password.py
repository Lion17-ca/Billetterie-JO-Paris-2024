#!/usr/bin/env python3
import psycopg2
from passlib.context import CryptContext

# Configuration
DB_URL = "postgresql://postgres:postgres@postgres-db:5432/auth_db"

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def fix_employee_password():
    """Corrige le mot de passe de l'utilisateur employé"""
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        # Nouveau mot de passe pour l'employé
        employee_email = "employee@example.com"
        new_password = "Employee123!"
        hashed_password = pwd_context.hash(new_password)
        
        # Mise à jour du mot de passe
        update_query = """
        UPDATE users SET 
            hashed_password = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = %s
        """
        cursor.execute(update_query, (hashed_password, employee_email))
        
        # Vérifier si la mise à jour a réussi
        if cursor.rowcount > 0:
            print(f"Le mot de passe de l'utilisateur {employee_email} a été mis à jour avec succès.")
            print(f"Nouveau mot de passe: {new_password}")
        else:
            print(f"Aucun utilisateur trouvé avec l'email {employee_email}.")
            
            # Créer l'utilisateur s'il n'existe pas
            print("Création de l'utilisateur employé...")
            
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
            print(f"Utilisateur employé {employee_email} créé avec succès.")
            print(f"Mot de passe: {new_password}")
        
        # Créer un deuxième employé (employee2)
        employee2_email = "employee2@example.com"
        employee2_password = "Employee2_123!"
        hashed_password2 = pwd_context.hash(employee2_password)
        
        # Vérifier si employee2 existe déjà
        cursor.execute("SELECT id FROM users WHERE email = %s", (employee2_email,))
        if not cursor.fetchone():
            insert_query = """
            INSERT INTO users (
                email, first_name, last_name, hashed_password, 
                security_key_1, mfa_secret, mfa_enabled, 
                is_active, is_admin, is_employee, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            cursor.execute(insert_query, (
                employee2_email,
                "Employee2",
                "User",
                hashed_password2,
                "employee2_security_key_1",
                "employee2_mfa_secret",
                False,
                True,
                False,
                True
            ))
            print(f"Utilisateur employé {employee2_email} créé avec succès.")
            print(f"Mot de passe: {employee2_password}")
        else:
            # Mise à jour du mot de passe pour employee2
            update_query = """
            UPDATE users SET 
                hashed_password = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = %s
            """
            cursor.execute(update_query, (hashed_password2, employee2_email))
            print(f"Le mot de passe de l'utilisateur {employee2_email} a été mis à jour avec succès.")
            print(f"Nouveau mot de passe: {employee2_password}")
        
        conn.commit()
        conn.close()
        
        print("\nInformations de connexion:")
        print(f"Employee 1: {employee_email} / {new_password}")
        print(f"Employee 2: {employee2_email} / {employee2_password}")
        
        return True
    except Exception as e:
        print(f"Erreur lors de la mise à jour du mot de passe : {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    fix_employee_password()
