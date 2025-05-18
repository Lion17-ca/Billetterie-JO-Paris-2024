import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
from unittest.mock import patch

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

class TestAdminRoutes:
    """Tests pour les routes API du service d'administration"""
    
    @pytest.fixture
    def test_db(self):
        """Crée une session de base de données de test"""
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    @pytest.fixture
    def test_offer(self, test_db):
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
    def test_offers(self, test_db):
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
    
    def test_docs(self):
        """Teste l'accès à la documentation de l'API"""
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_get_offers(self, test_offers):
        """Teste la route /offers/ pour récupérer toutes les offres"""
        response = client.get("/offers/")
        assert response.status_code == 200
        
        offers = response.json()
        assert len(offers) >= 3  # Au moins les 3 offres créées par le fixture
        
        # Vérifier que les offres de test sont présentes dans la réponse
        offer_names = [offer["name"] for offer in offers]
        for i in range(3):
            assert f"Test Offer {i+1}" in offer_names
    
    def test_create_offer(self):
        """Teste la route /offers/ pour créer une nouvelle offre"""
        offer_data = {
            "name": "New Test Offer",
            "description": "New Test Offer Description",
            "price": 150.0,
            "quantity": 200,
            "type": "duo",
            "event_date": (datetime.now() + timedelta(days=45)).isoformat()
        }
        
        response = client.post("/offers/", json=offer_data)
        assert response.status_code == 201
        
        created_offer = response.json()
        assert created_offer["name"] == offer_data["name"]
        assert created_offer["description"] == offer_data["description"]
        assert created_offer["price"] == offer_data["price"]
        assert created_offer["quantity"] == offer_data["quantity"]
        assert created_offer["type"] == offer_data["type"]
        assert "id" in created_offer
        assert "created_at" in created_offer
    
    def test_update_offer(self, test_offer):
        """Teste la route /offers/{offer_id} pour mettre à jour une offre existante"""
        update_data = {
            "name": "Updated Offer Name",
            "price": 200.0
        }
        
        response = client.put(f"/offers/{test_offer.id}", json=update_data)
        assert response.status_code == 200
        
        updated_offer = response.json()
        assert updated_offer["name"] == update_data["name"]
        assert updated_offer["price"] == update_data["price"]
        assert updated_offer["description"] == test_offer.description  # Inchangé
        assert updated_offer["quantity"] == test_offer.quantity  # Inchangé
    
    def test_update_offer_not_found(self):
        """Teste la route /offers/{offer_id} avec un ID d'offre inexistant"""
        update_data = {
            "name": "Updated Offer Name",
            "price": 200.0
        }
        
        response = client.put("/offers/9999", json=update_data)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_delete_offer(self, test_offer):
        """Teste la route /offers/{offer_id} pour supprimer une offre existante"""
        response = client.delete(f"/offers/{test_offer.id}")
        assert response.status_code == 204
        
        # Vérifier que l'offre a bien été supprimée
        # Nous utilisons la route /offers/ pour vérifier que l'offre n'est plus dans la liste
        response = client.get("/offers/")
        assert response.status_code == 200
        
        offers = response.json()
        offer_ids = [offer["id"] for offer in offers]
        assert test_offer.id not in offer_ids
    
    def test_delete_offer_not_found(self):
        """Teste la route /offers/{offer_id} avec un ID d'offre inexistant"""
        response = client.delete("/offers/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_sales_summary(self, test_offers):
        """Teste la route /sales/ pour récupérer un résumé des ventes"""
        response = client.get("/sales/")
        assert response.status_code == 200
        
        sales = response.json()
        assert len(sales) >= 3  # Au moins les 3 offres créées par le fixture
        
        # Vérifier la structure des données de vente
        for sale in sales:
            assert "offer_id" in sale
            assert "offer_name" in sale
            assert "tickets_sold" in sale
            assert "total_revenue" in sale
            assert "event_date" in sale
    
    def test_get_offer_sales(self, test_offer):
        """Teste la route /sales/{offer_id} pour récupérer les détails des ventes d'une offre"""
        response = client.get(f"/sales/{test_offer.id}")
        assert response.status_code == 200
        
        sales_detail = response.json()
        assert sales_detail["offer_id"] == test_offer.id
        assert sales_detail["offer_name"] == test_offer.name
        assert "tickets_sold" in sales_detail
        assert "total_revenue" in sales_detail
        assert "event_date" in sales_detail
        assert "sales_by_day" in sales_detail
        
        # Vérifier la structure des données de vente par jour
        for day_sale in sales_detail["sales_by_day"]:
            assert "date" in day_sale
            assert "count" in day_sale
    
    def test_get_offer_sales_not_found(self):
        """Teste la route /sales/{offer_id} avec un ID d'offre inexistant"""
        response = client.get("/sales/9999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

# Exécuter les tests si le script est exécuté directement
if __name__ == "__main__":
    pytest.main(["-v"])
