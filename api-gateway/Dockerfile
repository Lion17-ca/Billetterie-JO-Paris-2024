FROM nginx:alpine

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Créer le répertoire SSL
RUN mkdir -p /etc/nginx/ssl

# Copier les certificats SSL (ou les générer si nécessaire)
COPY ssl/ /etc/nginx/ssl/

# Exposer les ports HTTP et HTTPS
EXPOSE 80 443

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
