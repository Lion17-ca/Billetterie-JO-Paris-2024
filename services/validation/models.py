from sqlalchemy import Column, Integer, DateTime, Boolean, select
from sqlalchemy.sql import func
from database import Base

class ValidationRecord(Base):
    __tablename__ = "validation_records"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    employee_id = Column(Integer, nullable=False)
    validation_date = Column(DateTime(timezone=True), server_default=func.now())
    is_valid = Column(Boolean, default=True)

# Fonctions d'accès à la base de données
def get_validation_record(db, record_id: int):
    stmt = select(ValidationRecord).where(ValidationRecord.id == record_id)
    return db.execute(stmt).scalar_one_or_none()

def get_validation_records(db, skip: int = 0, limit: int = 100):
    stmt = select(ValidationRecord).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_validation_records_by_employee(db, employee_id: int, skip: int = 0, limit: int = 100):
    stmt = select(ValidationRecord).where(
        ValidationRecord.employee_id == employee_id
    ).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_validation_records_by_ticket(db, ticket_id: int):
    stmt = select(ValidationRecord).where(
        ValidationRecord.ticket_id == ticket_id
    )
    return db.execute(stmt).scalars().all()

def create_validation_record(db, ticket_id: int, user_id: int, employee_id: int):
    db_record = ValidationRecord(
        ticket_id=ticket_id,
        user_id=user_id,
        employee_id=employee_id,
        is_valid=True
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
