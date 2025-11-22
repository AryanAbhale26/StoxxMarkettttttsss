from pydantic import BaseModel
from typing import List, Optional

class LocationStock(BaseModel):
    location_id: str
    location_name: str
    quantity: int

class ProductLocationStock(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    total_stock: int
    locations: List[LocationStock]

class LocationStockSummary(BaseModel):
    location_id: str
    location_name: str
    warehouse_id: str
    warehouse_name: str
    products: List[dict]  # [{product_id, product_name, product_sku, quantity}]
    total_products: int
