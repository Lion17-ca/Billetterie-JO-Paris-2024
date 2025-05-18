# Guide de déploiement - Billetterie JO Paris 2024

Ce document explique comment déployer l'application Billetterie JO Paris 2024 sur différentes plateformes.

## Prérequis

- Un compte sur l'une des plateformes de déploiement (Railway, Render, DigitalOcean, etc.)
- Git installé sur votre machine
- Docker et Docker Compose installés sur votre machine (pour les tests locaux)

## Variables d'environnement

L'application utilise plusieurs variables d'environnement pour sa configuration. Consultez le fichier `.env.example` à la racine du projet pour voir toutes les variables disponibles.

Les variables essentielles sont :

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=billetterie
DB_HOST=postgres
DB_PORT=5432
JWT_SECRET=votre_clé_secrète
```

## Options de déploiement

### 1. Railway.app (Recommandé)

Railway est une plateforme qui supporte nativement Docker Compose, ce qui le rend idéal pour notre architecture microservices.

1. Créez un compte sur [Railway.app](https://railway.app/)
2. Connectez votre compte GitHub
3. Créez un nouveau projet et sélectionnez "Deploy from GitHub repo"
4. Sélectionnez le dépôt "Billetterie-JO-Paris-2024"
5. Railway détectera automatiquement le fichier `docker-compose.prod.yml`
6. Configurez les variables d'environnement dans l'interface Railway
7. Déployez l'application

### 2. Render.com

Render est une autre plateforme qui peut déployer des applications Docker.

1. Créez un compte sur [Render.com](https://render.com/)
2. Connectez votre compte GitHub
3. Créez un nouveau "Blueprint" et sélectionnez le dépôt "Billetterie-JO-Paris-2024"
4. Render utilisera le fichier `render.yaml` pour configurer les services
5. Configurez les variables d'environnement dans l'interface Render
6. Déployez l'application

### 3. DigitalOcean

DigitalOcean offre plusieurs options pour déployer l'application :

#### Option A : Droplet (VM)

1. Créez un compte sur [DigitalOcean](https://www.digitalocean.com/)
2. Créez un Droplet (Ubuntu)
3. Connectez-vous au Droplet via SSH
4. Installez Docker et Docker Compose
5. Clonez le dépôt GitHub
6. Créez un fichier `.env` avec les variables d'environnement nécessaires
7. Exécutez `docker-compose -f docker-compose.prod.yml up -d`

#### Option B : App Platform

1. Créez un compte sur [DigitalOcean](https://www.digitalocean.com/)
2. Allez dans App Platform
3. Créez une nouvelle application et sélectionnez le dépôt GitHub
4. Configurez les services selon les besoins
5. Configurez les variables d'environnement
6. Déployez l'application

## Comptes pré-configurés

L'application est configurée pour créer automatiquement des comptes administrateur et employé lors du premier démarrage :

- **Admin** : admin@example.com / Admin123!
- **Employé** : employee@example.com / Employee123!

Pour plus d'informations sur ces comptes, consultez le document `docs/COMPTES_PRECONFIGURES.md`.

## Dépannage

### Problèmes de connexion à la base de données

Si vous rencontrez des problèmes de connexion à la base de données, vérifiez que :

1. Les variables d'environnement `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST` et `DB_PORT` sont correctement configurées
2. La base de données est accessible depuis les services
3. Les logs des services pour plus d'informations sur les erreurs

### Problèmes avec l'API Gateway

Si l'API Gateway ne fonctionne pas correctement :

1. Vérifiez que tous les services backend sont en cours d'exécution
2. Vérifiez la configuration de l'API Gateway dans `api-gateway/nginx.conf`
3. Assurez-vous que les noms des services correspondent aux noms des conteneurs Docker

## Support

Pour toute question ou problème, veuillez consulter la documentation ou contacter l'équipe de développement.
