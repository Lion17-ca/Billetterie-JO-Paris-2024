import pytest
import sys
import os
from datetime import datetime, timedelta
import base64
from io import BytesIO

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import generate_security_key_2, generate_qr_code
import models
from schemas import OfferCreate, TicketCreate

# Tests pour la génération de clé de sécurité
class TestSecurityKeyGeneration:
    def test_security_key_2_generation(self):
        """Vérifie que la deuxième clé de sécurité est générée correctement"""
        key = generate_security_key_2()
        assert key is not None
        assert isinstance(key, str)
        assert len(key) == 64  # 32 octets en hexadécimal = 64 caractères

    def test_security_keys_uniqueness(self):
        """Vérifie que deux clés générées sont différentes"""
        key1 = generate_security_key_2()
        key2 = generate_security_key_2()
        assert key1 != key2

# Tests pour la génération de QR code
class TestQRCodeGeneration:
    def test_qr_code_generation(self):
        """Vérifie que le QR code est généré correctement"""
        ticket_id = 123
        security_key_1 = "test_key_1"
        security_key_2 = "test_key_2"
        
        qr_code = generate_qr_code(ticket_id, security_key_1, security_key_2)
        
        # Vérifier que le QR code est une chaîne base64 valide
        assert qr_code.startswith("data:image/png;base64,")
        
        # Extraire et décoder la partie base64
        base64_part = qr_code.split(",")[1]
        try:
            decoded = base64.b64decode(base64_part)
            assert len(decoded) > 0
        except Exception:
            pytest.fail("Le QR code généré n'est pas un base64 valide")

    def test_qr_code_content(self):
        """Vérifie que le contenu du QR code contient les informations attendues"""
        # Note: Ce test est limité car nous ne pouvons pas facilement décoder le contenu du QR code
        # Dans un environnement réel, on pourrait utiliser une bibliothèque de lecture de QR code
        ticket_id = 123
        security_key_1 = "test_key_1"
        security_key_2 = "test_key_2"
        
        qr_code1 = generate_qr_code(ticket_id, security_key_1, security_key_2)
        qr_code2 = generate_qr_code(456, security_key_1, security_key_2)
        
        # Vérifier que des entrées différentes produisent des QR codes différents
        assert qr_code1 != qr_code2

# Tests pour les fonctions de modèle (avec mock de la base de données)
class TestTicketModels:
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
        
    def test_create_ticket(self, test_db):
        """Vérifie que la création d'un ticket fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = models.create_offer(test_db, OfferCreate(**offer_data))
        
        # Créer un ticket
        ticket_data = {
            "user_id": 1,
            "offer_id": offer.id
        }
        ticket = TicketCreate(**ticket_data)
        security_key_2 = generate_security_key_2()
        db_ticket = models.create_ticket(test_db, ticket, security_key_2)
        
        # Vérifier que le ticket a été créé avec les bonnes données
        assert db_ticket.id is not None
        assert db_ticket.user_id == ticket_data["user_id"]
        assert db_ticket.offer_id == ticket_data["offer_id"]
        assert db_ticket.security_key_2 == security_key_2
        assert db_ticket.is_used is False
        
    def test_get_ticket(self, test_db):
        """Vérifie que la récupération d'un ticket fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = models.create_offer(test_db, OfferCreate(**offer_data))
        
        # Créer un ticket
        ticket_data = {
            "user_id": 1,
            "offer_id": offer.id
        }
        ticket = TicketCreate(**ticket_data)
        security_key_2 = generate_security_key_2()
        created_ticket = models.create_ticket(test_db, ticket, security_key_2)
        
        # Récupérer le ticket
        retrieved_ticket = models.get_ticket(test_db, created_ticket.id)
        
        # Vérifier que le ticket récupéré correspond à celui créé
        assert retrieved_ticket is not None
        assert retrieved_ticket.id == created_ticket.id
        assert retrieved_ticket.user_id == ticket_data["user_id"]
        assert retrieved_ticket.offer_id == ticket_data["offer_id"]
        
    def test_get_tickets_by_user(self, test_db):
        """Vérifie que la récupération des tickets d'un utilisateur fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = models.create_offer(test_db, OfferCreate(**offer_data))
        
        # Créer plusieurs tickets pour le même utilisateur
        user_id = 42
        ticket_data = {
            "user_id": user_id,
            "offer_id": offer.id
        }
        
        # Créer 3 tickets pour cet utilisateur
        for _ in range(3):
            ticket = TicketCreate(**ticket_data)
            security_key_2 = generate_security_key_2()
            models.create_ticket(test_db, ticket, security_key_2)
        
        # Récupérer les tickets de l'utilisateur
        user_tickets = models.get_tickets_by_user(test_db, user_id)
        
        # Vérifier qu'il y a exactement 3 tickets
        assert len(user_tickets) == 3
        for ticket in user_tickets:
            assert ticket.user_id == user_id
            
    def test_mark_ticket_as_used(self, test_db):
        """Vérifie que le marquage d'un ticket comme utilisé fonctionne correctement"""
        # Créer une offre
        offer_data = {
            "name": "Test Offer",
            "description": "Test Description",
            "price": 99.99,
            "quantity": 100,
            "type": "solo",
            "event_date": datetime.now() + timedelta(days=30)
        }
        offer = models.create_offer(test_db, OfferCreate(**offer_data))
        
        # Créer un ticket
        ticket_data = {
            "user_id": 1,
            "offer_id": offer.id
        }
        ticket = TicketCreate(**ticket_data)
        security_key_2 = generate_security_key_2()
        created_ticket = models.create_ticket(test_db, ticket, security_key_2)
        
        # Vérifier que le ticket n'est pas utilisé initialement
        assert created_ticket.is_used is False
        assert created_ticket.used_date is None
        
        # Marquer le ticket comme utilisé
        updated_ticket = models.mark_ticket_as_used(test_db, created_ticket.id)
        
        # Vérifier que le ticket est maintenant marqué comme utilisé
        assert updated_ticket.is_used is True
        assert updated_ticket.used_date is not None
