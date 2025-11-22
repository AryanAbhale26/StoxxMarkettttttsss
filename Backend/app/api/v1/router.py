from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, dashboard, stock_movements, warehouses

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(stock_movements.router, prefix="/stock-movements", tags=["Stock Movements"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["Warehouses"])
