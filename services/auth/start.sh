#!/bin/bash

# Attendre que la base de données soit prête
echo "Attente de la base de données PostgreSQL..."
sleep 5

# Créer les tables de la base de données
echo "Création des tables de la base de données..."
python -c "from database import Base, engine; from models import User; Base.metadata.create_all(bind=engine)"

# Exécuter le script d'initialisation pour créer les utilisateurs
echo "Initialisation des utilisateurs..."
python init_db.py

# Démarrer le service
echo "Démarrage du service d'authentification..."
uvicorn main:app --host 0.0.0.0 --port 8000
