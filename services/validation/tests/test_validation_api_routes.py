import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime
from unittest.mock import patch, MagicMock

from database import Base, get_db
from main import app
import models
import schemas

# Configuration de la base de données de test
SQLALCHEMY_DATABASE_URL = "sqlite://"  # Base de données SQLite en mémoire pour les tests

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Création d'une base de données de test
Base.metadata.create_all(bind=engine)

# Modification de la dépendance pour utiliser la base de données de test
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Client de test
client = TestClient(app)

class TestValidationRoutes:
    """Tests pour les routes API du service de validation"""
    
    @pytest.fixture
    def test_db(self):
        """Crée une session de base de données de test"""
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    @pytest.fixture
    def test_validation_record(self, test_db):
        """Crée un enregistrement de validation de test dans la base de données"""
        record = models.ValidationRecord(
            ticket_id=1,
            user_id=1,
            employee_id=1,
            validation_date=datetime.now(),
            is_valid=True
        )
        
        test_db.add(record)
        test_db.commit()
        test_db.refresh(record)
        
        return record
    
    @pytest.fixture
    def test_validation_records(self, test_db):
        """Crée plusieurs enregistrements de validation de test dans la base de données"""
        records = []
        for i in range(3):
            record = models.ValidationRecord(
                ticket_id=i+1,
                user_id=i+1,
                employee_id=1,  # Même employé pour tous les enregistrements
                validation_date=datetime.now(),
                is_valid=True
            )
            
            test_db.add(record)
            records.append(record)
        
        test_db.commit()
        for record in records:
            test_db.refresh(record)
        
        return records
    
    def test_docs(self):
        """Teste l'accès à la documentation de l'API"""
        response = client.get("/docs")
        assert response.status_code == 200
    
    @patch("main.validate_ticket_signature")
    def test_validate_ticket(self, mock_validate_signature, test_db):
        """Teste la route /validate pour valider un ticket"""
        # Configuration du mock pour simuler une signature valide
        mock_validate_signature.return_value = True
        
        # Données de validation
        validation_data = {
            "qr_data": "1:security_key_1:security_key_2",
            "employee_id": 1
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["is_valid"] is True
        assert result["ticket_id"] == 1
        assert "user_name" in result
        assert "offer_name" in result
        assert "purchase_date" in result
        assert "validation_date" in result
    
    def test_validate_ticket_invalid_qr(self):
        """Teste la route /validate avec un QR code invalide"""
        # Données de validation avec un QR code mal formaté
        validation_data = {
            "qr_data": "invalid_qr_data",
            "employee_id": 1
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 400
        assert "invalid qr code format" in response.json()["detail"].lower()
    
    @patch("main.validate_ticket_signature")
    def test_validate_ticket_invalid_signature(self, mock_validate_signature):
        """Teste la route /validate avec une signature invalide"""
        # Configuration du mock pour simuler une signature invalide
        mock_validate_signature.return_value = False
        
        # Données de validation
        validation_data = {
            "qr_data": "1:security_key_1:security_key_2",
            "employee_id": 1
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 401
        assert "invalid ticket signature" in response.json()["detail"].lower()
    
    def test_get_validations(self, test_validation_records):
        """Teste la route /validations/ pour récupérer tous les enregistrements de validation"""
        response = client.get("/validations/")
        assert response.status_code == 200
        
        validations = response.json()
        assert len(validations) >= 3  # Au moins les 3 enregistrements créés par le fixture
        
        # Vérifier que les enregistrements de test sont présents dans la réponse
        validation_ids = [validation["id"] for validation in validations]
        for record in test_validation_records:
            assert record.id in validation_ids
    
    def test_get_employee_validations(self, test_validation_records):
        """Teste la route /validations/employee/{employee_id} pour récupérer les validations d'un employé"""
        employee_id = 1  # L'ID de l'employé utilisé dans le fixture
        
        response = client.get(f"/validations/employee/{employee_id}")
        assert response.status_code == 200
        
        validations = response.json()
        assert len(validations) >= 3  # Au moins les 3 enregistrements créés par le fixture
        
        # Vérifier que tous les enregistrements appartiennent à l'employé spécifié
        for validation in validations:
            assert validation["employee_id"] == employee_id

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-v"])
