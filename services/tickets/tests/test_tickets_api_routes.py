import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json
import base64
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, generate_security_key_2
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

@pytest.fixture
def test_user():
    """Données d'un utilisateur de test"""
    return {
        "id": 1,
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "first_name": "Test",
        "last_name": "User",
        "security_key_1": generate_security_key_2()
    }

@pytest.fixture
def test_offer(test_db):
    """Crée une offre de test dans la base de données"""
    offer = models.Offer(
        name="Test Offer",
        description="Test Offer Description",
        price=100.0,
        quantity=100,
        type="solo",
        event_date=datetime.now() + timedelta(days=30)
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
            quantity=100,
            type=f"type_{i+1}",
            event_date=datetime.now() + timedelta(days=30 + i)
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

# Nous n'avons pas besoin de simuler l'authentification JWT car le service de billetterie
# utilise directement les IDs des utilisateurs passés en paramètres

# Tests pour les routes de billetterie
class TestTicketsRoutes:
    def test_docs(self):
        """Teste la route de documentation"""
        response = client.get("/docs")
        assert response.status_code == 200
        # La route /docs retourne une page HTML, pas du JSON
    
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
    
    def test_create_ticket(self, test_offer):
        """Teste la route /tickets/ pour créer un ticket"""
        
        ticket_data = {
            "user_id": 1,
            "offer_id": test_offer.id
        }
        
        response = client.post("/tickets/", json=ticket_data)
        assert response.status_code == 200
        
        result = response.json()
        assert "id" in result
        assert result["id"] > 0
        assert "user_id" in result
        assert result["user_id"] == ticket_data["user_id"]
        assert "offer_id" in result
        assert result["offer_id"] == ticket_data["offer_id"]
    
    def test_create_ticket_invalid_offer(self):
        """Teste la route /tickets/ avec un ID d'offre invalide"""
        
        ticket_data = {
            "user_id": 1,
            "offer_id": 9999  # ID inexistant
        }
        
        response = client.post("/tickets/", json=ticket_data)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    # Note: Dans une implémentation réelle, nous devrions vérifier la disponibilité des places
    # en comparant la quantité de tickets vendus avec la quantité disponible dans l'offre.
    # Ce test est omis pour le moment car cette vérification n'est pas implémentée dans le service actuel.
    
    def test_get_user_tickets(self, test_ticket):
        """Teste la route /tickets/user/{user_id} pour récupérer les tickets d'un utilisateur"""
        
        user_id = test_ticket.user_id
        response = client.get(f"/tickets/user/{user_id}")
        assert response.status_code == 200
        
        tickets = response.json()
        assert len(tickets) > 0
        
        # Vérifier que le ticket de test est présent dans la réponse
        ticket_ids = [ticket["id"] for ticket in tickets]
        assert test_ticket.id in ticket_ids
    
    def test_get_ticket_by_id(self, test_ticket):
        """Teste la route /tickets/{ticket_id} pour récupérer un ticket spécifique"""
        
        response = client.get(f"/tickets/{test_ticket.id}")
        assert response.status_code == 200
        
        ticket = response.json()
        assert ticket["id"] == test_ticket.id
        assert ticket["user_id"] == test_ticket.user_id
        assert ticket["offer_id"] == test_ticket.offer_id
        assert "security_key_2" in ticket
    
    def test_get_ticket_not_found(self):
        """Teste la route /tickets/{ticket_id} avec un ID inexistant"""
        
        response = client.get("/tickets/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    # Note: Dans une implémentation réelle, nous devrions vérifier que l'utilisateur
    # est autorisé à accéder au ticket. Ce test est omis pour le moment car
    # cette vérification n'est pas implémentée dans le service actuel.
    
    @patch("main.generate_qr_code")
    def test_get_ticket_qrcode(self, mock_qr_code, test_ticket):
        """Teste la route /tickets/{ticket_id}/qrcode pour récupérer le QR code d'un ticket"""
        
        # Mock pour la génération du QR code
        mock_qr_code.return_value = "data:image/png;base64," + base64.b64encode(b"test_qr_code").decode("utf-8")
        
        response = client.get(f"/tickets/{test_ticket.id}/qrcode")
        assert response.status_code == 200
        
        qr_data = response.json()
        assert "qr_code" in qr_data
        assert qr_data["qr_code"].startswith("data:image/png;base64,")
    
    def test_get_ticket_qrcode_not_found(self):
        """Teste la route /tickets/{ticket_id}/qrcode avec un ID inexistant"""
        
        response = client.get("/tickets/9999/qrcode")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    # Note: Dans une implémentation réelle, nous devrions vérifier que l'utilisateur
    # est autorisé à accéder au QR code du ticket. Ce test est omis pour le moment car
    # cette vérification n'est pas implémentée dans le service actuel.

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
