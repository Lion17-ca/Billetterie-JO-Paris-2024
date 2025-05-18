from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import requests
from typing import List, Annotated
import models
import schemas
from database import get_db, engine

# Initialisation de l'application
app = FastAPI(title="Service d'Administration - Jeux Olympiques")

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

# Configuration de la sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Routes
@app.get("/offers/", response_model=List[schemas.Offer])
async def get_offers(db: Annotated[Session, Depends(get_db)], skip: int = 0, limit: int = 100):
    """Récupère la liste des offres"""
    # Dans une implémentation réelle, nous ferions un appel au service de billetterie
    # Pour l'exemple, nous utilisons notre propre base de données
    offers = models.get_offers(db, skip=skip, limit=limit)
    return offers

@app.post("/offers/", response_model=schemas.Offer, status_code=status.HTTP_201_CREATED)
async def create_offer(offer: schemas.OfferCreate, db: Annotated[Session, Depends(get_db)]):
    """Crée une nouvelle offre"""
    # Dans une implémentation réelle, nous ferions un appel au service de billetterie
    # Pour l'exemple, nous utilisons notre propre base de données
    db_offer = models.create_offer(db=db, offer=offer)
    return db_offer

@app.put("/offers/{offer_id}", response_model=schemas.Offer)
async def update_offer(offer_id: int, offer: schemas.OfferUpdate, db: Annotated[Session, Depends(get_db)]):
    """Met à jour une offre existante"""
    db_offer = models.get_offer(db, offer_id=offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Mise à jour de l'offre
    updated_offer = models.update_offer(db=db, offer_id=offer_id, offer=offer)
    return updated_offer

@app.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(offer_id: int, db: Annotated[Session, Depends(get_db)]):
    """Supprime une offre existante"""
    db_offer = models.get_offer(db, offer_id=offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Suppression de l'offre
    models.delete_offer(db=db, offer_id=offer_id)
    return {"status": "success"}

@app.get("/sales/", response_model=List[schemas.SalesSummary])
async def get_sales_summary(db: Annotated[Session, Depends(get_db)]):
    """Récupère un résumé des ventes par offre"""
    # Dans une implémentation réelle, nous ferions un appel au service de billetterie
    # Pour l'exemple, nous simulons des données de vente
    sales = models.get_sales_summary(db)
    return sales

@app.get("/sales/{offer_id}", response_model=schemas.SalesDetail)
async def get_offer_sales(offer_id: int, db: Annotated[Session, Depends(get_db)]):
    """Récupère les détails des ventes pour une offre spécifique"""
    db_offer = models.get_offer(db, offer_id=offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Récupération des détails des ventes
    sales_detail = models.get_offer_sales_detail(db, offer_id=offer_id)
    return sales_detail

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
