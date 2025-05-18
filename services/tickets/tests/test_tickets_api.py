import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json
import base64
from unittest.mock import patch, MagicMock

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, generate_security_key_2
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
def test_user():
    """Données d'un utilisateur de test"""
    return {
        "id": 1,
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "first_name": "Test",
        "last_name": "User",
        "security_key_1": generate_security_key()
    }

@pytest.fixture
def test_offer(test_db):
    """Crée une offre de test dans la base de données"""
    offer = models.Offer(
        name="Test Offer",
        description="Test Offer Description",
        price=100.0,
        event_date=datetime.now() + timedelta(days=30),
        location="Test Location",
        available_seats=100,
        total_seats=100
    )
    
    test_db.add(offer)
    test_db.commit()
    test_db.refresh(offer)
    
    return offer

@pytest.fixture
def test_offers(test_db):
    """Crée plusieurs offres de test dans la base de données"""
    offers = []
    for i in range(3):
        offer = models.Offer(
            name=f"Test Offer {i+1}",
            description=f"Test Offer Description {i+1}",
            price=100.0 * (i+1),
            event_date=datetime.now() + timedelta(days=30 + i),
            location=f"Test Location {i+1}",
            available_seats=100,
            total_seats=100
        )
        
        test_db.add(offer)
        offers.append(offer)
    
    test_db.commit()
    for offer in offers:
        test_db.refresh(offer)
    
    return offers

@pytest.fixture
def test_ticket(test_db, test_user, test_offer):
    """Crée un ticket de test dans la base de données"""
    security_key_2 = generate_security_key_2()
    
    ticket = models.Ticket(
        user_id=test_user["id"],
        offer_id=test_offer.id,
        purchase_date=datetime.now(),
        security_key_2=security_key_2,
        is_used=False
    )
    
    test_db.add(ticket)
    test_db.commit()
    test_db.refresh(ticket)
    
    return ticket

# Mock pour simuler l'authentification JWT
def mock_get_current_user():
    return {
        "id": 1,
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "security_key_1": generate_security_key()
    }

# Appliquer le mock pour les tests
app.dependency_overrides["get_current_user"] = mock_get_current_user

# Tests pour les routes de billetterie
class TestTicketsRoutes:
    def test_health_check(self):
        """Teste la route /health"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
    
    def test_get_offers(self, test_offers):
        """Teste la route /offers pour récupérer toutes les offres"""
        response = client.get("/offers")
        assert response.status_code == 200
        
        offers = response.json()
        assert len(offers) >= len(test_offers)
        
        # Vérifier que les offres de test sont présentes dans la réponse
        offer_ids = [offer["id"] for offer in offers]
        for test_offer in test_offers:
            assert test_offer.id in offer_ids
    
    def test_get_offer_by_id(self, test_offer):
        """Teste la route /offers/{offer_id} pour récupérer une offre spécifique"""
        response = client.get(f"/offers/{test_offer.id}")
        assert response.status_code == 200
        
        offer = response.json()
        assert offer["id"] == test_offer.id
        assert offer["name"] == test_offer.name
        assert offer["description"] == test_offer.description
        assert float(offer["price"]) == test_offer.price
    
    def test_get_offer_not_found(self):
        """Teste la route /offers/{offer_id} avec un ID inexistant"""
        response = client.get("/offers/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_purchase_ticket(self, mock_current_user, test_offer):
        """Teste la route /purchase pour acheter un ticket"""
        purchase_data = {
            "offer_id": test_offer.id,
            "quantity": 1
        }
        
        response = client.post("/purchase", json=purchase_data)
        assert response.status_code == 200
        
        result = response.json()
        assert "ticket_id" in result
        assert result["ticket_id"] > 0
        assert "message" in result
        assert "success" in result["message"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_purchase_ticket_invalid_offer(self, mock_current_user):
        """Teste la route /purchase avec un ID d'offre invalide"""
        purchase_data = {
            "offer_id": 9999,  # ID inexistant
            "quantity": 1
        }
        
        response = client.post("/purchase", json=purchase_data)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_purchase_ticket_no_seats(self, mock_current_user, test_db, test_offer):
        """Teste la route /purchase quand il n'y a plus de places disponibles"""
        # Mettre à jour l'offre pour qu'il n'y ait plus de places disponibles
        test_offer.available_seats = 0
        test_db.commit()
        
        purchase_data = {
            "offer_id": test_offer.id,
            "quantity": 1
        }
        
        response = client.post("/purchase", json=purchase_data)
        assert response.status_code == 400
        assert "no available seats" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_user_tickets(self, mock_current_user, test_ticket):
        """Teste la route /user/tickets pour récupérer les tickets d'un utilisateur"""
        response = client.get("/user/tickets")
        assert response.status_code == 200
        
        tickets = response.json()
        assert len(tickets) > 0
        
        # Vérifier que le ticket de test est présent dans la réponse
        ticket_ids = [ticket["id"] for ticket in tickets]
        assert test_ticket.id in ticket_ids
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_ticket_by_id(self, mock_current_user, test_ticket):
        """Teste la route /tickets/{ticket_id} pour récupérer un ticket spécifique"""
        response = client.get(f"/tickets/{test_ticket.id}")
        assert response.status_code == 200
        
        ticket = response.json()
        assert ticket["id"] == test_ticket.id
        assert ticket["user_id"] == test_ticket.user_id
        assert ticket["offer_id"] == test_ticket.offer_id
        assert "security_key_2" in ticket
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_ticket_not_found(self, mock_current_user):
        """Teste la route /tickets/{ticket_id} avec un ID inexistant"""
        response = client.get("/tickets/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_ticket_unauthorized(self, mock_current_user, test_db, test_offer):
        """Teste la route /tickets/{ticket_id} avec un ticket qui n'appartient pas à l'utilisateur"""
        # Créer un ticket pour un autre utilisateur
        other_ticket = models.Ticket(
            user_id=2,  # ID différent de l'utilisateur de test
            offer_id=test_offer.id,
            purchase_date=datetime.now(),
            security_key_2=generate_security_key(),
            is_used=False
        )
        
        test_db.add(other_ticket)
        test_db.commit()
        test_db.refresh(other_ticket)
        
        response = client.get(f"/tickets/{other_ticket.id}")
        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    @patch("main.generate_qr_code")
    def test_get_ticket_qrcode(self, mock_qr_code, mock_current_user, test_ticket):
        """Teste la route /tickets/{ticket_id}/qrcode pour récupérer le QR code d'un ticket"""
        # Mock pour la génération du QR code
        mock_qr_code.return_value = "data:image/png;base64," + base64.b64encode(b"test_qr_code").decode("utf-8")
        
        response = client.get(f"/tickets/{test_ticket.id}/qrcode")
        assert response.status_code == 200
        
        qr_data = response.json()
        assert "qr_code" in qr_data
        assert qr_data["qr_code"].startswith("data:image/png;base64,")
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_ticket_qrcode_not_found(self, mock_current_user):
        """Teste la route /tickets/{ticket_id}/qrcode avec un ID inexistant"""
        response = client.get("/tickets/9999/qrcode")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_user", return_value=mock_get_current_user())
    def test_get_ticket_qrcode_unauthorized(self, mock_current_user, test_db, test_offer):
        """Teste la route /tickets/{ticket_id}/qrcode avec un ticket qui n'appartient pas à l'utilisateur"""
        # Créer un ticket pour un autre utilisateur
        other_ticket = models.Ticket(
            user_id=2,  # ID différent de l'utilisateur de test
            offer_id=test_offer.id,
            purchase_date=datetime.now(),
            security_key_2=generate_security_key(),
            is_used=False
        )
        
        test_db.add(other_ticket)
        test_db.commit()
        test_db.refresh(other_ticket)
        
        response = client.get(f"/tickets/{other_ticket.id}/qrcode")
        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"].lower()

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
