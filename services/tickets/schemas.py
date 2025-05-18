from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OfferBase(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    type: str  # solo, duo, familiale
    event_date: datetime

class OfferCreate(OfferBase):
    pass

class Offer(OfferBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class TicketBase(BaseModel):
    user_id: int
    offer_id: int

class TicketCreate(TicketBase):
    pass

class Ticket(TicketBase):
    id: int
    security_key_2: str
    purchase_date: datetime
    is_used: bool
    used_date: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }
