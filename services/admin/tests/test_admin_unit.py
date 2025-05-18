import pytest
import sys
import os
from datetime import datetime, timedelta

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
from schemas import OfferCreate, OfferUpdate

# Tests pour les fonctions de gestion des offres
class TestOfferManagement:
    def test_create_offer(self, test_db):
        """Vérifie que la création d'une offre fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = OfferCreate(**offer_data)
        db_offer = models.create_offer(test_db, offer)
        
        # Vérifier que l'offre a été créée avec les bonnes données
        assert db_offer.id is not None
        assert db_offer.name == offer_data["name"]
        assert db_offer.description == offer_data["description"]
        assert db_offer.price == offer_data["price"]
        assert db_offer.quantity == offer_data["quantity"]
        assert db_offer.type == offer_data["type"]
        
    def test_get_offer(self, test_db):
        """Vérifie que la récupération d'une offre fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer 2",
            "description": "Test Description 2",
            "price": 149.99,
            "quantity": 50,
            "type": "duo",
            "event_date": datetime.now() + timedelta(days=60)
        }
        offer = OfferCreate(**offer_data)
        created_offer = models.create_offer(test_db, offer)
        
        # Récupérer l'offre
        retrieved_offer = models.get_offer(test_db, created_offer.id)
        
        # Vérifier que l'offre récupérée correspond à celle créée
        assert retrieved_offer is not None
        assert retrieved_offer.id == created_offer.id
        assert retrieved_offer.name == offer_data["name"]
        assert retrieved_offer.price == offer_data["price"]
        
    def test_get_offers(self, test_db):
        """Vérifie que la récupération de plusieurs offres fonctionne correctement"""
        # Créer plusieurs offres
        offer_data1 = {
            "name": "Offer 1",
            "description": "Description 1",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer_data2 = {
            "name": "Offer 2",
            "description": "Description 2",
            "price": 149.99,
            "quantity": 50,
            "type": "duo",
            "event_date": datetime.now() + timedelta(days=60)
        }
        
        models.create_offer(test_db, OfferCreate(**offer_data1))
        models.create_offer(test_db, OfferCreate(**offer_data2))
        
        # Récupérer toutes les offres
        offers = models.get_offers(test_db)
        
        # Vérifier qu'il y a au moins 2 offres
        assert len(offers) >= 2
        
    def test_update_offer(self, test_db):
        """Vérifie que la mise à jour d'une offre fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Original Offer",
            "description": "Original Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = OfferCreate(**offer_data)
        created_offer = models.create_offer(test_db, offer)
        
        # Mettre à jour l'offre
        update_data = {
            "name": "Updated Offer",
            "price": 129.99,
            "description": "Updated Description"
        }
        updated_offer = models.update_offer(test_db, created_offer.id, OfferUpdate(**update_data))
        
        # Vérifier que l'offre a été mise à jour correctement
        assert updated_offer.id == created_offer.id
        assert updated_offer.name == update_data["name"]
        assert updated_offer.price == update_data["price"]
        assert updated_offer.description == update_data["description"]
        # Vérifier que les champs non mis à jour sont inchangés
        assert updated_offer.quantity == offer_data["quantity"]
        assert updated_offer.type == offer_data["type"]
        
    def test_delete_offer(self, test_db):
        """Vérifie que la suppression d'une offre fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Offer to Delete",
            "description": "Will be deleted",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = OfferCreate(**offer_data)
        created_offer = models.create_offer(test_db, offer)
        
        # Vérifier que l'offre existe
        assert models.get_offer(test_db, created_offer.id) is not None
        
        # Supprimer l'offre
        deleted_offer = models.delete_offer(test_db, created_offer.id)
        
        # Vérifier que l'offre a été supprimée
        assert deleted_offer.id == created_offer.id
        assert models.get_offer(test_db, created_offer.id) is None

# Tests pour les fonctions de statistiques de vente
class TestSalesStatistics:
    def test_get_sales_summary(self, test_db):
        """Vérifie que la récupération du résumé des ventes fonctionne correctement"""
        # Créer quelques offres
        offer_data1 = {
            "name": "Sales Offer 1",
            "description": "Description 1",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer_data2 = {
            "name": "Sales Offer 2",
            "description": "Description 2",
            "price": 149.99,
            "quantity": 50,
            "type": "duo",
            "event_date": datetime.now() + timedelta(days=60)
        }
        
        offer1 = models.create_offer(test_db, OfferCreate(**offer_data1))
        offer2 = models.create_offer(test_db, OfferCreate(**offer_data2))
        
        # Récupérer le résumé des ventes
        sales_summary = models.get_sales_summary(test_db)
        
        # Vérifier que le résumé des ventes contient les offres créées
        assert len(sales_summary) >= 2
        
        # Vérifier que les données de vente sont correctes pour chaque offre
        for sale in sales_summary:
            if sale["offer_id"] == offer1.id:
                assert sale["offer_name"] == offer1.name
                assert sale["tickets_sold"] == offer1.id * 10
                assert sale["total_revenue"] == sale["tickets_sold"] * offer1.price
            elif sale["offer_id"] == offer2.id:
                assert sale["offer_name"] == offer2.name
                assert sale["tickets_sold"] == offer2.id * 10
                assert sale["total_revenue"] == sale["tickets_sold"] * offer2.price
        
    def test_get_offer_sales_detail(self, test_db):
        """Vérifie que la récupération des détails des ventes pour une offre fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Sales Detail Offer",
            "description": "Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = models.create_offer(test_db, OfferCreate(**offer_data))
        
        # Récupérer les détails des ventes pour cette offre
        sales_detail = models.get_offer_sales_detail(test_db, offer.id)
        
        # Vérifier que les détails des ventes sont corrects
        assert sales_detail["offer_id"] == offer.id
        assert sales_detail["offer_name"] == offer.name
        assert sales_detail["tickets_sold"] == offer.id * 10
        assert sales_detail["total_revenue"] == sales_detail["tickets_sold"] * offer.price
        assert "sales_by_day" in sales_detail
        assert len(sales_detail["sales_by_day"]) == sales_detail["tickets_sold"]
        
        # Vérifier que chaque entrée dans sales_by_day a le bon format
        for sale in sales_detail["sales_by_day"]:
            assert "date" in sale
            assert "count" in sale
            assert sale["count"] == 1
