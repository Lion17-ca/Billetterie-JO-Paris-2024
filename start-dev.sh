#!/bin/bash

# Activer l'environnement virtuel
source venv/bin/activate

# Définir les variables d'environnement
export $(grep -v '^#' .env | xargs)

# Fonction pour démarrer un service
start_service() {
    local service_name=$1
    local port=$2
    echo "Starting $service_name service on port $port..."
    cd services/$service_name && uvicorn main:app --reload --host 0.0.0.0 --port $port &
    cd ../..
}

# Fonction pour démarrer l'API Gateway
start_api_gateway() {
    echo "Starting API Gateway on port 8080..."
    cd api-gateway && uvicorn main:app --reload --host 0.0.0.0 --port 8080 &
    cd ..
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "Starting frontend on port 3000..."
    cd frontend && npm start &
    cd ..
}

# Démarrer les services
start_service "auth" 8000
start_service "tickets" 8001
start_service "validation" 8002
start_service "admin" 8003
start_api_gateway
start_frontend

echo "All services started. Press Ctrl+C to stop all services."

# Attendre que l'utilisateur appuie sur Ctrl+C
trap "kill 0" EXIT
wait
