Documentation API
================

Cette section fournit une documentation détaillée des API du système de billetterie électronique.

Pour une documentation interactive des API, vous pouvez utiliser Swagger UI en accédant à ``/docs`` sur chaque service.

Service d'Authentification
-------------------------

Endpoints pour l'inscription, la connexion et la gestion des utilisateurs.

.. list-table::
   :header-rows: 1
   :widths: 20 20 60

   * - Endpoint
     - Méthode
     - Description
   * - ``/register``
     - POST
     - Inscription d'un nouvel utilisateur
   * - ``/login``
     - POST
     - Connexion d'un utilisateur
   * - ``/users/me``
     - GET
     - Récupération des informations de l'utilisateur connecté
   * - ``/mfa/setup``
     - POST
     - Configuration de l'authentification multi-facteurs
   * - ``/mfa/verify``
     - POST
     - Vérification d'un code MFA

Service de Billetterie
---------------------

Endpoints pour la gestion des offres et l'achat de billets.

.. list-table::
   :header-rows: 1
   :widths: 20 20 60

   * - Endpoint
     - Méthode
     - Description
   * - ``/offers``
     - GET
     - Liste des offres de billets disponibles
   * - ``/offers/{offer_id}``
     - GET
     - Détails d'une offre spécifique
   * - ``/tickets``
     - POST
     - Achat d'un billet
   * - ``/tickets``
     - GET
     - Liste des billets de l'utilisateur connecté
   * - ``/tickets/{ticket_id}``
     - GET
     - Détails d'un billet spécifique
   * - ``/tickets/{ticket_id}/qrcode``
     - GET
     - Génération du QR code pour un billet

Service de Validation
--------------------

Endpoints pour la validation des billets.

.. list-table::
   :header-rows: 1
   :widths: 20 20 60

   * - Endpoint
     - Méthode
     - Description
   * - ``/validate``
     - POST
     - Validation d'un billet via QR code
   * - ``/validation-history``
     - GET
     - Historique des validations

Service d'Administration
-----------------------

Endpoints pour la gestion des offres et l'accès aux statistiques.

.. list-table::
   :header-rows: 1
   :widths: 20 20 60

   * - Endpoint
     - Méthode
     - Description
   * - ``/admin/offers``
     - GET
     - Liste de toutes les offres
   * - ``/admin/offers``
     - POST
     - Création d'une nouvelle offre
   * - ``/admin/offers/{offer_id}``
     - PUT
     - Mise à jour d'une offre
   * - ``/admin/offers/{offer_id}``
     - DELETE
     - Suppression d'une offre
   * - ``/admin/stats``
     - GET
     - Statistiques de vente

Pour une documentation plus détaillée, incluant les formats de requête et de réponse, veuillez consulter le fichier ``API.md`` à la racine du projet.
