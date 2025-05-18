#!/usr/bin/env python3
"""
Script de test d'intégration pour le système de billetterie des Jeux Olympiques.
Ce script teste l'interaction entre les différents services.
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration des URL des services
AUTH_SERVICE_URL = "http://localhost:8000"
TICKETS_SERVICE_URL = "http://localhost:8005"
ADMIN_SERVICE_URL = "http://localhost:8007"
VALIDATION_SERVICE_URL = "http://localhost:8008"

def test_auth_service():
    """Test du service d'authentification"""
    print("\n=== Test du service d'authentification ===")
    
    # Test de l'endpoint de santé
    try:
        response = requests.get(f"{AUTH_SERVICE_URL}/")
        print(f"Statut du service d'authentification: {response.status_code}")
        if response.status_code == 200:
            print("✅ Service d'authentification accessible")
        else:
            print("❌ Service d'authentification non accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la connexion au service d'authentification: {e}")
        return False
    
    # Test de création d'utilisateur
    try:
        user_data = {
            "email": f"test_{int(time.time())}@example.com",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User"
        }
        response = requests.post(f"{AUTH_SERVICE_URL}/users/", json=user_data)
        print(f"Création d'utilisateur: {response.status_code}")
        if response.status_code == 201:
            print("✅ Création d'utilisateur réussie")
            user_id = response.json().get("id")
            print(f"ID de l'utilisateur créé: {user_id}")
            return user_id
        else:
            print(f"❌ Échec de la création d'utilisateur: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la création d'utilisateur: {e}")
        return False

def test_admin_service():
    """Test du service d'administration"""
    print("\n=== Test du service d'administration ===")
    
    # Test de l'endpoint de santé
    try:
        response = requests.get(f"{ADMIN_SERVICE_URL}/")
        print(f"Statut du service d'administration: {response.status_code}")
        if response.status_code == 200:
            print("✅ Service d'administration accessible")
        else:
            print("❌ Service d'administration non accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la connexion au service d'administration: {e}")
        return False
    
    # Test de création d'offre
    try:
        offer_data = {
            "name": f"Test Offer {int(time.time())}",
            "description": "Test offer description",
            "price": 99.99,
            "quantity": 100,
            "type": "VIP",
            "event_date": (datetime.now() + timedelta(days=30)).isoformat()
        }
        response = requests.post(f"{ADMIN_SERVICE_URL}/offers/", json=offer_data)
        print(f"Création d'offre: {response.status_code}")
        if response.status_code == 201:
            print("✅ Création d'offre réussie")
            offer_id = response.json().get("id")
            print(f"ID de l'offre créée: {offer_id}")
            return offer_id
        else:
            print(f"❌ Échec de la création d'offre: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la création d'offre: {e}")
        return False

def test_tickets_service(user_id=1, offer_id=1):
    """Test du service de billetterie"""
    print("\n=== Test du service de billetterie ===")
    
    # Test de l'endpoint de santé
    try:
        response = requests.get(f"{TICKETS_SERVICE_URL}/")
        print(f"Statut du service de billetterie: {response.status_code}")
        if response.status_code == 200:
            print("✅ Service de billetterie accessible")
        else:
            print("❌ Service de billetterie non accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la connexion au service de billetterie: {e}")
        return False
    
    # Test d'achat de ticket
    try:
        ticket_data = {
            "user_id": user_id,
            "offer_id": offer_id
        }
        response = requests.post(f"{TICKETS_SERVICE_URL}/tickets/", json=ticket_data)
        print(f"Achat de ticket: {response.status_code}")
        if response.status_code == 201:
            print("✅ Achat de ticket réussi")
            ticket_id = response.json().get("id")
            security_key_2 = response.json().get("security_key_2")
            print(f"ID du ticket acheté: {ticket_id}")
            print(f"Clé de sécurité 2: {security_key_2}")
            return ticket_id, security_key_2
        else:
            print(f"❌ Échec de l'achat de ticket: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de l'achat de ticket: {e}")
        return False

def test_validation_service(ticket_id=1, security_key_1="test_key_1", security_key_2="test_key_2"):
    """Test du service de validation"""
    print("\n=== Test du service de validation ===")
    
    # Test de l'endpoint de santé
    try:
        response = requests.get(f"{VALIDATION_SERVICE_URL}/")
        print(f"Statut du service de validation: {response.status_code}")
        if response.status_code == 200:
            print("✅ Service de validation accessible")
        else:
            print("❌ Service de validation non accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la connexion au service de validation: {e}")
        return False
    
    # Test de validation de ticket
    try:
        # Simuler un QR code
        qr_data = f"{ticket_id}:{security_key_1}:{security_key_2}"
        validation_data = {
            "qr_data": qr_data,
            "employee_id": 1
        }
        response = requests.post(f"{VALIDATION_SERVICE_URL}/validate", json=validation_data)
        print(f"Validation de ticket: {response.status_code}")
        if response.status_code == 200:
            print("✅ Validation de ticket réussie")
            result = response.json()
            print(f"Résultat de la validation: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Échec de la validation de ticket: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la validation de ticket: {e}")
        return False

def main():
    """Fonction principale pour exécuter tous les tests"""
    print("=== Tests d'intégration du système de billetterie des Jeux Olympiques ===")
    
    # Test du service d'authentification
    user_id = test_auth_service()
    
    # Test du service d'administration
    offer_id = test_admin_service()
    
    # Test du service de billetterie
    if user_id and offer_id:
        ticket_result = test_tickets_service(user_id, offer_id)
        if ticket_result:
            ticket_id, security_key_2 = ticket_result
            # Test du service de validation
            test_validation_service(ticket_id, "security_key_1", security_key_2)
    else:
        # Utiliser des valeurs par défaut si les tests précédents ont échoué
        test_tickets_service()
        test_validation_service()
    
    print("\n=== Fin des tests d'intégration ===")

if __name__ == "__main__":
    main()
