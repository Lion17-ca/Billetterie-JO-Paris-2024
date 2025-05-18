Déploiement
===========

Cette section décrit les étapes nécessaires pour déployer le système de billetterie électronique en environnement de production.

Prérequis
--------

* Docker et Docker Compose installés sur le serveur de production
* Accès SSH au serveur de production
* Certificats SSL/TLS pour le domaine
* Accès à un serveur de base de données PostgreSQL (ou utilisation de la base de données conteneurisée)

Configuration de l'environnement
------------------------------

1. Cloner le dépôt sur le serveur de production :

   .. code-block:: bash

      git clone https://github.com/Lion17-ca/Billetterie-JO-Paris-2024.git
      cd Billetterie-JO-Paris-2024

2. Configurer les variables d'environnement en modifiant le fichier `.env.production` :

   .. code-block:: bash

      # Configuration de la base de données
      POSTGRES_USER=postgres
      POSTGRES_PASSWORD=votre_mot_de_passe_securise
      POSTGRES_DB=billetterie
      
      # Configuration JWT
      JWT_SECRET=votre_secret_jwt_securise
      JWT_ALGORITHM=HS256
      ACCESS_TOKEN_EXPIRE_MINUTES=30
      
      # Configuration du serveur
      API_GATEWAY_PORT=443
      AUTH_SERVICE_PORT=8001
      TICKETS_SERVICE_PORT=8002
      VALIDATION_SERVICE_PORT=8003
      ADMIN_SERVICE_PORT=8004
      
      # Configuration des URLs
      AUTH_SERVICE_URL=http://auth-service:8001
      TICKETS_SERVICE_URL=http://tickets-service:8002
      VALIDATION_SERVICE_URL=http://validation-service:8003
      ADMIN_SERVICE_URL=http://admin-service:8004
      
      # Configuration SSL/TLS
      SSL_CERT_PATH=/etc/letsencrypt/live/votre-domaine.com/fullchain.pem
      SSL_KEY_PATH=/etc/letsencrypt/live/votre-domaine.com/privkey.pem

3. Placer les certificats SSL/TLS dans les emplacements spécifiés dans le fichier `.env.production`.

Déploiement avec le script automatisé
-----------------------------------

Le projet inclut un script de déploiement automatisé qui facilite le processus :

.. code-block:: bash

   ./deploy-production.sh

Ce script effectue les actions suivantes :

1. Arrête les conteneurs existants
2. Récupère les dernières modifications du dépôt
3. Construit les images Docker
4. Démarre les conteneurs avec Docker Compose
5. Exécute les migrations de base de données
6. Vérifie que tous les services sont opérationnels

Déploiement manuel
----------------

Si vous préférez déployer manuellement, suivez ces étapes :

1. Construire les images Docker :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml build

2. Démarrer les services :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml up -d

3. Exécuter les migrations de base de données :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml exec auth-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec tickets-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec validation-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec admin-service alembic upgrade head

Vérification du déploiement
-------------------------

Pour vérifier que le déploiement s'est bien déroulé :

1. Vérifier que tous les conteneurs sont en cours d'exécution :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml ps

2. Vérifier les logs des services :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml logs -f

3. Accéder à l'API Gateway via HTTPS :

   .. code-block:: bash

      curl -k https://votre-domaine.com/health

   La réponse devrait être `{"status": "ok"}`.

4. Accéder à la documentation Swagger UI :

   Ouvrez `https://votre-domaine.com/docs` dans votre navigateur.

Mise à jour du système
--------------------

Pour mettre à jour le système avec les dernières modifications :

1. Récupérer les dernières modifications du dépôt :

   .. code-block:: bash

      git pull

2. Reconstruire et redémarrer les services :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml down
      docker-compose -f docker-compose.prod.yml build
      docker-compose -f docker-compose.prod.yml up -d

3. Exécuter les migrations de base de données si nécessaire :

   .. code-block:: bash

      docker-compose -f docker-compose.prod.yml exec auth-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec tickets-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec validation-service alembic upgrade head
      docker-compose -f docker-compose.prod.yml exec admin-service alembic upgrade head
