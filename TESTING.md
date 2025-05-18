# Guide des Tests - Billetterie JO

Ce document explique comment exécuter les différents types de tests pour le système de billetterie électronique des Jeux Olympiques.

## Prérequis

- Python 3.13+
- Environnement virtuel activé
- Tous les services en cours d'exécution (pour les tests d'intégration et end-to-end)

## Types de Tests

Le projet comprend trois niveaux de tests :

1. **Tests Unitaires** : Testent les fonctionnalités individuelles de chaque service
2. **Tests d'Intégration** : Testent les interactions entre les différents services
3. **Tests End-to-End** : Testent les scénarios utilisateur complets

## Exécution des Tests

### Tests Unitaires et API

#### Pour tous les services

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Exécuter tous les tests unitaires avec couverture
python -m pytest services/*/tests/test_*_unit.py --cov=services

# Exécuter tous les tests API avec couverture
python -m pytest services/*/tests/test_*_api*.py --cov=services
```

#### Pour un service spécifique

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Service d'authentification
cd services/auth
# Tests unitaires
python -m pytest tests/test_auth_unit.py -v
# Tests API
python -m pytest tests/test_auth_api.py -v

# Service de billetterie
cd services/tickets
# Tests unitaires
python -m pytest tests/test_tickets_unit.py -v
# Tests API
python -m pytest tests/test_tickets_api_routes.py -v

# Service d'administration
cd services/admin
# Tests unitaires
python -m pytest tests/test_admin_unit.py -v
# Tests API
python -m pytest tests/test_admin_api_routes.py -v

# Service de validation
cd services/validation
# Tests unitaires
python -m pytest tests/test_validation_unit.py -v
# Tests API
python -m pytest tests/test_validation_api_routes.py -v
```

## Exécution des Tests d'Intégration et End-to-End

Les tests d'intégration et end-to-end nécessitent que tous les services soient en cours d'exécution. Utilisez le script `run_integration_tests.sh` pour exécuter ces tests :

```bash
# Rendre le script exécutable (si ce n'est pas déjà fait)
chmod +x run_integration_tests.sh

# Exécuter les tests d'intégration et end-to-end
./run_integration_tests.sh
```

Ce script :
1. Vérifie que tous les services sont en cours d'exécution
2. Exécute les tests d'intégration et end-to-end
3. Génère un rapport de couverture de code

## Scénarios de Test End-to-End

Les tests end-to-end couvrent les scénarios utilisateur suivants :

1. **Flux complet d'achat de billet** :
   - Consultation des offres disponibles
   - Achat d'un billet
   - Visualisation du billet avec QR code
   - Validation du billet par un employé
   - Visualisation des statistiques de vente par un administrateur

2. **Flux d'inscription et de connexion** :
   - Inscription d'un nouvel utilisateur
   - Connexion avec les identifiants
   - Accès à un endpoint protégé

3. **Gestion des offres** :
   - Création d'une offre
   - Récupération d'une offre
   - Mise à jour d'une offre
   - Suppression d'une offre

4. **Validation des billets** :
   - Achat d'un billet
   - Validation réussie du billet
   - Tentative de réutilisation du billet (doit échouer)
   - Vérification de l'historique des validations

## Rapports de Couverture

Pour générer un rapport de couverture HTML détaillé :

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Exécuter les tests avec génération de rapport HTML
python -m pytest services/*/tests/test_*_unit.py integration_tests/test_e2e_ticket_purchase_flow.py --cov=services --cov-report=html
```

Le rapport de couverture sera disponible dans le répertoire `htmlcov/`. Ouvrez le fichier `index.html` dans un navigateur pour visualiser le rapport.

## Résolution des Problèmes

Si vous rencontrez des problèmes lors de l'exécution des tests :

1. **Services non disponibles** : Assurez-vous que tous les services sont en cours d'exécution avec `./start-dev.sh`
2. **Erreurs de base de données** : Vérifiez que les migrations ont été appliquées avec `./run_migrations.sh`
3. **Erreurs d'authentification** : Vérifiez que les comptes utilisateur, administrateur et employé existent dans la base de données

## Objectifs de Couverture

- **Tests Unitaires** : Objectif de 80% minimum de couverture de code
- **Tests d'Intégration** : Couvrir toutes les interactions entre services
- **Tests End-to-End** : Couvrir tous les scénarios utilisateur critiques
- **Tests de Charge** : Vérifier la capacité à gérer des millions d'utilisateurs simultanés

## Tests de Charge

Les tests de charge permettent de vérifier la capacité du système à gérer un grand nombre d'utilisateurs simultanés, ce qui est crucial pour un système de billetterie des Jeux Olympiques.

### Prérequis

- Python 3.13+
- Locust installé : `pip install locust`
- Tous les services en cours d'exécution

### Exécution des Tests de Charge

```bash
# Rendre le script exécutable (si ce n'est pas déjà fait)
chmod +x load_tests/run_load_tests.sh

# Exécuter les tests de charge avec les paramètres par défaut
cd load_tests
./run_load_tests.sh

# Ou spécifier des paramètres personnalisés
# ./run_load_tests.sh [HOST] [USERS] [SPAWN_RATE] [RUNTIME]
# Exemple : ./run_load_tests.sh http://localhost:8000 1000 50 300
```

### Interface Web Locust

Pour exécuter les tests avec l'interface web de Locust :

```bash
cd load_tests
locust -f locustfile.py
```

Puis accédez à `http://localhost:8089` dans votre navigateur.

### Scénarios de Test de Charge

Les tests de charge simulent les comportements utilisateur suivants :

1. **Utilisateurs standard** :
   - Inscription et connexion
   - Navigation dans les offres disponibles
   - Achat de billets
   - Consultation des billets achetés

2. **Employés de validation** :
   - Validation des billets sur site

3. **Administrateurs** :
   - Consultation des statistiques de vente

### Analyse des Résultats

Après l'exécution des tests, Locust génère des fichiers CSV contenant les résultats :
- `results_stats.csv` : Statistiques globales
- `results_stats_history.csv` : Évolution des statistiques dans le temps
- `results_failures.csv` : Détails des échecs

Métriques clés à surveiller :
- **Temps de réponse moyen** : Idéalement < 1 seconde
- **Percentile 95** : Temps de réponse pour 95% des requêtes
- **Taux d'erreur** : Idéalement < 1%
- **Requêtes par seconde** : Capacité maximale du système
