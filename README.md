# Système de Billetterie Électronique pour les Jeux Olympiques

Ce projet vise à remplacer le système de billetterie physique des Jeux Olympiques par une solution de e-tickets sécurisée. Cette initiative est motivée par la nécessité de prévenir la fraude et de moderniser le processus de vente et de validation des billets.

## Architecture

Le projet est structuré en microservices :

- **Service d'Authentification** : Gestion des utilisateurs, authentification MFA, génération de la première clé de sécurité
- **Service de Billetterie** : Gestion des tickets, génération des QR codes et de la deuxième clé de sécurité
- **Service d'Administration** : Gestion des offres, visualisation des ventes
- **Service de Validation** : Validation des tickets sur site
- **API Gateway** : Point d'entrée centralisé pour tous les services
- **Frontend** : Interface utilisateur React

## Fonctionnalités

### Pour les Visiteurs (Front-Office)
- Navigation et consultation des offres de tickets
- Création de compte et authentification sécurisée avec MFA obligatoire
- Achat de tickets avec génération de QR codes sécurisés
- Réception et gestion des e-tickets

### Pour l'Organisation (Back-Office)
- Gestion des utilisateurs
- Stockage sécurisé des clés de sécurité
- Validation des e-tickets sur site
- Authentification des employés

### Pour l'Administration
- Gestion des offres de tickets
- Visualisation des ventes et statistiques

## Sécurité

Le système implémente plusieurs couches de sécurité :
- Authentification Multi-Facteurs (MFA) obligatoire
- Politique de mots de passe robustes
- Système à deux clés pour la génération des e-tickets
  - Première clé générée lors de la création du compte (invisible pour l'utilisateur)
  - Deuxième clé générée lors de l'achat du billet
- Communication cryptée (HTTPS/TLS)
- Protection contre les attaques automatisées

## Technologies Utilisées

- **Backend** : FastAPI 0.110.0+, SQLAlchemy 2.0+, Pydantic v2
- **Base de données** : SQLite (développement), PostgreSQL (production)
- **Cache** : Redis
- **Sécurité** : Passlib, PyJWT, PyOTP (MFA)
- **QR Codes** : qrcode, Pillow
- **Frontend** : React, Bootstrap, React Router
- **Conteneurisation** : Docker, Docker Compose
- **Tests** : pytest, pytest-cov

## Prérequis

- Python 3.13+
- Node.js 16+
- Docker et Docker Compose (pour le déploiement)
- SQLite (pour le développement local)
- PostgreSQL (pour la production)

## Installation

### Méthode 1 : Installation locale pour le développement

1. Cloner le dépôt :
   ```bash
   git clone <url-du-depot>
   cd bloc3
   ```

2. Créer un environnement virtuel et l'activer :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```

3. Installer les dépendances principales :
   ```bash
   pip install -r requirements.txt
   ```

4. Configurer les variables d'environnement :
   ```bash
   # Copier le fichier .env.example en .env et modifier les valeurs selon votre environnement
   cp .env.example .env
   ```

5. Installer les dépendances du frontend :
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Méthode 2 : Installation avec Docker

1. Cloner le dépôt :
   ```bash
   git clone <url-du-depot>
   cd bloc3
   ```

2. Configurer les variables d'environnement :
   ```bash
   # Copier le fichier .env.example en .env et modifier les valeurs selon votre environnement
   cp .env.example .env
   ```

3. Construire et démarrer les conteneurs :
   ```bash
   docker-compose up -d
   ```

## Démarrage

### Méthode 1 : Démarrage local pour le développement

1. Démarrer tous les services en mode développement :
   ```bash
   ./start-dev.sh
   ```

2. Accéder aux différents services :
   - Frontend : http://localhost:3000
   - API Gateway : http://localhost:8080
   - Service d'authentification : http://localhost:8000/docs
   - Service de billetterie : http://localhost:8001/docs
   - Service d'administration : http://localhost:8003/docs
   - Service de validation : http://localhost:8002/docs

### Méthode 2 : Démarrage avec Docker

1. Si les conteneurs ne sont pas déjà en cours d'exécution :
   ```bash
   docker-compose up -d
   ```

2. Accéder aux différents services :
   - Frontend : http://localhost:3000
   - API Gateway : http://localhost:8080
   - Service d'authentification : http://localhost:8000/docs
   - Service de billetterie : http://localhost:8001/docs
   - Service d'administration : http://localhost:8003/docs
   - Service de validation : http://localhost:8002/docs

## Tests

1. Exécuter les tests unitaires :
   ```bash
   # Activer l'environnement virtuel si ce n'est pas déjà fait
   source venv/bin/activate
   
   # Exécuter les tests avec couverture
   pytest --cov=services
   ```

2. Générer un rapport de couverture HTML :
   ```bash
   pytest --cov=services --cov-report=html
   ```

## Déploiement en production

1. Configurer les variables d'environnement pour la production dans le fichier `.env`

2. Construire et déployer avec Docker Compose :
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Structure du projet

```
├── api-gateway/            # API Gateway pour centraliser les requêtes
├── frontend/               # Application frontend React
├── services/               # Services backend
│   ├── auth/               # Service d'authentification
│   ├── tickets/            # Service de billetterie
│   ├── admin/              # Service d'administration
│   └── validation/         # Service de validation
├── docker-compose.yml      # Configuration Docker Compose
├── .env                    # Variables d'environnement
├── init-db.sh              # Script d'initialisation de la base de données
├── start-dev.sh            # Script de démarrage en mode développement
└── README.md               # Documentation du projet
```

## Contribution

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committer vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence [MIT](LICENSE).

## Contact

Pour toute question ou suggestion, veuillez contacter l'équipe de développement.
