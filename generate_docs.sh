#!/bin/bash

# Script pour générer la documentation du projet

echo "Génération de la documentation Sphinx..."

# Activer l'environnement virtuel
source venv/bin/activate

# S'assurer que les dépendances sont installées
pip install sphinx sphinx-rtd-theme sphinx-autodoc-typehints myst-parser

# Générer la documentation
cd docs
make clean
make html

echo "Documentation générée avec succès dans docs/build/html/"
echo "Ouvrez docs/build/html/index.html dans votre navigateur pour la consulter."
