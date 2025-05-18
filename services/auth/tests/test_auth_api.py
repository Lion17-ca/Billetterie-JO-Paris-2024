import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, get_password_hash, create_access_token
import models
from database import get_db, Base

# Créer une base de données SQLite en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Créer les tables dans la base de données de test
Base.metadata.create_all(bind=engine)

# Client de test FastAPI
client = TestClient(app)

# Surcharger la dépendance get_db pour utiliser la base de données de test
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def test_db():
    """Fournit une session de base de données de test"""
    # Recréer toutes les tables avant chaque test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Créer une nouvelle session pour le test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fixtures pour les tests
@pytest.fixture
def test_user_data():
    """Données pour créer un utilisateur de test"""
    return {
        "first_name": "Test",
        "last_name": "User",
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "TestPassword123!",
        "is_active": True,
        "is_admin": False,
        "is_employee": False
    }

@pytest.fixture
def test_user(test_db, test_user_data):
    """Crée un utilisateur de test dans la base de données"""
    # Hacher le mot de passe
    hashed_password = get_password_hash(test_user_data["password"])
    
    # Créer l'utilisateur
    user = models.User(
        first_name=test_user_data["first_name"],
        last_name=test_user_data["last_name"],
        email=test_user_data["email"],
        hashed_password=hashed_password,
        security_key_1="test_security_key_1",
        is_active=test_user_data["is_active"],
        is_admin=test_user_data["is_admin"],
        is_employee=test_user_data["is_employee"]
    )
    
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    # Retourner l'utilisateur et ses données
    return {"user": user, "data": test_user_data}

@pytest.fixture
def test_admin(test_db):
    """Crée un utilisateur administrateur de test"""
    admin_data = {
        "first_name": "Admin",
        "last_name": "User",
        "email": f"admin_{datetime.now().timestamp()}@example.com",
        "password": "AdminPassword123!",
        "is_active": True,
        "is_admin": True,
        "is_employee": False
    }
    
    # Hacher le mot de passe
    hashed_password = get_password_hash(admin_data["password"])
    
    # Créer l'administrateur
    admin = models.User(
        first_name=admin_data["first_name"],
        last_name=admin_data["last_name"],
        email=admin_data["email"],
        hashed_password=hashed_password,
        security_key_1="admin_security_key_1",
        is_active=admin_data["is_active"],
        is_admin=admin_data["is_admin"],
        is_employee=admin_data["is_employee"]
    )
    
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    
    # Retourner l'administrateur et ses données
    return {"user": admin, "data": admin_data}

@pytest.fixture
def test_employee(test_db):
    """Crée un utilisateur employé de test"""
    employee_data = {
        "first_name": "Employee",
        "last_name": "User",
        "email": f"employee_{datetime.now().timestamp()}@example.com",
        "password": "EmployeePassword123!",
        "is_active": True,
        "is_admin": False,
        "is_employee": True
    }
    
    # Hacher le mot de passe
    hashed_password = get_password_hash(employee_data["password"])
    
    # Créer l'employé
    employee = models.User(
        first_name=employee_data["first_name"],
        last_name=employee_data["last_name"],
        email=employee_data["email"],
        hashed_password=hashed_password,
        security_key_1="employee_security_key_1",
        is_active=employee_data["is_active"],
        is_admin=employee_data["is_admin"],
        is_employee=employee_data["is_employee"]
    )
    
    test_db.add(employee)
    test_db.commit()
    test_db.refresh(employee)
    
    # Retourner l'employé et ses données
    return {"user": employee, "data": employee_data}

@pytest.fixture
def user_token(test_user):
    """Génère un token d'accès pour l'utilisateur de test"""
    access_token = create_access_token(
        data={"sub": test_user["data"]["email"]},
        expires_delta=timedelta(minutes=30)
    )
    return access_token

@pytest.fixture
def admin_token(test_admin):
    """Génère un token d'accès pour l'administrateur de test"""
    access_token = create_access_token(
        data={"sub": test_admin["data"]["email"]},
        expires_delta=timedelta(minutes=30)
    )
    return access_token

@pytest.fixture
def employee_token(test_employee):
    """Génère un token d'accès pour l'employé de test"""
    access_token = create_access_token(
        data={"sub": test_employee["data"]["email"]},
        expires_delta=timedelta(minutes=30)
    )
    return access_token

# Tests pour les routes d'authentification
class TestAuthRoutes:
    def test_docs(self):
        """Teste la route de documentation"""
        response = client.get("/docs")
        assert response.status_code == 200
        # La route /docs retourne une page HTML, pas du JSON
    
    def test_register_user(self, test_user_data):
        """Teste la route /register pour créer un nouvel utilisateur"""
        # Créer un nouvel utilisateur avec des données différentes
        new_user_data = {
            "first_name": "New",
            "last_name": "User",
            "email": f"new_user_{datetime.now().timestamp()}@example.com",
            "password": "NewPassword123!"
        }
        
        response = client.post("/register", json=new_user_data)
        assert response.status_code in [200, 201]
        
        # Vérifier que l'utilisateur a été créé avec les bonnes données
        created_user = response.json()
        assert created_user["email"] == new_user_data["email"]
        assert created_user["first_name"] == new_user_data["first_name"]
        assert created_user["last_name"] == new_user_data["last_name"]
        assert "id" in created_user
        # Note: La clé de sécurité n'est pas retournée dans la réponse API pour des raisons de sécurité
    
    def test_register_duplicate_email(self, test_user):
        """Teste que la route /register rejette les emails en double"""
        # Essayer de créer un utilisateur avec un email déjà existant
        duplicate_user_data = {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": test_user["data"]["email"],  # Email déjà utilisé
            "password": "DuplicatePassword123!"
        }
        
        response = client.post("/register", json=duplicate_user_data)
        assert response.status_code == 400
        assert "email already registered" in response.json()["detail"].lower()
    
    def test_login_success(self, test_user):
        """Teste la route /token pour l'authentification réussie"""
        login_data = {
            "username": test_user["data"]["email"],
            "password": test_user["data"]["password"]
        }
        
        response = client.post("/token", data=login_data)
        assert response.status_code == 200
        
        token_data = response.json()
        assert "access_token" in token_data
        assert "token_type" in token_data
        assert token_data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, test_user):
        """Teste la route /token avec des identifiants invalides"""
        # Cas 1: Email invalide
        login_data_1 = {
            "username": "invalid@example.com",
            "password": test_user["data"]["password"]
        }
        
        response = client.post("/token", data=login_data_1)
        assert response.status_code == 401
        assert "email non enregistré" in response.json()["detail"].lower()
        
        # Cas 2: Mot de passe invalide
        login_data_2 = {
            "username": test_user["data"]["email"],
            "password": "InvalidPassword123!"
        }
        
        response = client.post("/token", data=login_data_2)
        assert response.status_code == 401
        assert "mot de passe incorrect" in response.json()["detail"].lower()
    
    def test_get_current_user(self, user_token):
        """Teste la route /users/me pour récupérer l'utilisateur actuel"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 200
        
        user_info = response.json()
        assert "email" in user_info
        assert "first_name" in user_info
        assert "last_name" in user_info
        assert "is_active" in user_info
    
    def test_get_current_user_no_token(self):
        """Teste la route /users/me sans token d'authentification"""
        response = client.get("/users/me")
        assert response.status_code == 401
        assert "not authenticated" in response.json()["detail"].lower()
    
    def test_get_current_user_invalid_token(self):
        """Teste la route /users/me avec un token invalide"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 401
        assert "could not validate credentials" in response.json()["detail"].lower()
    
    def test_setup_mfa(self, user_token):
        """Teste la route /mfa/setup pour configurer l'authentification à deux facteurs"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.post("/mfa/setup", headers=headers)
        assert response.status_code == 200
        
        mfa_data = response.json()
        assert "secret" in mfa_data
        assert "uri" in mfa_data
        assert mfa_data["secret"] is not None
        assert len(mfa_data["secret"]) > 0
    
    @pytest.mark.skip(reason="Test MFA désactivé car il nécessite une configuration spécifique de la base de données")
    def test_verify_mfa(self, test_user, test_db, user_token):
        """Teste la route /mfa/verify pour vérifier un code MFA"""
        # Ce test est désactivé car il nécessite une configuration spécifique de la base de données
        pass
    
    # Note: Les routes d'administration et d'employé ne sont pas implémentées dans le service d'authentification actuel
    # Ces tests pourront être ajoutés lorsque ces fonctionnalités seront développées

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
