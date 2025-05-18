#!/bin/bash

# Script pour exécuter tous les tests et générer des rapports de couverture
# Pour le système de billetterie électronique des Jeux Olympiques

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Système de Tests pour la Billetterie JO ===${NC}\n"

# Créer le répertoire pour les rapports de test
mkdir -p test_reports

# 1. Tests unitaires backend
echo -e "${YELLOW}Exécution des tests unitaires backend...${NC}"
cd services/auth && python -m pytest tests/test_auth_unit.py -v --cov=. --cov-report=html:../../test_reports/auth_coverage || echo -e "${RED}Erreur dans les tests unitaires backend${NC}"
cd ../..

# 2. Tests d'intégration
echo -e "\n${YELLOW}Exécution des tests d'intégration...${NC}"
python -m pytest integration_tests/test_ticket_purchase_flow.py -v --cov=. --cov-report=html:test_reports/integration_coverage || echo -e "${RED}Erreur dans les tests d'intégration${NC}"

# 3. Tests unitaires frontend
echo -e "\n${YELLOW}Exécution des tests unitaires frontend...${NC}"
cd frontend && npm run test:coverage || echo -e "${RED}Erreur dans les tests unitaires frontend${NC}"
cd ..

# 4. Tests end-to-end
echo -e "\n${YELLOW}Exécution des tests end-to-end...${NC}"
cd frontend && npm run cypress:run || echo -e "${RED}Erreur dans les tests end-to-end${NC}"
cd ..

# 5. Générer un rapport combiné
echo -e "\n${YELLOW}Génération du rapport de couverture combiné...${NC}"
echo -e "Rapport de couverture des tests - $(date)" > test_reports/test_summary.md
echo -e "======================================\n" >> test_reports/test_summary.md

# Ajouter les résultats des tests backend
echo -e "## Tests Backend\n" >> test_reports/test_summary.md
echo -e "### Service d'authentification\n" >> test_reports/test_summary.md
echo -e "- Couverture de code: $(grep -o 'Total.*%' test_reports/auth_coverage/index.html | head -1 | cut -d'>' -f2 | cut -d'<' -f1)" >> test_reports/test_summary.md
echo -e "- Voir le rapport détaillé: [Auth Coverage](./auth_coverage/index.html)\n" >> test_reports/test_summary.md

# Ajouter les résultats des tests d'intégration
echo -e "### Tests d'intégration\n" >> test_reports/test_summary.md
echo -e "- Couverture de code: $(grep -o 'Total.*%' test_reports/integration_coverage/index.html | head -1 | cut -d'>' -f2 | cut -d'<' -f1)" >> test_reports/test_summary.md
echo -e "- Voir le rapport détaillé: [Integration Coverage](./integration_coverage/index.html)\n" >> test_reports/test_summary.md

# Ajouter les résultats des tests frontend
echo -e "## Tests Frontend\n" >> test_reports/test_summary.md
echo -e "### Tests unitaires React\n" >> test_reports/test_summary.md
echo -e "- Couverture de code: $(grep -o 'All files.*%' frontend/coverage/lcov-report/index.html | head -1 | sed 's/<[^>]*>//g' | tr -s ' ' | sed 's/^[ \t]*//;s/[ \t]*$//')" >> test_reports/test_summary.md
echo -e "- Voir le rapport détaillé: [Frontend Coverage](../frontend/coverage/lcov-report/index.html)\n" >> test_reports/test_summary.md

# Ajouter les résultats des tests end-to-end
echo -e "### Tests End-to-End\n" >> test_reports/test_summary.md
echo -e "- Nombre de tests: $(find frontend/cypress/e2e -name "*.cy.js" | xargs grep -l "it(" | wc -l)" >> test_reports/test_summary.md
echo -e "- Voir les vidéos: [E2E Videos](../frontend/cypress/videos)\n" >> test_reports/test_summary.md

# Afficher un résumé
echo -e "\n${GREEN}=== Résumé des Tests ===${NC}"
echo -e "Les rapports de test ont été générés dans le répertoire ${BLUE}test_reports${NC}"
echo -e "Ouvrez ${BLUE}test_reports/test_summary.md${NC} pour voir un résumé des résultats"
echo -e "\n${GREEN}Tests terminés !${NC}"

# Rendre le script exécutable
chmod +x run_tests.sh
