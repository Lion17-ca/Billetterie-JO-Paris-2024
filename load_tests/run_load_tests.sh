#!/bin/bash

# Activer l'environnement virtuel
source ../venv/bin/activate

# Définir les variables pour le test
HOST=${1:-"http://localhost:8000"}  # Hôte par défaut: http://localhost:8000
USERS=${2:-100}                     # Nombre d'utilisateurs par défaut: 100
SPAWN_RATE=${3:-10}                 # Taux de création d'utilisateurs par seconde: 10
RUNTIME=${4:-60}                    # Durée du test en secondes: 60

echo "Démarrage des tests de charge avec les paramètres suivants:"
echo "Hôte: $HOST"
echo "Nombre d'utilisateurs: $USERS"
echo "Taux de création d'utilisateurs: $SPAWN_RATE par seconde"
echo "Durée du test: $RUNTIME secondes"

# Exécuter Locust en mode headless (sans interface web)
locust -f locustfile.py --host=$HOST --users=$USERS --spawn-rate=$SPAWN_RATE --run-time=${RUNTIME}s --headless --csv=results

echo "Tests terminés. Les résultats sont disponibles dans le dossier 'results_*.csv'"
