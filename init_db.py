import sys
import os

# Ajouter le répertoire du service d'authentification au chemin de recherche
sys.path.append(os.path.join(os.path.dirname(__file__), 'services/auth'))

from database import Base, engine
import models  # Importe le modèle User pour créer la table

def init_db():
    print("Initialisation de la base de données...")
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès !")

if __name__ == "__main__":
    init_db()
