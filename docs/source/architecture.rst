Architecture du Système
=====================

Architecture Microservices
-------------------------

Le système de billetterie électronique est conçu selon une architecture microservices, où chaque service est responsable d'une fonctionnalité spécifique et peut être développé, déployé et mis à l'échelle indépendamment.

.. code-block:: text

    +-------------------+      +-------------------+      +-------------------+
    |                   |      |                   |      |                   |
    |  API Gateway      |----->|  Service Auth     |----->|  Base de données  |
    |  (Nginx)          |      |  (FastAPI)        |      |  (PostgreSQL)     |
    |                   |      |                   |      |                   |
    +-------------------+      +-------------------+      +-------------------+
            |
            |
            v
    +-------------------+      +-------------------+
    |                   |      |                   |
    |  Service Tickets  |----->|  Base de données  |
    |  (FastAPI)        |      |  (PostgreSQL)     |
    |                   |      |                   |
    +-------------------+      +-------------------+
            |
            |
            v
    +-------------------+      +-------------------+
    |                   |      |                   |
    |  Service Valid.   |----->|  Base de données  |
    |  (FastAPI)        |      |  (PostgreSQL)     |
    |                   |      |                   |
    +-------------------+      +-------------------+
            |
            |
            v
    +-------------------+      +-------------------+
    |                   |      |                   |
    |  Service Admin    |----->|  Base de données  |
    |  (FastAPI)        |      |  (PostgreSQL)     |
    |                   |      |                   |
    +-------------------+      +-------------------+

Composants principaux
--------------------

API Gateway
^^^^^^^^^^

L'API Gateway (Nginx) sert de point d'entrée unique pour toutes les requêtes client. Il est responsable de :

* Routage des requêtes vers les services appropriés
* Gestion du HTTPS/TLS pour les communications sécurisées
* Load balancing
* Mise en cache des réponses pour améliorer les performances

Services
^^^^^^^^

Chaque service est développé avec FastAPI et est responsable d'une fonctionnalité spécifique :

* **Service d'Authentification** : Gestion des utilisateurs et authentification
* **Service de Billetterie** : Gestion des offres et achat de billets
* **Service de Validation** : Validation des billets lors des événements
* **Service d'Administration** : Gestion des offres et statistiques

Base de données
^^^^^^^^^^^^^^

Chaque service dispose de sa propre base de données PostgreSQL, ce qui permet une isolation des données et une meilleure scalabilité.

Conteneurisation
---------------

Le système utilise Docker et Docker Compose pour la conteneurisation, ce qui facilite le développement, le test et le déploiement.

Chaque service est encapsulé dans un conteneur Docker, avec ses propres dépendances et configuration. Docker Compose est utilisé pour orchestrer l'ensemble des services.

Sécurité
-------

Le système implémente plusieurs niveaux de sécurité :

* **HTTPS/TLS** pour les communications sécurisées
* **Authentification JWT** pour l'identification des utilisateurs
* **Authentification Multi-Facteurs (MFA)** pour une sécurité renforcée
* **Système à double clé de sécurité** pour la génération et la validation des billets
* **Hachage des mots de passe** pour le stockage sécurisé

Communication entre services
--------------------------

Les services communiquent entre eux via des API REST, en utilisant des requêtes HTTP sécurisées. Cette approche permet un couplage faible entre les services et facilite l'évolution indépendante de chaque service.
