from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated
import qrcode
from io import BytesIO
import base64
import secrets
import models
import schemas
from database import get_db, engine

# Initialisation de l'application
app = FastAPI(title="Service de Billetterie - Jeux Olympiques")

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

# Fonctions utilitaires
def generate_security_key_2():
    """Génère une deuxième clé de sécurité cryptographiquement sûre"""
    return secrets.token_hex(32)

def generate_qr_code(ticket_id: int, security_key_1: str, security_key_2: str):
    """Génère un QR code à partir des deux clés de sécurité"""
    # Concaténation des deux clés avec l'ID du ticket pour créer une signature unique
    data = f"{ticket_id}:{security_key_1}:{security_key_2}"
    
    # Génération du QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Création de l'image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Conversion de l'image en base64 pour l'affichage
    buffered = BytesIO()
    img.save(buffered)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

# Routes
@app.get("/offers/", response_model=List[schemas.Offer])
def get_offers(db: Annotated[Session, Depends(get_db)], skip: int = 0, limit: int = 100):
    offers = models.get_offers(db, skip=skip, limit=limit)
    return offers

@app.get("/offers/{offer_id}", response_model=schemas.Offer)
def get_offer(offer_id: int, db: Annotated[Session, Depends(get_db)]):
    db_offer = models.get_offer(db, offer_id=offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return db_offer

@app.post("/tickets/", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Annotated[Session, Depends(get_db)]):
    # Vérification que l'offre existe
    offer = models.get_offer(db, offer_id=ticket.offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Vérification que l'utilisateur existe (à implémenter avec un appel au service d'authentification)
    
    # Génération de la deuxième clé de sécurité
    security_key_2 = generate_security_key_2()
    
    # Création du ticket
    db_ticket = models.create_ticket(db=db, ticket=ticket, security_key_2=security_key_2)
    
    return db_ticket

@app.get("/tickets/user/{user_id}", response_model=List[schemas.Ticket])
def get_user_tickets(user_id: int, db: Annotated[Session, Depends(get_db)]):
    tickets = models.get_tickets_by_user(db, user_id=user_id)
    return tickets

@app.get("/tickets/{ticket_id}", response_model=schemas.Ticket)
def get_ticket(ticket_id: int, db: Annotated[Session, Depends(get_db)]):
    db_ticket = models.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@app.get("/tickets/{ticket_id}/qrcode")
def get_ticket_qrcode(ticket_id: int, db: Annotated[Session, Depends(get_db)]):
    # Récupération du ticket
    db_ticket = models.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Récupération de la première clé de sécurité (à implémenter avec un appel au service d'authentification)
    # Pour l'exemple, nous utilisons une clé fictive
    security_key_1 = "fake_security_key_1"  # À remplacer par un appel au service d'authentification
    
    # Génération du QR code
    qr_code = generate_qr_code(db_ticket.id, security_key_1, db_ticket.security_key_2)
    
    return {"qr_code": qr_code}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
