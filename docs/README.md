# Documentation du Projet Billetterie JO Paris 2024

Ce répertoire contient la documentation du projet de billetterie électronique pour les Jeux Olympiques Paris 2024, générée avec Sphinx.

## Structure de la documentation

La documentation est organisée comme suit :

- `source/` : Contient les fichiers source de la documentation (fichiers .rst)
- `build/` : Contient la documentation générée
  - `build/html/` : Documentation au format HTML
- `Makefile` et `make.bat` : Scripts pour générer la documentation

## Sections principales

La documentation couvre les aspects suivants du projet :

1. **Introduction** : Présentation générale du projet et de ses objectifs
2. **Architecture** : Description de l'architecture microservices du système
3. **Services** : Documentation détaillée de chaque service (authentification, billetterie, validation, administration)
4. **API** : Documentation des endpoints API
5. **Déploiement** : Instructions pour déployer le système
6. **Tests** : Description des différents types de tests et comment les exécuter
7. **Sécurité** : Mesures de sécurité implémentées dans le système

## Génération de la documentation

Pour générer la documentation, utilisez le script `generate_docs.sh` à la racine du projet :

```bash
./generate_docs.sh
```

Ou manuellement :

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Générer la documentation HTML
cd docs
make clean
make html
```

## Consultation de la documentation

Après génération, la documentation HTML peut être consultée en ouvrant le fichier `docs/build/html/index.html` dans un navigateur web.

## Mise à jour de la documentation

Pour mettre à jour la documentation :

1. Modifiez les fichiers .rst dans le répertoire `docs/source/`
2. Régénérez la documentation avec le script `generate_docs.sh`

## Docstrings dans le code

La documentation est générée à partir des docstrings dans le code source. Assurez-vous que toutes les fonctions, classes et méthodes sont documentées avec des docstrings au format Google :

```python
def ma_fonction(param1, param2):
    """Description de la fonction.
    
    Args:
        param1 (type): Description du paramètre 1.
        param2 (type): Description du paramètre 2.
        
    Returns:
        type: Description de la valeur de retour.
        
    Raises:
        Exception: Description de l'exception.
    """
    # Code de la fonction
```
