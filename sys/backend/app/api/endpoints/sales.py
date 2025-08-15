from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ... import models
from ...schemas import sales as schemas
from ...crud import crud_sales as crud
from .. import deps

router = APIRouter()

@router.post("/funnels/", response_model=schemas.SalesFunnel)
def create_sales_funnel(
    sales_funnel: schemas.SalesFunnelCreate,
    customer_id: int,
    db: Session = Depends(deps.get_db),
):
    return crud.create_sales_funnel(
        db=db, sales_funnel=sales_funnel, customer_id=customer_id
    )

@router.get("/funnels/", response_model=List[schemas.SalesFunnel])
def read_sales_funnels(
    skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)
):
    sales_funnels = crud.get_sales_funnel(db, skip=skip, limit=limit)
    return sales_funnels

@router.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    customer_id: int,
    db: Session = Depends(deps.get_db),
):
    return crud.create_transaction(
        db=db, transaction=transaction, customer_id=customer_id
    )

@router.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(
    skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)
):
    transactions = crud.get_transactions(db, skip=skip, limit=limit)
    return transactions