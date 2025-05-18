from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import requests
from datetime import datetime
from typing import List, Annotated
import models
import schemas
from database import get_db, engine

# Initialisation de l'application
app = FastAPI(title="Service de Validation - Jeux Olympiques")

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

# Configuration de la sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Fonctions utilitaires
def validate_ticket_signature(ticket_id: int, security_key_1: str, security_key_2: str):
    """Valide la signature du ticket en utilisant les deux clés de sécurité"""
    # Dans une implémentation réelle, nous utiliserions une méthode cryptographique
    # pour vérifier la signature. Pour l'exemple, nous considérons que la concaténation
    # des deux clés est valide.
    return True

# Routes
@app.post("/validate", response_model=schemas.ValidationResult)
async def validate_ticket(validation_data: schemas.ValidationRequest, db: Annotated[Session, Depends(get_db)]):
    """
    Valide un e-ticket en utilisant les informations extraites du QR code.
    Vérifie l'authenticité du billet et s'assure qu'il n'a pas déjà été utilisé.
    """
    # Extraction des données du QR code
    try:
        ticket_id, security_key_1, security_key_2 = validation_data.qr_data.split(":")
        ticket_id = int(ticket_id)
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid QR code format"
        )
    
    # Vérification que le ticket existe (à implémenter avec un appel au service de billetterie)
    # Pour l'exemple, nous simulons un appel à l'API du service de billetterie
    ticket_info = {
        "id": ticket_id,
        "user_id": 1,
        "offer_id": 1,
        "security_key_2": security_key_2,
        "purchase_date": datetime.now().isoformat(),
        "is_used": False,
        "used_date": None
    }
    
    # Vérification que le ticket n'a pas déjà été utilisé
    if ticket_info["is_used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has already been used"
        )
    
    # Vérification de l'authenticité du ticket
    if not validate_ticket_signature(ticket_id, security_key_1, security_key_2):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ticket signature"
        )
    
    # Récupération des informations de l'utilisateur (à implémenter avec un appel au service d'authentification)
    # Pour l'exemple, nous simulons un appel à l'API du service d'authentification
    user_info = {
        "id": ticket_info["user_id"],
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
    
    # Récupération des informations de l'offre (à implémenter avec un appel au service de billetterie)
    # Pour l'exemple, nous simulons un appel à l'API du service de billetterie
    offer_info = {
        "id": ticket_info["offer_id"],
        "name": "Finale Natation",
        "event_date": datetime.now().isoformat()
    }
    
    # Marquer le ticket comme utilisé (à implémenter avec un appel au service de billetterie)
    # Pour l'exemple, nous simulons un appel à l'API du service de billetterie
    ticket_info["is_used"] = True
    ticket_info["used_date"] = datetime.now().isoformat()
    
    # Enregistrement de la validation
    validation_record = models.create_validation_record(
        db=db,
        ticket_id=ticket_id,
        user_id=user_info["id"],
        employee_id=validation_data.employee_id
    )
    
    # Préparation du résultat
    result = schemas.ValidationResult(
        is_valid=True,
        ticket_id=ticket_id,
        user_name=f"{user_info['first_name']} {user_info['last_name']}",
        offer_name=offer_info["name"],
        purchase_date=ticket_info["purchase_date"],
        validation_date=validation_record.validation_date.isoformat()
    )
    
    return result

@app.get("/validations/", response_model=List[schemas.ValidationRecord])
async def get_validations(db: Annotated[Session, Depends(get_db)], skip: int = 0, limit: int = 100):
    """Récupère l'historique des validations"""
    validations = models.get_validation_records(db, skip=skip, limit=limit)
    return validations

@app.get("/validations/employee/{employee_id}", response_model=List[schemas.ValidationRecord])
async def get_employee_validations(employee_id: int, db: Annotated[Session, Depends(get_db)]):
    """Récupère l'historique des validations effectuées par un employé spécifique"""
    validations = models.get_validation_records_by_employee(db, employee_id=employee_id)
    return validations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
