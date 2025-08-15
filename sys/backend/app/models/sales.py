from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base
from .customer import Customer

class SalesFunnel(Base):
    __tablename__ = "sales_funnel"

    id = Column(Integer, primary_key=True, index=True)
    stage = Column(String, index=True)
    value = Column(Float)
    customer_id = Column(Integer, ForeignKey("customers.id"))

customer = relationship("app.models.customer.Customer", back_populates="sales_funnel")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    item = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    unit_value = Column(Float)
    total_value = Column(Float)
    payment_method = Column(String)
    date = Column(DateTime)
    customer_id = Column(Integer, ForeignKey("customers.id"))

customer = relationship("app.models.customer.Customer", back_populates="transactions")
