Tests
=====

Cette section décrit les différents types de tests implémentés dans le système de billetterie électronique et comment les exécuter.

Types de tests
------------

Le projet utilise plusieurs types de tests pour assurer la qualité et la fiabilité du code :

* **Tests unitaires** : Tests des fonctions et méthodes individuelles
* **Tests d'intégration** : Tests des interactions entre les différents composants
* **Tests de l'API** : Tests des endpoints de l'API
* **Tests de charge** : Tests de performance sous charge

Exécution des tests
-----------------

Tests unitaires et d'intégration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Les tests unitaires et d'intégration sont implémentés avec pytest. Pour les exécuter :

.. code-block:: bash

   # Activer l'environnement virtuel
   source venv/bin/activate
   
   # Exécuter tous les tests
   pytest
   
   # Exécuter les tests d'un service spécifique
   pytest services/auth/tests/
   pytest services/tickets/tests/
   pytest services/validation/tests/
   pytest services/admin/tests/
   
   # Exécuter un test spécifique
   pytest services/auth/tests/test_user.py::test_create_user

Tests de l'API
^^^^^^^^^^^^

Les tests de l'API vérifient que les endpoints fonctionnent correctement. Pour les exécuter :

.. code-block:: bash

   # Exécuter les tests de l'API
   pytest tests/api/

Tests de charge
^^^^^^^^^^^^^

Les tests de charge sont implémentés avec Locust. Pour les exécuter :

.. code-block:: bash

   # Exécuter les tests de charge en mode headless
   cd load_tests
   ./run_load_tests.sh -u 100 -r 10 -t 60s
   
   # Exécuter les tests de charge avec l'interface web
   cd load_tests
   ./run_load_tests.sh --web

Paramètres des tests de charge :

* ``-u, --users`` : Nombre d'utilisateurs simultanés (par défaut : 100)
* ``-r, --spawn-rate`` : Taux de création d'utilisateurs par seconde (par défaut : 10)
* ``-t, --run-time`` : Durée du test (par défaut : 60s)
* ``--web`` : Démarrer l'interface web de Locust sur http://localhost:8089

Tests dans le pipeline CI/CD
--------------------------

Les tests sont automatiquement exécutés dans le pipeline CI/CD à chaque push ou pull request. Le workflow est défini dans le fichier ``.github/workflows/ci-cd.yml``.

Le pipeline exécute les étapes suivantes :

1. Vérification du code (linting)
2. Exécution des tests unitaires et d'intégration
3. Exécution des tests de l'API
4. Construction des images Docker
5. Exécution des tests de charge
6. Déploiement (uniquement pour la branche main)

Couverture de code
----------------

La couverture de code est mesurée avec pytest-cov. Pour générer un rapport de couverture :

.. code-block:: bash

   # Générer un rapport de couverture
   pytest --cov=services --cov-report=html
   
   # Ouvrir le rapport dans le navigateur
   open htmlcov/index.html

Bonnes pratiques de test
----------------------

* Écrire des tests pour chaque nouvelle fonctionnalité
* Maintenir une couverture de code élevée (idéalement > 80%)
* Utiliser des fixtures pour réutiliser le code de test
* Utiliser des mocks pour isoler les composants
* Exécuter les tests avant chaque commit

Pour plus d'informations sur les tests, consultez le fichier ``TESTING.md`` à la racine du projet.
