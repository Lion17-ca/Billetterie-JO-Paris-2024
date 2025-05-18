from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Configuration de la base de données
# Priorité aux variables d'environnement pour plus de flexibilité lors du déploiement

# Récupération des variables d'environnement pour la base de données
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "postgres")
db_name = os.getenv("DB_NAME", "billetterie")
db_host = os.getenv("DB_HOST", "postgres")
db_port = os.getenv("DB_PORT", "5432")

# Construction de l'URL de connexion à partir des variables ou utilisation directe de DATABASE_URL si fournie
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")
elif os.getenv("DOCKER_ENV") == "true" or os.path.exists('/.dockerenv'):
    # Format standard pour PostgreSQL
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
else:
    # Fallback sur SQLite pour le développement local
    DATABASE_URL = "sqlite:///./tickets.db"

# Affichage de l'URL de connexion (sans le mot de passe) pour le débogage
print(f"Connecting to database: {DATABASE_URL.replace(db_password, '********') if db_password in DATABASE_URL else DATABASE_URL}")

# Création du moteur SQLAlchemy avec les paramètres appropriés selon le type de base de données
connect_args = {}
if DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}

# Création du moteur SQLAlchemy
try:
    engine = create_engine(
        DATABASE_URL, connect_args=connect_args
    )
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    # Fallback sur SQLite en cas d'erreur
    print("Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./tickets.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
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
