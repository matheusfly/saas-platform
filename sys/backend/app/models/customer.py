from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from ..database.base import Base

class Customer(Base):
    __tablename__ = 'customers'
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    total_spent = Column(Float)
    total_transactions = Column(Integer)
    last_transaction_date = Column(DateTime, nullable=True)

    sales_funnel = relationship("SalesFunnel", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")
