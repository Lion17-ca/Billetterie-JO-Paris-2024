
import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ajouter le chemin du service au sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Importer les modules du service
try:
    from database import Base, get_db
except ImportError:
    print("Impossible d'importer les modules de base de données")

# Créer une base de données en mémoire pour les tests
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture pour initialiser la base de données de test
@pytest.fixture(scope="function")
def test_db():
    # Créer les tables
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Erreur lors de la création des tables: {e}")
    
    # Fournir une session de base de données
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Nettoyer après les tests
    try:
        Base.metadata.drop_all(bind=engine)
    except Exception as e:
        print(f"Erreur lors du nettoyage des tables: {e}")

# Surcharger la dépendance get_db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
