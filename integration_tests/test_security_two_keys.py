import os
import sys
import pytest
import requests
from datetime import datetime
import json
import time

# Configuration des URLs des services
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8000")
TICKETS_SERVICE_URL = os.getenv("TICKETS_SERVICE_URL", "http://localhost:8001")
VALIDATION_SERVICE_URL = os.getenv("VALIDATION_SERVICE_URL", "http://localhost:8002")
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8080")

# Utiliser l'API Gateway pour tous les appels
BASE_URL = API_GATEWAY_URL

@pytest.fixture
def test_user():
    """Crée un utilisateur de test pour les scénarios"""
    # Générer un email unique pour éviter les conflits
    email = f"security_test_{datetime.now().timestamp()}@example.com"
    user_data = {
        'first_name': 'Security',
        'last_name': 'Test',
        'email': email,
        'password': 'SecurePassword123!',
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
def test_ticket(test_user, auth_token):
    """Crée un ticket de test pour les scénarios"""
    # Récupérer les offres disponibles
    response = requests.get(f"{BASE_URL}/tickets/offers")
    assert response.status_code == 200, "Échec de la récupération des offres"
    
    offers = response.json()
    assert len(offers) > 0, "Aucune offre disponible pour les tests"
    
    # Utiliser la première offre disponible
    offer_id = offers[0]["id"]
    
    # Acheter un billet
    purchase_data = {
        'offer_id': offer_id,
        'quantity': 1
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.post(f"{BASE_URL}/tickets/purchase", json=purchase_data, headers=headers)
    assert response.status_code == 200, f"Échec de l'achat du billet: {response.text}"
    
    purchase_result = response.json()
    assert "ticket_id" in purchase_result, "ID du ticket manquant dans la réponse"
    
    # Récupérer le ticket créé
    ticket_id = purchase_result["ticket_id"]
    response = requests.get(f"{BASE_URL}/tickets/{ticket_id}", headers=headers)
    assert response.status_code == 200, f"Échec de la récupération du ticket: {response.text}"
    
    ticket = response.json()
    
    # Récupérer le QR code du ticket
    response = requests.get(f"{BASE_URL}/tickets/{ticket_id}/qrcode", headers=headers)
    assert response.status_code == 200, "Échec de la récupération du QR code"
    
    qr_data = response.json()
    assert "qr_code" in qr_data, "QR code manquant dans la réponse"
    
    # Ajouter le QR code au ticket pour les tests
    ticket["qr_code"] = qr_data["qr_code"]
    
    return ticket

class TestTwoKeySecuritySystem:
    """Tests spécifiques pour le système de sécurité à deux clés"""
    
    def test_security_key_generation(self, test_user, auth_token):
        """Vérifie que les deux clés de sécurité sont générées correctement"""
        # 1. Récupérer les informations de l'utilisateur pour vérifier la première clé
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/auth/users/me", headers=headers)
        assert response.status_code == 200, "Échec de la récupération des informations utilisateur"
        
        user_info = response.json()
        assert "security_key_1" in user_info, "Première clé de sécurité manquante"
        assert user_info["security_key_1"] is not None, "La première clé de sécurité est nulle"
        assert len(user_info["security_key_1"]) > 0, "La première clé de sécurité est vide"
        
        # 2. Acheter un billet pour générer la deuxième clé
        # Récupérer les offres disponibles
        response = requests.get(f"{BASE_URL}/tickets/offers")
        assert response.status_code == 200, "Échec de la récupération des offres"
        
        offers = response.json()
        assert len(offers) > 0, "Aucune offre disponible pour les tests"
        
        # Utiliser la première offre disponible
        offer_id = offers[0]["id"]
        
        # Acheter un billet
        purchase_data = {
            'offer_id': offer_id,
            'quantity': 1
        }
        
        response = requests.post(f"{BASE_URL}/tickets/purchase", json=purchase_data, headers=headers)
        assert response.status_code == 200, f"Échec de l'achat du billet: {response.text}"
        
        purchase_result = response.json()
        assert "ticket_id" in purchase_result, "ID du ticket manquant dans la réponse"
        ticket_id = purchase_result["ticket_id"]
        
        # Récupérer le ticket pour vérifier la deuxième clé
        response = requests.get(f"{BASE_URL}/tickets/{ticket_id}", headers=headers)
        assert response.status_code == 200, f"Échec de la récupération du ticket: {response.text}"
        
        ticket = response.json()
        assert "security_key_2" in ticket, "Deuxième clé de sécurité manquante"
        assert ticket["security_key_2"] is not None, "La deuxième clé de sécurité est nulle"
        assert len(ticket["security_key_2"]) > 0, "La deuxième clé de sécurité est vide"
        
        # Vérifier que les deux clés sont différentes
        assert user_info["security_key_1"] != ticket["security_key_2"], "Les deux clés de sécurité sont identiques"
    
    def test_qr_code_generation_with_two_keys(self, test_ticket):
        """Vérifie que le QR code est généré en utilisant les deux clés de sécurité"""
        # Le QR code devrait être une chaîne base64 valide
        assert test_ticket["qr_code"].startswith("data:image/png;base64,"), "Le QR code n'est pas au format base64"
        
        # Nous ne pouvons pas facilement décoder le contenu du QR code dans ce test,
        # mais nous pouvons vérifier qu'il est généré et qu'il a un format valide
    
    def test_ticket_validation_with_two_keys(self, test_ticket, employee_token):
        """Vérifie que la validation du ticket utilise correctement les deux clés de sécurité"""
        # Simuler l'extraction des données du QR code
        # Dans un cas réel, cela serait fait par le scan du QR code
        # Pour le test, nous utilisons un format connu
        ticket_id = test_ticket["id"]
        qr_content = f"{ticket_id}:security_key_1:security_key_2"
        
        # Valider le ticket
        validation_data = {
            'qr_data': qr_content,
            'employee_id': 1
        }
        
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 200, f"Échec de la validation du ticket: {response.text}"
        
        validation_result = response.json()
        assert validation_result["is_valid"] is True, "Le ticket n'a pas été validé correctement"
        assert validation_result["ticket_id"] == ticket_id, "L'ID du ticket validé ne correspond pas"
    
    def test_ticket_validation_with_invalid_keys(self, test_ticket, employee_token):
        """Vérifie que la validation échoue avec des clés de sécurité invalides"""
        ticket_id = test_ticket["id"]
        
        # Cas 1: Première clé invalide
        invalid_qr_content_1 = f"{ticket_id}:invalid_key_1:security_key_2"
        validation_data_1 = {
            'qr_data': invalid_qr_content_1,
            'employee_id': 1
        }
        
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data_1, headers=headers)
        assert response.status_code in [400, 401], "La validation avec une première clé invalide aurait dû échouer"
        
        # Cas 2: Deuxième clé invalide
        invalid_qr_content_2 = f"{ticket_id}:security_key_1:invalid_key_2"
        validation_data_2 = {
            'qr_data': invalid_qr_content_2,
            'employee_id': 1
        }
        
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data_2, headers=headers)
        assert response.status_code in [400, 401], "La validation avec une deuxième clé invalide aurait dû échouer"
        
        # Cas 3: Les deux clés invalides
        invalid_qr_content_3 = f"{ticket_id}:invalid_key_1:invalid_key_2"
        validation_data_3 = {
            'qr_data': invalid_qr_content_3,
            'employee_id': 1
        }
        
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data_3, headers=headers)
        assert response.status_code in [400, 401], "La validation avec deux clés invalides aurait dû échouer"
    
    def test_ticket_reuse_prevention(self, test_ticket, employee_token):
        """Vérifie que le système empêche la réutilisation d'un billet déjà utilisé"""
        ticket_id = test_ticket["id"]
        qr_content = f"{ticket_id}:security_key_1:security_key_2"
        
        validation_data = {
            'qr_data': qr_content,
            'employee_id': 1
        }
        
        # Première validation - devrait réussir
        headers = {"Authorization": f"Bearer {employee_token}"}
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 200, f"Échec de la première validation: {response.text}"
        
        # Deuxième validation - devrait échouer car le billet a déjà été utilisé
        response = requests.post(f"{BASE_URL}/validation/validate", json=validation_data, headers=headers)
        assert response.status_code == 400, "La deuxième validation aurait dû échouer"
        
        error_data = response.json()
        assert "detail" in error_data, "Message d'erreur manquant"
        assert "used" in error_data["detail"].lower(), "Le message d'erreur devrait indiquer que le billet a déjà été utilisé"

if __name__ == "__main__":
    # Exécuter les tests manuellement si nécessaire
    pytest.main(["-xvs", __file__])
