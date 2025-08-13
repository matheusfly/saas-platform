from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ... import crud
from ...schemas import customer as schemas
from ..deps import get_db
from ...services import customer_data_service

router = APIRouter()

@router.on_event("startup")
def on_startup():
    db = next(get_db())
    customer_data_service.load_and_process_data(db)

@router.get("/status")
def get_status():
    return {"status": "ok"}

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total_customers = db.query(crud.crud_customer.models.Customer).count()
    active_customers = db.query(crud.crud_customer.models.Customer).filter(crud.crud_customer.models.Customer.status == 'Active').count()
    total_revenue = db.query(crud.crud_customer.func.sum(crud.crud_customer.models.Customer.total_spent)).scalar()
    avg_customer_value = total_revenue / total_customers if total_customers > 0 else 0
    return {
        'total_customers': total_customers,
        'active_customers': active_customers,
        'total_revenue': total_revenue,
        'avg_customer_value': avg_customer_value
    }

@router.get("/customers", response_model=List[schemas.Customer])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = crud.crud_customer.get_customers(db, skip=skip, limit=limit)
    return customers
