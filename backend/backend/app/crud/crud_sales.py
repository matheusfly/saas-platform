from sqlalchemy.orm import Session
from ..models import sales as models
from ..schemas import sales as schemas

def get_sales_funnel(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SalesFunnel).offset(skip).limit(limit).all()

def create_sales_funnel(db: Session, sales_funnel: schemas.SalesFunnelCreate, customer_id: int):
    db_sales_funnel = models.SalesFunnel(**sales_funnel.dict(), customer_id=customer_id)
    db.add(db_sales_funnel)
    db.commit()
    db.refresh(db_sales_funnel)
    return db_sales_funnel

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate, customer_id: int):
    db_transaction = models.Transaction(**transaction.dict(), customer_id=customer_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction