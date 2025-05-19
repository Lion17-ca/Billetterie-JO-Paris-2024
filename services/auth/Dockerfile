FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 8000

# Créer un script de démarrage
COPY start.sh /app/start.sh
RUN chmod 755 /app/start.sh

# Commande de démarrage
CMD ["/app/start.sh"]
