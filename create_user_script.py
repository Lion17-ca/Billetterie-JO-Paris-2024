#!/usr/bin/env python3
import requests
import json

def create_test_user():
    # Données de l'utilisateur employé
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
            "http://localhost:8000/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
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
    
    # Données de l'utilisateur régulier
    user_data = {
        "email": "user@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "Password123!",
        "is_employee": False,
        "is_admin": False
    }
    
    # Créer un utilisateur régulier
    try:
        response = requests.post(
            "http://localhost:8000/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
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
