from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, select, func
from database import Base
from schemas import TicketCreate, OfferCreate

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

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # ID de l'utilisateur (référence au service d'authentification)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    security_key_2 = Column(String, nullable=False)  # Deuxième clé générée lors de l'achat
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    is_used = Column(Boolean, default=False)  # Si le ticket a déjà été utilisé
    used_date = Column(DateTime, nullable=True)  # Date d'utilisation du ticket

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

def get_ticket(db, ticket_id: int):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    return db.execute(stmt).scalar_one_or_none()

def get_tickets_by_user(db, user_id: int, skip: int = 0, limit: int = 100):
    stmt = select(Ticket).where(Ticket.user_id == user_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_ticket(db, ticket: TicketCreate, security_key_2: str):
    db_ticket = Ticket(
        user_id=ticket.user_id,
        offer_id=ticket.offer_id,
        security_key_2=security_key_2
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def mark_ticket_as_used(db, ticket_id: int):
    db_ticket = get_ticket(db, ticket_id=ticket_id)
    if db_ticket:
        db_ticket.is_used = True
        db_ticket.used_date = func.now()
        db.commit()
        db.refresh(db_ticket)
    return db_ticket
