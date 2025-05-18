#!/bin/bash
set -e

# Mettre à jour les variables d'environnement pour utiliser PostgreSQL
echo "Configuration des services pour utiliser PostgreSQL..."
docker exec bloc3-auth-service-1 bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/auth_db" > /app/.env'
docker exec bloc3-tickets-service-1 bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/tickets_db" > /app/.env'
docker exec bloc3-admin-service-1 bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/admin_db" > /app/.env'
docker exec bloc3-validation-service-1 bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/validation_db" > /app/.env'

# Exécuter les migrations Alembic pour chaque service
echo "Exécution des migrations pour le service d'authentification..."
docker exec bloc3-auth-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service de billetterie..."
docker exec bloc3-tickets-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service d'administration..."
docker exec bloc3-admin-service-1 bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service de validation..."
docker exec bloc3-validation-service-1 bash -c "cd /app && alembic upgrade head"

# Créer un utilisateur de test
echo "Création d'un utilisateur de test..."
docker exec bloc3-auth-service-1 python3 /app/create_test_user.py

echo "Migrations terminées avec succès."
