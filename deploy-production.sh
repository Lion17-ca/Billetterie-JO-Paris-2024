#!/bin/bash

# Script de déploiement en production pour le système de billetterie électronique des JO
# Ce script configure et déploie l'application en environnement de production

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Démarrage du déploiement en production...${NC}"

# 1. Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}Erreur: Vous n'êtes pas sur la branche main. Veuillez basculer sur main avant le déploiement.${NC}"
  exit 1
fi

# 2. Vérifier que tous les changements sont commités
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Erreur: Vous avez des changements non commités. Veuillez commiter ou stasher vos changements.${NC}"
  exit 1
fi

# 3. Vérifier que le fichier .env.production existe
if [ ! -f ".env.production" ]; then
  echo -e "${RED}Erreur: Le fichier .env.production n'existe pas. Veuillez le créer avant de continuer.${NC}"
  exit 1
fi

# 4. Copier le fichier .env.production en .env
echo -e "${GREEN}Configuration de l'environnement de production...${NC}"
cp .env.production .env

# 5. Vérifier que Docker est installé et en cours d'exécution
if ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
  echo -e "${RED}Erreur: Docker n'est pas installé ou n'est pas en cours d'exécution.${NC}"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Erreur: Docker Compose n'est pas installé.${NC}"
  exit 1
fi

# 6. Générer des certificats SSL auto-signés pour le développement
# Note: En production réelle, utilisez Let's Encrypt ou un autre fournisseur de certificats
echo -e "${GREEN}Génération de certificats SSL temporaires...${NC}"
mkdir -p api-gateway/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout api-gateway/ssl/privkey.pem \
  -out api-gateway/ssl/fullchain.pem \
  -subj "/C=FR/ST=Paris/L=Paris/O=JO Paris 2024/CN=localhost" \
  -addext "subjectAltName = DNS:localhost,IP:127.0.0.1"

# 7. Construire les images Docker
echo -e "${GREEN}Construction des images Docker...${NC}"
# Build each service individually
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml build auth
docker-compose -f docker-compose.prod.yml build tickets
docker-compose -f docker-compose.prod.yml build admin
docker-compose -f docker-compose.prod.yml build validation

# 8. Arrêter les conteneurs existants
echo -e "${GREEN}Arrêt des conteneurs existants...${NC}"
docker-compose -f docker-compose.prod.yml down

# 9. Démarrer les services en mode production
echo -e "${GREEN}Démarrage des services en mode production...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# 10. Exécuter les migrations de base de données
echo -e "${GREEN}Exécution des migrations de base de données...${NC}"
docker-compose -f docker-compose.prod.yml exec auth alembic upgrade head
docker-compose -f docker-compose.prod.yml exec tickets alembic upgrade head
docker-compose -f docker-compose.prod.yml exec admin alembic upgrade head
docker-compose -f docker-compose.prod.yml exec validation alembic upgrade head

# 11. Vérifier que tous les services sont en cours d'exécution
echo -e "${GREEN}Vérification des services...${NC}"
if [ "$(docker-compose -f docker-compose.prod.yml ps -q | wc -l)" -lt 7 ]; then
  echo -e "${RED}Erreur: Certains services ne sont pas en cours d'exécution. Veuillez vérifier les logs.${NC}"
  docker-compose -f docker-compose.prod.yml logs
  exit 1
fi

# 12. Exécuter des tests de base pour vérifier que l'application fonctionne
echo -e "${GREEN}Exécution de tests de base...${NC}"
# Attendre que les services soient prêts
sleep 10

# Vérifier que l'API Gateway répond
if ! curl -k -s -o /dev/null -w "%{http_code}" https://localhost/api/auth/health | grep -q "200"; then
  echo -e "${RED}Erreur: L'API Gateway ne répond pas correctement. Veuillez vérifier les logs.${NC}"
  docker-compose -f docker-compose.prod.yml logs api-gateway
  exit 1
fi

# 13. Afficher les informations de déploiement
echo -e "${GREEN}Déploiement terminé avec succès!${NC}"
echo -e "${GREEN}L'application est accessible à l'adresse suivante:${NC}"
echo -e "${YELLOW}https://localhost${NC}"
echo -e "${GREEN}Interfaces d'administration:${NC}"
echo -e "${YELLOW}API Gateway: https://localhost/api${NC}"
echo -e "${YELLOW}Service d'authentification: https://localhost/api/auth/docs${NC}"
echo -e "${YELLOW}Service de billetterie: https://localhost/api/tickets/docs${NC}"
echo -e "${YELLOW}Service d'administration: https://localhost/api/admin/docs${NC}"
echo -e "${YELLOW}Service de validation: https://localhost/api/validation/docs${NC}"

# Afficher les informations sur les comptes pré-configurés
echo -e "${GREEN}Comptes pré-configurés disponibles:${NC}"
echo -e "${YELLOW}Compte administrateur:${NC}"
echo -e "  ${YELLOW}Email: admin@example.com${NC}"
echo -e "  ${YELLOW}Mot de passe: Admin123!${NC}"
echo -e "${YELLOW}Compte employé:${NC}"
echo -e "  ${YELLOW}Email: employee@example.com${NC}"
echo -e "  ${YELLOW}Mot de passe: Employee123!${NC}"
echo -e "${GREEN}Pour plus d'informations, consultez le fichier docs/COMPTES_PRECONFIGURES.md${NC}"

echo -e "${GREEN}Pour arrêter l'application:${NC}"
echo -e "${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"

echo -e "${GREEN}Pour voir les logs:${NC}"
echo -e "${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"

exit 0
