import pytest
from jose import jwt
from datetime import datetime, timedelta
import os
import sys
import pyotp

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
from main import verify_password, get_password_hash, create_access_token, generate_security_key, SECRET_KEY, ALGORITHM

# Tests pour les fonctions de hachage et vérification de mot de passe
class TestPasswordSecurity:
    def test_password_hash_not_plain_text(self):
        """Vérifie que le mot de passe haché n'est pas en texte clair"""
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        assert password != hashed
        assert len(hashed) > 20  # Le hash doit être suffisamment long

    def test_password_verification_success(self):
        """Vérifie que la vérification fonctionne avec le bon mot de passe"""
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Vérifie que la vérification échoue avec un mauvais mot de passe"""
        password = "SecurePassword123!"
        wrong_password = "WrongPassword123!"
        hashed = get_password_hash(password)
        assert verify_password(wrong_password, hashed) is False

    def test_different_passwords_different_hashes(self):
        """Vérifie que deux mots de passe différents produisent des hashes différents"""
        password1 = "Password123!"
        password2 = "Password124!"
        hash1 = get_password_hash(password1)
        hash2 = get_password_hash(password2)
        assert hash1 != hash2

    def test_same_password_different_salts(self):
        """Vérifie que le même mot de passe produit des hashes différents (à cause du sel)"""
        password = "SamePassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2  # Les hashes doivent être différents à cause du sel aléatoire

# Tests pour les fonctions de génération et vérification de tokens JWT
class TestTokenSecurity:
    def test_token_creation(self):
        """Vérifie qu'un token est créé avec les bonnes informations"""
        user_id = "123456"
        token = create_access_token({"sub": user_id})
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_decoding(self):
        """Vérifie que le token peut être décodé correctement"""
        user_id = "123456"
        token = create_access_token({"sub": user_id})
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == user_id

    def test_token_expiration(self):
        """Vérifie que le token expire correctement"""
        user_id = "123456"
        # Créer un token qui expire dans 1 seconde
        token = create_access_token({"sub": user_id}, expires_delta=timedelta(seconds=1))
        # Vérifier qu'il est valide maintenant
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == user_id
        
        # Attendre que le token expire
        import time
        time.sleep(2)
        
        # Vérifier que le token est maintenant expiré
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    def test_invalid_token(self):
        """Vérifie que les tokens invalides sont rejetés"""
        invalid_token = "invalid.token.string"
        with pytest.raises(jwt.JWTError):
            jwt.decode(invalid_token, SECRET_KEY, algorithms=[ALGORITHM])

# Tests pour la génération de clés de sécurité
class TestSecurityKeyGeneration:
    def test_security_key_generation(self):
        """Vérifie que la génération de clé de sécurité fonctionne correctement"""
        key = generate_security_key()
        assert key is not None
        assert isinstance(key, str)
        assert len(key) == 64  # 32 octets en hexadécimal = 64 caractères

    def test_security_keys_uniqueness(self):
        """Vérifie que deux clés générées sont différentes"""
        key1 = generate_security_key()
        key2 = generate_security_key()
        assert key1 != key2

# Tests pour les modèles (avec mock de la base de données)
class TestUserModel:
    def test_user_model(self, test_db):
        """Vérifie que le modèle User fonctionne correctement"""
        # Créer un utilisateur test
        user_data = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "hashed_password": get_password_hash("password123"),
            "security_key_1": generate_security_key(),
            "is_active": True,
            "is_admin": False,
            "is_employee": False
        }
        
        # Créer un utilisateur dans la base de données
        user = models.User(**user_data)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        # Récupérer l'utilisateur
        db_user = models.get_user(test_db, user.id)
        
        # Vérifier que l'utilisateur a été correctement créé
        assert db_user is not None
        assert db_user.id == user_data["id"]
        assert db_user.email == user_data["email"]
        assert db_user.first_name == user_data["first_name"]
        assert db_user.last_name == user_data["last_name"]
        assert verify_password("password123", db_user.hashed_password)
        
    def test_get_user_by_email(self, test_db):
        """Vérifie que la récupération d'un utilisateur par email fonctionne correctement"""
        # Créer un utilisateur test
        email = f"user_{datetime.now().timestamp()}@example.com"
        user_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": email,
            "hashed_password": get_password_hash("password456"),
            "security_key_1": generate_security_key(),
            "is_active": True,
            "is_admin": False,
            "is_employee": True
        }
        
        # Créer un utilisateur dans la base de données
        user = models.User(**user_data)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        # Récupérer l'utilisateur par email
        db_user = models.get_user_by_email(test_db, email)
        
        # Vérifier que l'utilisateur a été correctement récupéré
        assert db_user is not None
        assert db_user.email == email
        assert db_user.first_name == user_data["first_name"]
        assert db_user.last_name == user_data["last_name"]
        assert db_user.is_employee is True
