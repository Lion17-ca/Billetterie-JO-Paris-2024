import os
import sys
import pytest
import requests
from datetime import datetime, timedelta
import json
import time

# Configuration des URLs des services
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8000")
TICKETS_SERVICE_URL = os.getenv("TICKETS_SERVICE_URL", "http://localhost:8001")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://localhost:8003")
VALIDATION_SERVICE_URL = os.getenv("VALIDATION_SERVICE_URL", "http://localhost:8002")
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8080")

# Utiliser l'API Gateway pour tous les appels
BASE_URL = API_GATEWAY_URL

@pytest.fixture
def test_user():
    """Crée un utilisateur de test pour les scénarios"""
    # Générer un email unique pour éviter les conflits
    email = f"test_{datetime.now().timestamp()}@example.com"
    user_data = {
        'first_name': 'Test',
        'last_name': 'User',
        'email': email,
        'password': 'TestPassword123!',
    }
    
    # Enregistrer l'utilisateur
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    assert response.status_code == 201, f"Échec de la création de l'utilisateur: {response.text}"
    
    # Retourner les données de l'utilisateur pour les tests
    return user_data

@pytest.fixture
def auth_token(test_user):
    """Obtient un token d'authentification pour l'utilisateur de test"""
    login_data = {
        'username': test_user['email'],
        'password': test_user['password']
    }
    
    # Authentifier l'utilisateur
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    assert response.status_code == 200, f"Échec de l'authentification: {response.text}"
    
    token_data = response.json()
    assert "access_token" in token_data, "Le token d'accès est manquant dans la réponse"
    
    # Retourner le token pour les tests
    return token_data["access_token"]

@pytest.fixture
def admin_token():
    """Obtient un token d'authentification pour un administrateur"""
    # Utiliser un compte administrateur préconfiguré
    login_data = {
        'username': 'admin@example.com',
        'password': 'AdminPassword123!'
    }
    
    # Authentifier l'administrateur
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    assert response.status_code == 200, f"Échec de l'authentification admin: {response.text}"
    
    token_data = response.json()
    assert "access_token" in token_data, "Le token d'accès admin est manquant dans la réponse"
    
    # Retourner le token pour les tests
    return token_data["access_token"]

@pytest.fixture
def employee_token():
    """Obtient un token d'authentification pour un employé"""
    # Utiliser un compte employé préconfiguré
    login_data = {
        'username': 'employee@example.com',
        'password': 'EmployeePassword123!'
    }
    
    # Authentifier l'employé
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    assert response.status_code == 200, f"Échec de l'authentification employé: {response.text}"
    
    token_data = response.json()
    assert "access_token" in token_data, "Le token d'accès employé est manquant dans la réponse"
    
    # Retourner le token pour les tests
    return token_data["access_token"]

@pytest.fixture
def test_offer(admin_token):
    """Crée une offre de test pour les scénarios"""
    offer_data = {
        'name': f'Test Offer {datetime.now().timestamp()}',
        'description': 'Test offer for integration tests',
        'price': 99.99,
        'quantity': 100,
        'type': 'solo',
        'event_date': (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    # Créer l'offre avec le compte administrateur
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{BASE_URL}/admin/offers", json=offer_data, headers=headers)
    assert response.status_code == 201, f"Échec de la création de l'offre: {response.text}"
    
    # Retourner les données de l'offre pour les tests
    return response.json()

class TestE2ETicketPurchaseFlow:
    """Tests end-to-end pour le flux complet d'achat de billet"""
    
    def test_complete_purchase_flow(self, test_user, auth_token, test_offer, employee_token):
        """
        Test du flux complet:
        1. Utilisateur consulte les offres disponibles
        2. Utilisateur achète un billet
        3. Utilisateur visualise son billet avec QR code
        4. Employé valide le billet
        5. Administrateur visualise les statistiques de vente
        """
        # 1. Consulter les offres disponibles
        response = requests.get(f"{BASE_URL}/tickets/offers")
        assert response.status_code == 200, "Échec de la récupération des offres"
        offers = response.json()
        assert len(offers) > 0, "Aucune offre disponible"
        
        # Trouver l'offre créée pour le test
        test_offer_id = test_offer["id"]
        
        # 2. Acheter un billet
        purchase_data = {
            'offer_id': test_offer_id,
            'quantity': 1
        }
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/tickets/purchase", json=purchase_data, headers=headers)
        assert response.status_code == 200, f"Échec de l'achat du billet: {response.text}"
        
        purchase_result = response.json()
        assert "ticket_id" in purchase_result, "ID du ticket manquant dans la réponse"
        ticket_id = purchase_result["ticket_id"]
        
        # 3. Visualiser le billet avec QR code
        response = requests.get(f"{BASE_URL}/tickets/my-tickets", headers=headers)
        assert response.status_code == 200, "Échec de la récupération des billets"
        
        tickets = response.json()
        assert len(tickets) > 0, "Aucun billet trouvé pour l'utilisateur"
        
        # Trouver le billet acheté
        user_ticket = None
        for ticket in tickets:
            if ticket["id"] == ticket_id:
                user_ticket = ticket
                break
        
        assert user_ticket is not None, f"Billet {ticket_id} non trouvé dans les billets de l'utilisateur"
        
        # Récupérer le QR code du billet
        response = requests.get(f"{BASE_URL}/tickets/{ticket_id}/qrcode", headers=headers)
        assert response.status_code == 200, "Échec de la récupération du QR code"
        qr_data = response.json()
        assert "qr_code" in qr_data, "QR code manquant dans la réponse"
        
        # Extraire les données du QR code (dans un cas réel, cela serait fait par scan)
        # Pour le test, nous simulons l'extraction des données du QR code
        qr_content = f"{ticket_id}:security_key_1:security_key_2"
        
        # 4. Employé valide le billet
        validation_data = {
            'qr_data': qr_content,
            'employee_id': 1  # ID de l'employé qui valide le billet
        }
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 200, f"Échec de la validation du billet: {response.text}"
        
        validation_result = response.json()
        assert validation_result["is_valid"] is True, "Le billet n'a pas été validé correctement"
        assert validation_result["ticket_id"] == ticket_id, "L'ID du billet validé ne correspond pas"
        
        # Vérifier que le billet est maintenant marqué comme utilisé
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/tickets/{ticket_id}", headers=headers)
        assert response.status_code == 200, "Échec de la récupération du billet après validation"
        
        updated_ticket = response.json()
        assert updated_ticket["is_used"] is True, "Le billet n'a pas été marqué comme utilisé"
        assert updated_ticket["used_date"] is not None, "La date d'utilisation du billet n'a pas été enregistrée"
        
        # 5. Administrateur visualise les statistiques de vente
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/sales", headers=headers)
        assert response.status_code == 200, "Échec de la récupération des statistiques de vente"
        
        sales_stats = response.json()
        assert len(sales_stats) > 0, "Aucune statistique de vente disponible"
        
        # Vérifier les statistiques pour l'offre spécifique
        response = requests.get(f"{BASE_URL}/admin/sales/{test_offer_id}", headers=headers)
        assert response.status_code == 200, "Échec de la récupération des détails de vente pour l'offre"
        
        offer_stats = response.json()
        assert offer_stats["offer_id"] == test_offer_id, "L'ID de l'offre ne correspond pas"
        assert offer_stats["tickets_sold"] > 0, "Aucun billet vendu pour cette offre"
        
        # Test réussi - le flux complet fonctionne correctement
        print("Test du flux complet d'achat de billet réussi!")

class TestAuthIntegration:
    """Tests d'intégration pour le service d'authentification"""
    
    def test_register_login_flow(self):
        """Teste le flux d'inscription et de connexion"""
        # Générer un email unique
        email = f"integration_{datetime.now().timestamp()}@example.com"
        
        # 1. Inscription
        user_data = {
            'first_name': 'Integration',
            'last_name': 'Test',
            'email': email,
            'password': 'IntegrationTest123!'
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        assert response.status_code == 201, f"Échec de l'inscription: {response.text}"
        
        # 2. Connexion
        login_data = {
            'username': email,
            'password': 'IntegrationTest123!'
        }
        
        response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
        assert response.status_code == 200, f"Échec de la connexion: {response.text}"
        
        token_data = response.json()
        assert "access_token" in token_data, "Token d'accès manquant"
        assert "token_type" in token_data, "Type de token manquant"
        assert token_data["token_type"] == "bearer", "Type de token incorrect"
        
        # 3. Accéder à un endpoint protégé avec le token
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        response = requests.get(f"{BASE_URL}/auth/users/me", headers=headers)
        assert response.status_code == 200, "Échec de l'accès à un endpoint protégé"
        
        user_info = response.json()
        assert user_info["email"] == email, "L'email de l'utilisateur ne correspond pas"
        assert user_info["first_name"] == user_data["first_name"], "Le prénom de l'utilisateur ne correspond pas"
        assert user_info["last_name"] == user_data["last_name"], "Le nom de l'utilisateur ne correspond pas"

class TestTicketsIntegration:
    """Tests d'intégration pour le service de billetterie"""
    
    def test_offer_management(self, admin_token):
        """Teste la gestion des offres"""
        # 1. Créer une offre
        offer_data = {
            'name': f'Integration Offer {datetime.now().timestamp()}',
            'description': 'Integration test offer',
            'price': 149.99,
            'quantity': 50,
            'type': 'duo',
            'event_date': (datetime.now() + timedelta(days=60)).isoformat()
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{BASE_URL}/admin/offers", json=offer_data, headers=headers)
        assert response.status_code == 201, f"Échec de la création de l'offre: {response.text}"
        
        created_offer = response.json()
        offer_id = created_offer["id"]
        
        # 2. Récupérer l'offre créée
        response = requests.get(f"{BASE_URL}/tickets/offers/{offer_id}")
        assert response.status_code == 200, f"Échec de la récupération de l'offre: {response.text}"
        
        retrieved_offer = response.json()
        assert retrieved_offer["id"] == offer_id, "L'ID de l'offre ne correspond pas"
        assert retrieved_offer["name"] == offer_data["name"], "Le nom de l'offre ne correspond pas"
        assert retrieved_offer["price"] == offer_data["price"], "Le prix de l'offre ne correspond pas"
        
        # 3. Mettre à jour l'offre
        update_data = {
            'name': f'Updated Offer {datetime.now().timestamp()}',
            'price': 199.99
        }
        
        response = requests.put(f"{BASE_URL}/admin/offers/{offer_id}", json=update_data, headers=headers)
        assert response.status_code == 200, f"Échec de la mise à jour de l'offre: {response.text}"
        
        updated_offer = response.json()
        assert updated_offer["name"] == update_data["name"], "Le nom mis à jour ne correspond pas"
        assert updated_offer["price"] == update_data["price"], "Le prix mis à jour ne correspond pas"
        
        # 4. Supprimer l'offre
        response = requests.delete(f"{BASE_URL}/admin/offers/{offer_id}", headers=headers)
        assert response.status_code == 204, f"Échec de la suppression de l'offre: {response.text}"
        
        # Vérifier que l'offre a été supprimée
        response = requests.get(f"{BASE_URL}/tickets/offers/{offer_id}")
        assert response.status_code == 404, "L'offre n'a pas été correctement supprimée"

class TestValidationIntegration:
    """Tests d'intégration pour le service de validation"""
    
    def test_ticket_validation_flow(self, test_user, auth_token, test_offer, employee_token):
        """Teste le flux de validation des billets"""
        # 1. Acheter un billet
        purchase_data = {
            'offer_id': test_offer["id"],
            'quantity': 1
        }
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/tickets/purchase", json=purchase_data, headers=headers)
        assert response.status_code == 200, f"Échec de l'achat du billet: {response.text}"
        
        purchase_result = response.json()
        ticket_id = purchase_result["ticket_id"]
        
        # 2. Récupérer le QR code du billet
        response = requests.get(f"{BASE_URL}/tickets/{ticket_id}/qrcode", headers=headers)
        assert response.status_code == 200, "Échec de la récupération du QR code"
        
        # 3. Valider le billet (première validation - devrait réussir)
        qr_content = f"{ticket_id}:security_key_1:security_key_2"
        validation_data = {
            'qr_data': qr_content,
            'employee_id': 1
        }
        
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 200, f"Échec de la première validation: {response.text}"
        
        validation_result = response.json()
        assert validation_result["is_valid"] is True, "Le billet n'a pas été validé correctement"
        
        # 4. Tenter de valider le même billet une seconde fois (devrait échouer)
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 400, "La deuxième validation aurait dû échouer"
        
        # 5. Vérifier l'historique des validations
        response = requests.get(f"{BASE_URL}/validation/validations", headers=headers)
        assert response.status_code == 200, "Échec de la récupération de l'historique des validations"
        
        validations = response.json()
        assert len(validations) > 0, "Aucune validation trouvée dans l'historique"
        
        # Vérifier que notre validation est dans l'historique
        validation_found = False
        for validation in validations:
            if validation["ticket_id"] == ticket_id:
                validation_found = True
                break
        
        assert validation_found, f"Validation du billet {ticket_id} non trouvée dans l'historique"

if __name__ == "__main__":
    # Exécuter les tests manuellement si nécessaire
    pytest.main(["-xvs", __file__])
