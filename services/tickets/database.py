from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Configuration de la base de données
# Pour le développement, nous utilisons SQLite
# En production, nous utilisons PostgreSQL

# Force l'utilisation de PostgreSQL pour Docker
if os.getenv("DOCKER_ENV") == "true" or os.path.exists('/.dockerenv'):
    DATABASE_URL = "postgresql://postgres:postgres@postgres-db:5432/tickets_db"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tickets.db")

# Création du moteur SQLAlchemy avec les paramètres appropriés selon le type de base de données
connect_args = {}
if DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}

# Création du moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)

# Création d'une session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Création d'une classe de base pour les modèles
Base = declarative_base()

# Fonction pour obtenir une instance de la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
