#!/bin/bash

# Script pour exécuter les tests d'intégration et end-to-end

echo "=== Vérification des services ==="

# Vérifier que les services sont en cours d'exécution
echo "Vérification du service d'authentification..."
curl -s http://localhost:8000/health > /dev/null
if [ $? -ne 0 ]; then
    echo "Le service d'authentification n'est pas en cours d'exécution. Démarrage des services..."
    ./start-dev.sh
    sleep 10  # Attendre que les services démarrent
else
    echo "Le service d'authentification est en cours d'exécution."
fi

echo "Vérification du service de billetterie..."
curl -s http://localhost:8001/health > /dev/null
if [ $? -ne 0 ]; then
    echo "Le service de billetterie n'est pas en cours d'exécution."
    exit 1
else
    echo "Le service de billetterie est en cours d'exécution."
fi

echo "Vérification du service d'administration..."
curl -s http://localhost:8003/health > /dev/null
if [ $? -ne 0 ]; then
    echo "Le service d'administration n'est pas en cours d'exécution."
    exit 1
else
    echo "Le service d'administration est en cours d'exécution."
fi

echo "Vérification du service de validation..."
curl -s http://localhost:8002/health > /dev/null
if [ $? -ne 0 ]; then
    echo "Le service de validation n'est pas en cours d'exécution."
    exit 1
else
    echo "Le service de validation est en cours d'exécution."
fi

echo "Vérification de l'API Gateway..."
curl -s http://localhost:8080/health > /dev/null
if [ $? -ne 0 ]; then
    echo "L'API Gateway n'est pas en cours d'exécution."
    exit 1
else
    echo "L'API Gateway est en cours d'exécution."
fi

echo "Tous les services sont en cours d'exécution."

# Activer l'environnement virtuel
echo "=== Activation de l'environnement virtuel ==="
source venv/bin/activate

# Exécuter les tests d'intégration
echo "=== Exécution des tests d'intégration ==="
python -m pytest integration_tests/test_e2e_ticket_purchase_flow.py -v

# Exécuter les tests avec couverture de code
echo "=== Exécution des tests avec couverture de code ==="
python -m pytest integration_tests/test_e2e_ticket_purchase_flow.py --cov=services

# Générer un rapport de couverture HTML
echo "=== Génération du rapport de couverture HTML ==="
python -m pytest integration_tests/test_e2e_ticket_purchase_flow.py --cov=services --cov-report=html

echo "=== Tests terminés ==="
echo "Le rapport de couverture HTML est disponible dans le répertoire htmlcov/"
