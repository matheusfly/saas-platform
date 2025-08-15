from fastapi import APIRouter
from .endpoints import customers, sales, productivity, analytics, bi, customer

api_router = APIRouter()
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(productivity.router, prefix="/productivity", tags=["productivity"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(bi.router, prefix="/bi", tags=["bi"])
api_router.include_router(customer.router, prefix="/customer", tags=["customer"])