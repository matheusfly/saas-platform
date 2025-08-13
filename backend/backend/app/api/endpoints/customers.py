from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ... import models
from ...schemas import customer as schemas
from ...crud import crud_customer as crud
from .. import deps

router = APIRouter()

@router.post("/", response_model=schemas.Customer)
def create_customer(
    customer: schemas.CustomerCreate, db: Session = Depends(deps.get_db)
):
    return crud.create_customer(db=db, customer=customer)

@router.get("/", response_model=List[schemas.Customer])
def read_customers(
    skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)
):
    customers = crud.get_customers(db, skip=skip, limit=limit)
    return customers

@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(customer_id: int, db: Session = Depends(deps.get_db)):
    db_customer = crud.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer