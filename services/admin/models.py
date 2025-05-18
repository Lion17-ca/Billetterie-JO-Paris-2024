from sqlalchemy import Column, Integer, String, Float, DateTime, func, select
from database import Base
from schemas import OfferCreate, OfferUpdate

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # solo, duo, familiale
    event_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Fonctions d'accès à la base de données
def get_offer(db, offer_id: int):
    stmt = select(Offer).where(Offer.id == offer_id)
    return db.execute(stmt).scalar_one_or_none()

def get_offers(db, skip: int = 0, limit: int = 100):
    stmt = select(Offer).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_offer(db, offer: OfferCreate):
    db_offer = Offer(**offer.model_dump())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def update_offer(db, offer_id: int, offer: OfferUpdate):
    db_offer = get_offer(db, offer_id=offer_id)
    
    # Mise à jour des champs
    for key, value in offer.model_dump(exclude_unset=True).items():
        setattr(db_offer, key, value)
    
    db.commit()
    db.refresh(db_offer)
    return db_offer

def delete_offer(db, offer_id: int):
    db_offer = get_offer(db, offer_id=offer_id)
    db.delete(db_offer)
    db.commit()
    return db_offer

# Fonctions pour les statistiques de vente
def get_sales_summary(db):
    """
    Récupère un résumé des ventes par offre.
    Dans une implémentation réelle, nous ferions un appel au service de billetterie.
    Pour l'exemple, nous simulons des données de vente.
    """
    offers = get_offers(db)
    sales_summary = []
    
    for offer in offers:
        # Simulation du nombre de tickets vendus
        tickets_sold = offer.id * 10  # Juste pour l'exemple
        revenue = tickets_sold * offer.price
        
        sales_summary.append({
            "offer_id": offer.id,
            "offer_name": offer.name,
            "tickets_sold": tickets_sold,
            "total_revenue": revenue,
            "event_date": offer.event_date
        })
    
    return sales_summary

def get_offer_sales_detail(db, offer_id: int):
    """
    Récupère les détails des ventes pour une offre spécifique.
    Dans une implémentation réelle, nous ferions un appel au service de billetterie.
    Pour l'exemple, nous simulons des données de vente détaillées.
    """
    offer = get_offer(db, offer_id=offer_id)
    
    # Simulation du nombre de tickets vendus
    tickets_sold = offer_id * 10  # Juste pour l'exemple
    revenue = tickets_sold * offer.price
    
    # Simulation des dates d'achat - utiliser des objets datetime réels au lieu de fonctions SQL
    import datetime
    current_date = datetime.datetime.now()
    purchase_dates = [
        current_date - datetime.timedelta(days=i % 30)  # Dates réparties sur les 30 derniers jours
        for i in range(tickets_sold)
    ]
    
    return {
        "offer_id": offer.id,
        "offer_name": offer.name,
        "tickets_sold": tickets_sold,
        "total_revenue": revenue,
        "event_date": offer.event_date,
        "sales_by_day": [
            {"date": date.strftime("%Y-%m-%d"), "count": 1}
            for date in purchase_dates
        ]
    }
