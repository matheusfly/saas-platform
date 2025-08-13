from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    status: str
    total_spent: float
    total_transactions: int
    last_transaction_date: Optional[datetime] = None

class CustomerCreate(CustomerBase):
    id: str

class Customer(CustomerBase):
    id: str

    class Config:
        orm_mode = True
