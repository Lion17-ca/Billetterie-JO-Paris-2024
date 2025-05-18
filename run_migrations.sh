#!/bin/bash
set -e

# Exécuter les migrations Alembic pour chaque service
echo "Exécution des migrations pour le service d'authentification..."
docker exec bloc3-auth-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service de billetterie..."
docker exec bloc3-tickets-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service d'administration..."
docker exec bloc3-admin-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service de validation..."
docker exec bloc3-validation-service-1 bash -c "cd /app && alembic upgrade head"

echo "Toutes les migrations ont été exécutées avec succès."
