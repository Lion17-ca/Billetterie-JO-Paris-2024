FROM node:16-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage en mode développement
CMD ["npm", "start"]
