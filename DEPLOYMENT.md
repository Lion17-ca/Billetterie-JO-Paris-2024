# Guide de Déploiement - Billetterie JO Paris 2024

Ce document explique comment déployer le système de billetterie électronique des Jeux Olympiques en environnement de production.

## Prérequis

- Serveur Linux avec au moins 4 Go de RAM et 2 CPUs
- Docker et Docker Compose installés
- Accès à Internet pour télécharger les images Docker
- Nom de domaine configuré (pour la production réelle)
- Certificats SSL valides (pour la production réelle)

## Étapes de déploiement

### 1. Préparation de l'environnement

1. Cloner le dépôt sur le serveur de production :
   ```bash
   git clone https://github.com/Lion17-ca/Billetterie-JO-Paris-2024.git
   cd Billetterie-JO-Paris-2024
   ```

2. S'assurer d'être sur la branche main :
   ```bash
   git checkout main
   ```

3. Configurer les variables d'environnement :
   ```bash
   # Copier le fichier d'exemple
   cp .env.production .env
   
   # Éditer le fichier avec des valeurs sécurisées
   nano .env
   ```

   Assurez-vous de modifier les valeurs suivantes :
   - `JWT_SECRET` : Générer une clé forte avec `openssl rand -hex 32`
   - `MFA_SECRET` : Générer une clé forte avec `openssl rand -hex 32`
   - `DB_PASSWORD` : Utiliser un mot de passe fort
   - `DOMAIN_NAME` : Votre nom de domaine réel

### 2. Configuration SSL

Pour un déploiement en production réelle, vous devez obtenir des certificats SSL valides :

1. Obtenir des certificats SSL avec Let's Encrypt :
   ```bash
   # Installer Certbot
   apt-get update
   apt-get install certbot
   
   # Obtenir les certificats
   certbot certonly --standalone -d votre-domaine.com
   
   # Copier les certificats
   mkdir -p api-gateway/ssl
   cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem api-gateway/ssl/
   cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem api-gateway/ssl/
   ```

2. Ou utiliser des certificats auto-signés pour les tests (non recommandé pour la production) :
   ```bash
   mkdir -p api-gateway/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout api-gateway/ssl/privkey.pem \
     -out api-gateway/ssl/fullchain.pem \
     -subj "/C=FR/ST=Paris/L=Paris/O=JO Paris 2024/CN=votre-domaine.com"
   ```

### 3. Déploiement automatisé

Nous avons préparé un script de déploiement automatisé qui effectue toutes les étapes nécessaires :

```bash
# Rendre le script exécutable
chmod +x deploy-production.sh

# Exécuter le script de déploiement
./deploy-production.sh
```

Le script effectue les actions suivantes :
- Vérifie que vous êtes sur la branche main
- Configure l'environnement de production
- Génère des certificats SSL temporaires (si nécessaire)
- Construit et démarre les conteneurs Docker
- Exécute les migrations de base de données
- Vérifie que tous les services fonctionnent correctement

### 4. Déploiement manuel

Si vous préférez déployer manuellement, suivez ces étapes :

1. Construire les images Docker :
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Démarrer les services :
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Exécuter les migrations de base de données :
   ```bash
   docker-compose -f docker-compose.prod.yml exec auth alembic upgrade head
   docker-compose -f docker-compose.prod.yml exec tickets alembic upgrade head
   docker-compose -f docker-compose.prod.yml exec admin alembic upgrade head
   docker-compose -f docker-compose.prod.yml exec validation alembic upgrade head
   ```

### 5. Vérification du déploiement

Après le déploiement, vérifiez que tous les services fonctionnent correctement :

1. Vérifier l'état des conteneurs :
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Vérifier les logs :
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

3. Tester l'accès aux services :
   - Frontend : https://votre-domaine.com
   - API Gateway : https://votre-domaine.com/api
   - Documentation API Auth : https://votre-domaine.com/api/auth/docs
   - Documentation API Tickets : https://votre-domaine.com/api/tickets/docs
   - Documentation API Admin : https://votre-domaine.com/api/admin/docs
   - Documentation API Validation : https://votre-domaine.com/api/validation/docs

## Maintenance

### Mise à jour de l'application

Pour mettre à jour l'application avec les dernières modifications :

```bash
# Récupérer les dernières modifications
git pull

# Redéployer l'application
./deploy-production.sh
```

### Sauvegarde de la base de données

Pour sauvegarder la base de données :

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U ${DB_USER} ${DB_NAME} > backup_$(date +%Y%m%d).sql
```

### Restauration de la base de données

Pour restaurer une sauvegarde de la base de données :

```bash
cat backup_YYYYMMDD.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U ${DB_USER} ${DB_NAME}
```

### Surveillance et monitoring

Pour surveiller les performances de l'application, nous recommandons d'installer Prometheus et Grafana :

```bash
# Cloner le dépôt de monitoring
git clone https://github.com/vegasbrianc/prometheus.git
cd prometheus

# Démarrer les services de monitoring
docker-compose up -d
```

Accédez à Grafana à l'adresse http://votre-domaine.com:3000 (identifiants par défaut : admin/admin).

## Résolution des problèmes

### Les conteneurs ne démarrent pas

Vérifiez les logs pour identifier le problème :

```bash
docker-compose -f docker-compose.prod.yml logs
```

### Problèmes de base de données

Si vous rencontrez des problèmes avec la base de données :

```bash
# Vérifier l'état de la base de données
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U ${DB_USER}

# Réinitialiser la base de données (attention : cela supprime toutes les données)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Problèmes de certificats SSL

Si vous rencontrez des problèmes avec les certificats SSL :

```bash
# Vérifier les certificats
openssl x509 -in api-gateway/ssl/fullchain.pem -text -noout

# Régénérer les certificats
certbot renew
```

## Support

Pour toute question ou assistance supplémentaire, veuillez contacter l'équipe de développement.
