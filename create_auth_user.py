#!/usr/bin/env python3
import os
import sys
import requests
import json

# Configuration
API_URL = "http://localhost:8000"  # URL du service d'authentification

def create_test_user():
    # Données de l'utilisateur
    user_data = {
        "email": "employee@example.com",
        "first_name": "Test",
        "last_name": "Employee",
        "password": "Password123!",
        "is_employee": True,
        "is_admin": False
    }
    
    # Créer un utilisateur employé
    try:
        response = requests.post(
            f"{API_URL}/register",
            json=user_data
        )
        
        if response.status_code == 200:
            print("Utilisateur employé créé avec succès.")
            print(response.json())
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("L'email est déjà enregistré. Essayons de nous connecter avec cet utilisateur.")
        else:
            print(f"Erreur lors de la création de l'utilisateur employé: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Erreur lors de la requête: {e}")
    
    # Créer un utilisateur régulier
    user_data = {
        "email": "user@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "Password123!",
        "is_employee": False,
        "is_admin": False
    }
    
    try:
        response = requests.post(
            f"{API_URL}/register",
            json=user_data
        )
        
        if response.status_code == 200:
            print("Utilisateur régulier créé avec succès.")
            print(response.json())
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("L'email est déjà enregistré. Essayons de nous connecter avec cet utilisateur.")
        else:
            print(f"Erreur lors de la création de l'utilisateur régulier: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Erreur lors de la requête: {e}")

if __name__ == "__main__":
    create_test_user()
