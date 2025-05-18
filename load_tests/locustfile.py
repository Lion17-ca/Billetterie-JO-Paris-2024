import time
import random
import json
from locust import HttpUser, task, between

class TicketingUser(HttpUser):
    wait_time = between(1, 5)  # Temps d'attente entre les actions (1-5 secondes)
    
    # Variables pour stocker les informations de session
    token = None
    user_id = None
    ticket_id = None
    
    def on_start(self):
        """Méthode exécutée lorsqu'un utilisateur virtuel démarre"""
        # Enregistrement d'un nouvel utilisateur avec un email aléatoire
        email = f"user_{random.randint(1, 1000000)}@example.com"
        self.register_and_login(email)
    
    def register_and_login(self, email):
        """Enregistre un nouvel utilisateur et se connecte"""
        # Enregistrement
        register_data = {
            "email": email,
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "0123456789"
        }
        
        with self.client.post("/auth/register", json=register_data, catch_response=True) as response:
            if response.status_code == 201:
                response.success()
            else:
                response.failure(f"Échec de l'enregistrement: {response.status_code}")
                return
        
        # Connexion
        login_data = {
            "username": email,
            "password": "Password123!"
        }
        
        with self.client.post("/auth/token", data=login_data, catch_response=True) as response:
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
                if self.token:
                    response.success()
                else:
                    response.failure("Token non trouvé dans la réponse")
            else:
                response.failure(f"Échec de la connexion: {response.status_code}")
    
    @task(3)
    def browse_offers(self):
        """Parcourir les offres disponibles"""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        
        with self.client.get("/tickets/offers", headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                offers = response.json()
                if offers and len(offers) > 0:
                    # Stocker une offre aléatoire pour un achat potentiel
                    self.offer_id = random.choice(offers)["id"]
                    response.success()
                else:
                    response.failure("Aucune offre disponible")
            else:
                response.failure(f"Échec de récupération des offres: {response.status_code}")
    
    @task(1)
    def purchase_ticket(self):
        """Acheter un billet"""
        if not self.token or not hasattr(self, 'offer_id'):
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        purchase_data = {
            "offer_id": self.offer_id,
            "quantity": 1
        }
        
        with self.client.post("/tickets/purchase", json=purchase_data, headers=headers, catch_response=True) as response:
            if response.status_code == 201:
                result = response.json()
                self.ticket_id = result.get("id")
                response.success()
            else:
                response.failure(f"Échec de l'achat du billet: {response.status_code}")
    
    @task(2)
    def view_my_tickets(self):
        """Consulter mes billets"""
        if not self.token:
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        with self.client.get("/tickets/my-tickets", headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Échec de récupération des billets: {response.status_code}")


class ValidationUser(HttpUser):
    """Utilisateur qui simule la validation des billets sur site"""
    wait_time = between(1, 3)  # Temps d'attente plus court pour les validations
    
    @task
    def validate_ticket(self):
        """Valider un billet aléatoire"""
        # Dans un scénario réel, nous aurions besoin d'une liste de billets valides
        # Ici, nous simulons avec un ID aléatoire
        ticket_id = f"ticket_{random.randint(1, 10000)}"
        validation_data = {
            "ticket_id": ticket_id,
            "location": "Entrance A"
        }
        
        headers = {"Authorization": "Bearer employee_token"}  # Simuler un token d'employé
        
        with self.client.post("/validation/validate", json=validation_data, headers=headers, catch_response=True) as response:
            # Dans un test réel, la plupart des validations échoueraient car nous utilisons des IDs aléatoires
            # Mais pour le test de charge, nous considérons que c'est normal
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Échec de validation inattendu: {response.status_code}")


class AdminUser(HttpUser):
    """Utilisateur administrateur qui consulte les statistiques"""
    wait_time = between(5, 15)  # Les admins font moins d'actions, mais plus lourdes
    
    def on_start(self):
        """Connexion en tant qu'admin"""
        login_data = {
            "username": "admin@example.com",
            "password": "AdminPassword123!"
        }
        
        with self.client.post("/auth/token", data=login_data, catch_response=True) as response:
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
            else:
                self.token = None
    
    @task
    def view_sales_statistics(self):
        """Consulter les statistiques de vente"""
        if not hasattr(self, 'token') or not self.token:
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        with self.client.get("/admin/sales-statistics", headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Échec de récupération des statistiques: {response.status_code}")
