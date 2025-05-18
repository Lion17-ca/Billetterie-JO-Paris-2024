from pydantic import BaseModel
from typing import List, Optional
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

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    type: Optional[str] = None
    event_date: Optional[datetime] = None

class Offer(OfferBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class SalesDay(BaseModel):
    date: str
    count: int

class SalesSummary(BaseModel):
    offer_id: int
    offer_name: str
    tickets_sold: int
    total_revenue: float
    event_date: datetime

class SalesDetail(SalesSummary):
    sales_by_day: List[SalesDay]
