# Déploiement sur Railway

Ce document explique comment déployer l'application Billetterie JO Paris 2024 sur la plateforme Railway.

> **Note importante** : Railway n'autorise pas l'utilisation de l'instruction `VOLUME` dans les Dockerfiles ni les volumes définis dans docker-compose. Les fichiers de configuration ont été adaptés en conséquence.

## Prérequis

- Un compte [Railway](https://railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli) installé (optionnel)
- Git installé sur votre machine

## Configuration

Le projet est déjà configuré pour un déploiement sur Railway avec les fichiers suivants :

- `railway.json` : Configuration Railway avec plugins PostgreSQL et Redis
- `docker-compose.prod.yml` : Configuration Docker pour la production (sans volumes)
- `.env.production` : Variables d'environnement pour la production
- `api-gateway/Dockerfile` : Configuration Nginx avec fichiers inclus dans l'image

## Étapes de déploiement

### 1. Connexion à Railway

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter à Railway
railway login
```

### 2. Initialiser le projet

```bash
# Dans le répertoire du projet
cd /Users/aeao/aeao-proiets/bloc3
railway init
```

### 3. Ajouter les services PostgreSQL et Redis

```bash
# Ajouter PostgreSQL
railway add

# Sélectionner PostgreSQL dans l'interface
```

### 4. Configurer les variables d'environnement

```bash
# Configurer les variables d'environnement
railway vars set DATABASE_URL=$RAILWAY_DATABASE_URL
railway vars set REDIS_URL=$RAILWAY_REDIS_URL
railway vars set JWT_SECRET=votre_secret_jwt_securise
railway vars set DOCKER_ENV=true
railway vars set RAILWAY_ENVIRONMENT=true
```

### 5. Déployer l'application

```bash
# Déployer l'application
railway up
```

### 6. Configurer le domaine

```bash
# Configurer un domaine personnalisé
railway domain
```

## Vérification du déploiement

Une fois le déploiement terminé, vous pouvez vérifier que tout fonctionne correctement en accédant aux endpoints suivants :

- Frontend : `https://votre-domaine.railway.app`
- Service d'authentification : `https://votre-domaine.railway.app/auth/health`
- Service de billetterie : `https://votre-domaine.railway.app/tickets/health`

## Dépannage

Si vous rencontrez des problèmes lors du déploiement, consultez les logs :

```bash
railway logs
```

## Mise à jour de l'application

Pour mettre à jour l'application après des modifications :

```bash
# Committer les changements
git add .
git commit -m "Description des modifications"
git push origin main

# Redéployer l'application
railway up
```

## Ressources

- [Documentation Railway](https://docs.railway.app/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
