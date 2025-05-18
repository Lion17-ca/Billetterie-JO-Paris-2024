Sécurité
========

Cette section décrit les mesures de sécurité implémentées dans le système de billetterie électronique.

Authentification et autorisation
------------------------------

Authentification des utilisateurs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Le système utilise plusieurs mécanismes pour sécuriser l'authentification des utilisateurs :

* **Hachage des mots de passe** : Les mots de passe sont hachés avec Bcrypt avant d'être stockés dans la base de données.
* **Authentification par JWT** : Les JSON Web Tokens (JWT) sont utilisés pour maintenir les sessions utilisateur.
* **Authentification Multi-Facteurs (MFA)** : Une authentification à deux facteurs est disponible via TOTP (Time-based One-Time Password).

Exemple de configuration MFA :

.. code-block:: python

   # Génération d'un secret MFA
   def generate_mfa_secret():
       return pyotp.random_base32()
   
   # Vérification d'un code MFA
   def verify_mfa_code(secret, code):
       totp = pyotp.TOTP(secret)
       return totp.verify(code)

Autorisation
^^^^^^^^^^^

L'autorisation est gérée par un système de rôles qui définit les actions qu'un utilisateur peut effectuer :

* **Visiteur** : Peut consulter les offres et acheter des billets
* **Employé** : Peut valider les billets
* **Administrateur** : Peut gérer les offres et accéder aux statistiques

Sécurité des billets
------------------

Système à double clé
^^^^^^^^^^^^^^^^^^

Le système utilise un mécanisme à double clé pour sécuriser les billets :

1. **Clé de sécurité 1** : Générée lors de la création du compte utilisateur et stockée dans la base de données utilisateur
2. **Clé de sécurité 2** : Générée lors de l'achat d'un billet et stockée dans la base de données des billets

Lors de la génération du QR code, les deux clés sont combinées avec l'identifiant du billet pour créer une signature unique. Lors de la validation, cette signature est recalculée et comparée à celle du QR code.

.. code-block:: python

   # Génération de la signature du billet
   def generate_ticket_signature(ticket_id, security_key_1, security_key_2):
       data = f"{ticket_id}:{security_key_1}:{security_key_2}"
       return hashlib.sha256(data.encode()).hexdigest()

Prévention de la réutilisation des billets
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Chaque billet ne peut être utilisé qu'une seule fois. Lors de la validation, le statut du billet est mis à jour dans la base de données pour indiquer qu'il a été utilisé.

Sécurité des communications
-------------------------

HTTPS/TLS
^^^^^^^^

Toutes les communications entre le client et le serveur sont sécurisées par HTTPS/TLS. Les certificats SSL/TLS sont configurés dans l'API Gateway (Nginx).

Configuration Nginx pour HTTPS :

.. code-block:: nginx

   server {
       listen 443 ssl;
       server_name example.com;
       
       ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
       
       # ...
   }

Sécurité des API
^^^^^^^^^^^^^^

Les API sont protégées par plusieurs mécanismes :

* **Rate limiting** : Limitation du nombre de requêtes par IP pour prévenir les attaques par force brute
* **Validation des entrées** : Validation stricte des données d'entrée pour prévenir les injections
* **CORS** : Configuration stricte des Cross-Origin Resource Sharing pour prévenir les attaques XSS

Sécurité des données
------------------

Protection des données sensibles
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Les données sensibles sont protégées par plusieurs mécanismes :

* **Chiffrement des données sensibles** : Les données sensibles sont chiffrées avant d'être stockées dans la base de données
* **Minimisation des données** : Seules les données nécessaires sont collectées et stockées
* **Suppression automatique** : Les données temporaires sont automatiquement supprimées après une période définie

Gestion des secrets
^^^^^^^^^^^^^^^^^

Les secrets (clés API, mots de passe de base de données, etc.) sont gérés via des variables d'environnement et ne sont jamais stockés dans le code source.

Audit et journalisation
---------------------

Journalisation
^^^^^^^^^^^^

Toutes les actions importantes sont journalisées pour permettre l'audit et la détection d'activités suspectes :

* Tentatives de connexion (réussies et échouées)
* Création et validation de billets
* Modifications des offres
* Accès aux données sensibles

Format des journaux :

.. code-block:: json

   {
     "timestamp": "2024-05-18T12:34:56Z",
     "level": "INFO",
     "user_id": "user123",
     "action": "LOGIN",
     "status": "SUCCESS",
     "ip_address": "192.168.1.1",
     "user_agent": "Mozilla/5.0 ..."
   }

Alertes de sécurité
^^^^^^^^^^^^^^^^^

Le système génère des alertes en cas d'activités suspectes :

* Tentatives de connexion multiples échouées
* Tentatives de validation de billets déjà utilisés
* Accès non autorisés aux API
* Modifications suspectes des offres

Bonnes pratiques de sécurité
--------------------------

* **Mises à jour régulières** : Les dépendances sont régulièrement mises à jour pour corriger les vulnérabilités connues
* **Tests de sécurité** : Des tests de sécurité sont effectués régulièrement pour identifier les vulnérabilités
* **Principe du moindre privilège** : Chaque composant n'a accès qu'aux ressources dont il a besoin
* **Défense en profondeur** : Plusieurs couches de sécurité sont mises en place pour protéger le système
