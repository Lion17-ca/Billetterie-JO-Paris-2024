from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ValidationRequest(BaseModel):
    qr_data: str
    employee_id: int

class ValidationResult(BaseModel):
    is_valid: bool
    ticket_id: int
    user_name: str
    offer_name: str
    purchase_date: str
    validation_date: str

class ValidationRecord(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    employee_id: int
    validation_date: datetime
    is_valid: bool

    model_config = {
        "from_attributes": True
    }
