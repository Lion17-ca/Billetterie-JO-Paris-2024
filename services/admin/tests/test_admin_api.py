import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json
from unittest.mock import patch, MagicMock

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
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
def test_admin():
    """Données d'un administrateur de test"""
    return {
        "id": 1,
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "is_admin": True
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

# Mock pour simuler l'authentification JWT
def mock_get_current_admin():
    return {
        "id": 1,
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "is_admin": True
    }

# Appliquer le mock pour les tests
app.dependency_overrides["get_current_admin"] = mock_get_current_admin

# Tests pour les routes d'administration
class TestAdminRoutes:
    def test_health_check(self):
        """Teste la route /health"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_get_all_offers(self, mock_admin, test_offers):
        """Teste la route /offers pour récupérer toutes les offres"""
        response = client.get("/offers")
        assert response.status_code == 200
        
        offers = response.json()
        assert len(offers) >= len(test_offers)
        
        # Vérifier que les offres de test sont présentes dans la réponse
        offer_ids = [offer["id"] for offer in offers]
        for test_offer in test_offers:
            assert test_offer.id in offer_ids
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_get_offer_by_id(self, mock_admin, test_offer):
        """Teste la route /offers/{offer_id} pour récupérer une offre spécifique"""
        response = client.get(f"/offers/{test_offer.id}")
        assert response.status_code == 200
        
        offer = response.json()
        assert offer["id"] == test_offer.id
        assert offer["name"] == test_offer.name
        assert offer["description"] == test_offer.description
        assert float(offer["price"]) == test_offer.price
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_get_offer_not_found(self, mock_admin):
        """Teste la route /offers/{offer_id} avec un ID inexistant"""
        response = client.get("/offers/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_create_offer(self, mock_admin):
        """Teste la route /offers pour créer une nouvelle offre"""
        offer_data = {
            "name": "New Test Offer",
            "description": "New Test Offer Description",
            "price": 150.0,
            "event_date": (datetime.now() + timedelta(days=45)).isoformat(),
            "location": "New Test Location",
            "total_seats": 200
        }
        
        response = client.post("/offers", json=offer_data)
        assert response.status_code == 201
        
        created_offer = response.json()
        assert created_offer["name"] == offer_data["name"]
        assert created_offer["description"] == offer_data["description"]
        assert float(created_offer["price"]) == offer_data["price"]
        assert created_offer["location"] == offer_data["location"]
        assert created_offer["total_seats"] == offer_data["total_seats"]
        assert created_offer["available_seats"] == offer_data["total_seats"]
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_update_offer(self, mock_admin, test_offer):
        """Teste la route /offers/{offer_id} pour mettre à jour une offre existante"""
        update_data = {
            "name": "Updated Test Offer",
            "description": "Updated Test Offer Description",
            "price": 120.0,
            "event_date": (datetime.now() + timedelta(days=60)).isoformat(),
            "location": "Updated Test Location",
            "available_seats": 90,
            "total_seats": 120
        }
        
        response = client.put(f"/offers/{test_offer.id}", json=update_data)
        assert response.status_code == 200
        
        updated_offer = response.json()
        assert updated_offer["id"] == test_offer.id
        assert updated_offer["name"] == update_data["name"]
        assert updated_offer["description"] == update_data["description"]
        assert float(updated_offer["price"]) == update_data["price"]
        assert updated_offer["location"] == update_data["location"]
        assert updated_offer["available_seats"] == update_data["available_seats"]
        assert updated_offer["total_seats"] == update_data["total_seats"]
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_update_offer_not_found(self, mock_admin):
        """Teste la route /offers/{offer_id} pour mettre à jour une offre inexistante"""
        update_data = {
            "name": "Updated Test Offer",
            "description": "Updated Test Offer Description",
            "price": 120.0,
            "event_date": (datetime.now() + timedelta(days=60)).isoformat(),
            "location": "Updated Test Location",
            "available_seats": 90,
            "total_seats": 120
        }
        
        response = client.put("/offers/9999", json=update_data)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_delete_offer(self, mock_admin, test_offer):
        """Teste la route /offers/{offer_id} pour supprimer une offre"""
        response = client.delete(f"/offers/{test_offer.id}")
        assert response.status_code == 200
        
        result = response.json()
        assert "message" in result
        assert "deleted" in result["message"].lower()
        
        # Vérifier que l'offre a bien été supprimée
        get_response = client.get(f"/offers/{test_offer.id}")
        assert get_response.status_code == 404
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_delete_offer_not_found(self, mock_admin):
        """Teste la route /offers/{offer_id} pour supprimer une offre inexistante"""
        response = client.delete("/offers/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    @patch("models.get_sales_statistics")
    def test_get_sales_statistics(self, mock_stats, mock_admin):
        """Teste la route /statistics/sales pour récupérer les statistiques de vente"""
        # Mock pour les statistiques de vente
        mock_stats.return_value = {
            "total_sales": 10,
            "total_revenue": 1500.0,
            "average_price": 150.0,
            "sales_by_offer": [
                {"offer_id": 1, "offer_name": "Test Offer 1", "sales": 5, "revenue": 750.0},
                {"offer_id": 2, "offer_name": "Test Offer 2", "sales": 5, "revenue": 750.0}
            ]
        }
        
        response = client.get("/statistics/sales")
        assert response.status_code == 200
        
        stats = response.json()
        assert "total_sales" in stats
        assert "total_revenue" in stats
        assert "average_price" in stats
        assert "sales_by_offer" in stats
        assert len(stats["sales_by_offer"]) == 2
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    @patch("models.get_offer_sales_detail")
    def test_get_offer_sales_detail(self, mock_detail, mock_admin, test_offer):
        """Teste la route /statistics/offers/{offer_id} pour récupérer les détails des ventes d'une offre"""
        # Mock pour les détails des ventes
        mock_detail.return_value = {
            "offer_id": test_offer.id,
            "offer_name": test_offer.name,
            "total_sales": 5,
            "total_revenue": 500.0,
            "available_seats": 95,
            "total_seats": 100,
            "sales_by_date": [
                {"date": "2025-05-01", "sales": 2},
                {"date": "2025-05-02", "sales": 3}
            ]
        }
        
        response = client.get(f"/statistics/offers/{test_offer.id}")
        assert response.status_code == 200
        
        detail = response.json()
        assert detail["offer_id"] == test_offer.id
        assert detail["offer_name"] == test_offer.name
        assert "total_sales" in detail
        assert "total_revenue" in detail
        assert "available_seats" in detail
        assert "total_seats" in detail
        assert "sales_by_date" in detail
        assert len(detail["sales_by_date"]) == 2
    
    @patch("main.get_current_admin", return_value=mock_get_current_admin())
    def test_get_offer_sales_detail_not_found(self, mock_admin):
        """Teste la route /statistics/offers/{offer_id} avec un ID inexistant"""
        response = client.get("/statistics/offers/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
