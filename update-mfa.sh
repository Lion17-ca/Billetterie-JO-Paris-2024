#!/bin/bash

# Arrêter les conteneurs
echo "Arrêt des conteneurs..."
docker-compose down

# Reconstruire le frontend avec l'option --no-cache
echo "Reconstruction du frontend..."
docker-compose build --no-cache frontend

# Redémarrer tous les conteneurs
echo "Redémarrage des conteneurs..."
docker-compose up -d

echo "Terminé! Accédez à http://localhost:3000/mfa-setup pour voir les modifications."
