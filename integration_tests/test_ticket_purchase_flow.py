import os
import sys
import pytest
import requests
from datetime import datetime, timedelta

# Ajouter les chemins des services au PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'services/auth'))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'services/tickets'))

# Configuration des URLs pour les tests
AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:8000')
TICKETS_SERVICE_URL = os.getenv('TICKETS_SERVICE_URL', 'http://localhost:8001')

@pytest.fixture
def test_user():
    """Crée un utilisateur de test pour les tests d'intégration"""
    user = {
        'email': f'test_{datetime.now().timestamp()}@example.com',
        'password': 'SecurePassword123!',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    # Enregistrer l'utilisateur via l'API
    response = requests.post(f"{AUTH_SERVICE_URL}/auth/register", json=user)
    assert response.status_code == 201, f"Failed to create test user: {response.text}"
    
    # Activer l'utilisateur (dans un environnement de test)
    user_id = response.json()['id']
    requests.post(f"{AUTH_SERVICE_URL}/auth/activate/{user_id}")
    
    return user

@pytest.fixture
def auth_token(test_user):
    """Obtient un token d'authentification pour l'utilisateur de test"""
    login_data = {
        'email': test_user['email'],
        'password': test_user['password']
    }
    
    response = requests.post(f"{AUTH_SERVICE_URL}/auth/login", json=login_data)
    assert response.status_code == 200, f"Failed to login: {response.text}"
    
    return response.json()['access_token']

@pytest.fixture
def test_event():
    """Crée un événement de test pour les achats de billets"""
    event_data = {
        'name': f'Test Event {datetime.now().timestamp()}',
        'description': 'Event created for integration testing',
        'date': (datetime.now().date() + timedelta(days=30)).isoformat(),
        'venue': 'Test Venue',
        'category': 'Test Category',
        'price': 50.00,
        'available_tickets': 100
    }
    
    # Créer l'événement via l'API d'administration (nécessite un token admin)
    admin_token = get_admin_token()  # Fonction à implémenter pour obtenir un token admin
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    response = requests.post(f"{TICKETS_SERVICE_URL}/events", json=event_data, headers=headers)
    assert response.status_code == 201, f"Failed to create test event: {response.text}"
    
    return response.json()

def get_admin_token():
    """Obtient un token d'authentification pour un administrateur"""
    admin_credentials = {
        'email': os.getenv('ADMIN_EMAIL', 'admin@example.com'),
        'password': os.getenv('ADMIN_PASSWORD', 'AdminPassword123!')
    }
    
    response = requests.post(f"{AUTH_SERVICE_URL}/auth/login", json=admin_credentials)
    assert response.status_code == 200, f"Failed to login as admin: {response.text}"
    
    return response.json()['access_token']

class TestTicketPurchaseFlow:
    """Tests d'intégration pour le flux complet d'achat de billet"""
    
    def test_complete_purchase_flow(self, test_user, auth_token, test_event):
        """Test du flux complet d'achat de billet, de l'authentification à la génération du QR code"""
        # 1. Vérifier que l'utilisateur n'a pas encore de billets
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = requests.get(f"{TICKETS_SERVICE_URL}/tickets/my", headers=headers)
        
        assert response.status_code == 200
        initial_tickets = response.json()
        
        # 2. Acheter un billet pour l'événement
        purchase_data = {
            'event_id': test_event['id'],
            'quantity': 2
        }
        
        response = requests.post(
            f"{TICKETS_SERVICE_URL}/tickets/purchase",
            json=purchase_data,
            headers=headers
        )
        
        assert response.status_code == 201, f"Failed to purchase ticket: {response.text}"
        purchase_result = response.json()
        
        # Vérifier que l'achat a réussi
        assert 'ticket_ids' in purchase_result
        assert len(purchase_result['ticket_ids']) == 2
        
        # 3. Vérifier que les billets apparaissent dans "Mes billets"
        response = requests.get(f"{TICKETS_SERVICE_URL}/tickets/my", headers=headers)
        
        assert response.status_code == 200
        updated_tickets = response.json()
        
        # Vérifier que le nombre de billets a augmenté de 2
        assert len(updated_tickets) == len(initial_tickets) + 2
        
        # 4. Récupérer les détails d'un billet spécifique
        ticket_id = purchase_result['ticket_ids'][0]
        response = requests.get(
            f"{TICKETS_SERVICE_URL}/tickets/{ticket_id}",
            headers=headers
        )
        
        assert response.status_code == 200
        ticket_details = response.json()
        
        # Vérifier que le billet contient les informations nécessaires
        assert 'qr_code' in ticket_details
        assert 'event_name' in ticket_details
        assert ticket_details['event_name'] == test_event['name']
        
        # 5. Vérifier que le QR code contient les deux clés de sécurité
        # Note: Ceci est une simulation car nous n'avons pas accès au contenu décodé du QR code
        assert ticket_details['qr_code'] is not None
        assert len(ticket_details['qr_code']) > 0
        
        # 6. Simuler la validation du billet (nécessite un token d'employé)
        employee_token = get_employee_token()  # Fonction à implémenter
        headers = {'Authorization': f'Bearer {employee_token}'}
        
        validation_data = {
            'ticket_id': ticket_id,
            'qr_code': ticket_details['qr_code']
        }
        
        response = requests.post(
            f"{TICKETS_SERVICE_URL}/validation/validate",
            json=validation_data,
            headers=headers
        )
        
        assert response.status_code == 200
        validation_result = response.json()
        
        # Vérifier que la validation a réussi
        assert validation_result['valid'] is True
        assert validation_result['used'] is False  # Le billet n'était pas encore utilisé
        
        # 7. Marquer le billet comme utilisé
        response = requests.post(
            f"{TICKETS_SERVICE_URL}/validation/mark-used/{ticket_id}",
            headers=headers
        )
        
        assert response.status_code == 200
        
        # 8. Vérifier que le billet ne peut pas être utilisé à nouveau
        response = requests.post(
            f"{TICKETS_SERVICE_URL}/validation/validate",
            json=validation_data,
            headers=headers
        )
        
        assert response.status_code == 200
        validation_result = response.json()
        
        # Le billet devrait être valide mais déjà utilisé
        assert validation_result['valid'] is True
        assert validation_result['used'] is True

def get_employee_token():
    """Obtient un token d'authentification pour un employé"""
    employee_credentials = {
        'email': os.getenv('EMPLOYEE_EMAIL', 'employee@example.com'),
        'password': os.getenv('EMPLOYEE_PASSWORD', 'EmployeePassword123!')
    }
    
    response = requests.post(f"{AUTH_SERVICE_URL}/auth/login", json=employee_credentials)
    assert response.status_code == 200, f"Failed to login as employee: {response.text}"
    
    return response.json()['access_token']
