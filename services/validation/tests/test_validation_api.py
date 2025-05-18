import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json
from unittest.mock import patch, MagicMock

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, validate_ticket_signature
import models
from database import get_db, SessionLocal

# Client de test FastAPI
client = TestClient(app)

# Surcharger la dépendance get_db pour utiliser une base de données de test
def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Fixtures pour les tests
@pytest.fixture
def test_db():
    """Fournit une session de base de données de test"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_employee():
    """Données d'un employé de test"""
    return {
        "id": 1,
        "email": "employee@example.com",
        "first_name": "Employee",
        "last_name": "User",
        "is_employee": True
    }

@pytest.fixture
def test_validation_record(test_db):
    """Crée un enregistrement de validation de test dans la base de données"""
    record = models.ValidationRecord(
        ticket_id=1,
        employee_id=1,
        validation_time=datetime.now(),
        is_valid=True,
        location="Test Location"
    )
    
    test_db.add(record)
    test_db.commit()
    test_db.refresh(record)
    
    return record

@pytest.fixture
def test_validation_records(test_db):
    """Crée plusieurs enregistrements de validation de test dans la base de données"""
    records = []
    for i in range(3):
        record = models.ValidationRecord(
            ticket_id=i+1,
            employee_id=1,
            validation_time=datetime.now() - timedelta(days=i),
            is_valid=True if i % 2 == 0 else False,
            location=f"Test Location {i+1}"
        )
        
        test_db.add(record)
        records.append(record)
    
    test_db.commit()
    for record in records:
        test_db.refresh(record)
    
    return records

# Mock pour simuler l'authentification JWT
def mock_get_current_employee():
    return {
        "id": 1,
        "email": "employee@example.com",
        "first_name": "Employee",
        "last_name": "User",
        "is_employee": True
    }

# Appliquer le mock pour les tests
app.dependency_overrides["get_current_employee"] = mock_get_current_employee

# Tests pour les routes de validation
class TestValidationRoutes:
    def test_health_check(self):
        """Teste la route /health"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    @patch("main.validate_ticket_signature", return_value=True)
    @patch("main.check_ticket_used", return_value=False)
    @patch("main.mark_ticket_as_used")
    def test_validate_ticket(self, mock_mark_used, mock_check_used, mock_validate, mock_employee):
        """Teste la route /validate pour valider un ticket"""
        validation_data = {
            "qr_data": "1:security_key_1:security_key_2",
            "employee_id": 1,
            "location": "Test Event Location"
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["is_valid"] is True
        assert result["ticket_id"] == 1
        assert "message" in result
        assert "valid" in result["message"].lower()
        
        # Vérifier que les fonctions mock ont été appelées correctement
        mock_validate.assert_called_once_with(1, "security_key_1", "security_key_2")
        mock_check_used.assert_called_once_with(1)
        mock_mark_used.assert_called_once_with(1)
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    @patch("main.validate_ticket_signature", return_value=False)
    def test_validate_ticket_invalid_signature(self, mock_validate, mock_employee):
        """Teste la route /validate avec une signature de ticket invalide"""
        validation_data = {
            "qr_data": "1:invalid_key_1:invalid_key_2",
            "employee_id": 1,
            "location": "Test Event Location"
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 401
        
        result = response.json()
        assert "detail" in result
        assert "invalid signature" in result["detail"].lower()
        
        # Vérifier que la fonction mock a été appelée correctement
        mock_validate.assert_called_once_with(1, "invalid_key_1", "invalid_key_2")
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    @patch("main.validate_ticket_signature", return_value=True)
    @patch("main.check_ticket_used", return_value=True)
    def test_validate_ticket_already_used(self, mock_check_used, mock_validate, mock_employee):
        """Teste la route /validate avec un ticket déjà utilisé"""
        validation_data = {
            "qr_data": "1:security_key_1:security_key_2",
            "employee_id": 1,
            "location": "Test Event Location"
        }
        
        response = client.post("/validate", json=validation_data)
        assert response.status_code == 400
        
        result = response.json()
        assert "detail" in result
        assert "already used" in result["detail"].lower()
        
        # Vérifier que les fonctions mock ont été appelées correctement
        mock_validate.assert_called_once_with(1, "security_key_1", "security_key_2")
        mock_check_used.assert_called_once_with(1)
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_validate_ticket_invalid_qr_data(self, mock_employee):
        """Teste la route /validate avec des données QR invalides"""
        # Cas 1: Format incorrect
        validation_data_1 = {
            "qr_data": "invalid_format",
            "employee_id": 1,
            "location": "Test Event Location"
        }
        
        response = client.post("/validate", json=validation_data_1)
        assert response.status_code == 400
        assert "invalid qr code format" in response.json()["detail"].lower()
        
        # Cas 2: ID de ticket non numérique
        validation_data_2 = {
            "qr_data": "abc:security_key_1:security_key_2",
            "employee_id": 1,
            "location": "Test Event Location"
        }
        
        response = client.post("/validate", json=validation_data_2)
        assert response.status_code == 400
        assert "invalid ticket id" in response.json()["detail"].lower()
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_get_validation_records(self, mock_employee, test_validation_records):
        """Teste la route /records pour récupérer tous les enregistrements de validation"""
        response = client.get("/records")
        assert response.status_code == 200
        
        records = response.json()
        assert len(records) >= len(test_validation_records)
        
        # Vérifier que les enregistrements de test sont présents dans la réponse
        record_ids = [record["id"] for record in records]
        for test_record in test_validation_records:
            assert test_record.id in record_ids
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_get_validation_record_by_id(self, mock_employee, test_validation_record):
        """Teste la route /records/{record_id} pour récupérer un enregistrement spécifique"""
        response = client.get(f"/records/{test_validation_record.id}")
        assert response.status_code == 200
        
        record = response.json()
        assert record["id"] == test_validation_record.id
        assert record["ticket_id"] == test_validation_record.ticket_id
        assert record["employee_id"] == test_validation_record.employee_id
        assert record["is_valid"] == test_validation_record.is_valid
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_get_validation_record_not_found(self, mock_employee):
        """Teste la route /records/{record_id} avec un ID inexistant"""
        response = client.get("/records/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_get_validation_records_by_ticket(self, mock_employee, test_validation_records):
        """Teste la route /records/ticket/{ticket_id} pour récupérer les enregistrements d'un ticket"""
        # Utiliser le premier ticket_id des enregistrements de test
        ticket_id = test_validation_records[0].ticket_id
        
        response = client.get(f"/records/ticket/{ticket_id}")
        assert response.status_code == 200
        
        records = response.json()
        assert len(records) > 0
        
        # Vérifier que tous les enregistrements correspondent au ticket_id
        for record in records:
            assert record["ticket_id"] == ticket_id
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    def test_get_validation_records_by_employee(self, mock_employee, test_validation_records):
        """Teste la route /records/employee/{employee_id} pour récupérer les enregistrements d'un employé"""
        # Utiliser le premier employee_id des enregistrements de test
        employee_id = test_validation_records[0].employee_id
        
        response = client.get(f"/records/employee/{employee_id}")
        assert response.status_code == 200
        
        records = response.json()
        assert len(records) > 0
        
        # Vérifier que tous les enregistrements correspondent à l'employee_id
        for record in records:
            assert record["employee_id"] == employee_id
    
    @patch("main.get_current_employee", return_value=mock_get_current_employee())
    @patch("models.get_validation_statistics")
    def test_get_validation_statistics(self, mock_stats, mock_employee):
        """Teste la route /statistics pour récupérer les statistiques de validation"""
        # Mock pour les statistiques de validation
        mock_stats.return_value = {
            "total_validations": 10,
            "valid_tickets": 8,
            "invalid_tickets": 2,
            "validation_rate": 80.0,
            "validations_by_location": [
                {"location": "Location 1", "count": 5},
                {"location": "Location 2", "count": 5}
            ],
            "validations_by_day": [
                {"date": "2025-05-01", "count": 3},
                {"date": "2025-05-02", "count": 7}
            ]
        }
        
        response = client.get("/statistics")
        assert response.status_code == 200
        
        stats = response.json()
        assert "total_validations" in stats
        assert "valid_tickets" in stats
        assert "invalid_tickets" in stats
        assert "validation_rate" in stats
        assert "validations_by_location" in stats
        assert "validations_by_day" in stats
        assert len(stats["validations_by_location"]) == 2
        assert len(stats["validations_by_day"]) == 2

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
