from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SalesFunnelBase(BaseModel):
    stage: str
    value: float

class SalesFunnelCreate(SalesFunnelBase):
    pass

class SalesFunnel(SalesFunnelBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    item: str
    category: str
    quantity: int
    unit_value: float
    total_value: float
    payment_method: str
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True