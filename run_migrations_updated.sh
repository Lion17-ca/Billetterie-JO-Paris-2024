#!/bin/bash
set -e

# Récupérer les identifiants des conteneurs
AUTH_CONTAINER=$(docker ps | grep bloc3-auth-service | awk '{print $1}')
TICKETS_CONTAINER=$(docker ps | grep bloc3-tickets-service | awk '{print $1}')
ADMIN_CONTAINER=$(docker ps | grep bloc3-admin-service | awk '{print $1}')
VALIDATION_CONTAINER=$(docker ps | grep bloc3-validation-service | awk '{print $1}')

# Mettre à jour les variables d'environnement pour utiliser PostgreSQL
echo "Configuration des services pour utiliser PostgreSQL..."
docker exec $AUTH_CONTAINER bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/auth_db" > /app/.env'
docker exec $TICKETS_CONTAINER bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/tickets_db" > /app/.env'

# Vérifier si le conteneur admin existe
if [ ! -z "$ADMIN_CONTAINER" ]; then
  docker exec $ADMIN_CONTAINER bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/admin_db" > /app/.env'
fi

# Vérifier si le conteneur validation existe
if [ ! -z "$VALIDATION_CONTAINER" ]; then
  docker exec $VALIDATION_CONTAINER bash -c 'echo "DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/validation_db" > /app/.env'
fi

# Exécuter les migrations Alembic pour chaque service
echo "Exécution des migrations pour le service d'authentification..."
docker exec $AUTH_CONTAINER bash -c "cd /app && alembic upgrade head"

echo "Exécution des migrations pour le service de billetterie..."
docker exec $TICKETS_CONTAINER bash -c "cd /app && alembic upgrade head"

# Exécuter les migrations pour les autres services s'ils existent
if [ ! -z "$ADMIN_CONTAINER" ]; then
  echo "Exécution des migrations pour le service d'administration..."
  docker exec $ADMIN_CONTAINER bash -c "cd /app && alembic upgrade head"
fi

if [ ! -z "$VALIDATION_CONTAINER" ]; then
  echo "Exécution des migrations pour le service de validation..."
  docker exec $VALIDATION_CONTAINER bash -c "cd /app && alembic upgrade head"
fi

# Créer un utilisateur de test
echo "Création d'un utilisateur de test..."
docker exec $AUTH_CONTAINER python3 /app/create_test_user.py

echo "Migrations terminées avec succès."
