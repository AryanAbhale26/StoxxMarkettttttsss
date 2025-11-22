from pydantic import BaseModel
from typing import List

class DashboardKPIs(BaseModel):
    total_products: int
    low_stock_items: int
    out_of_stock_items: int
    total_stock_value: int
    pending_receipts: int = 0
    pending_deliveries: int = 0
    internal_transfers: int = 0

class DashboardService:
    @property
    def db(self):
        from app.core.database import get_database
        return get_database()
    
    async def get_dashboard_kpis(self) -> DashboardKPIs:
        """Get dashboard KPIs"""
        # Total products
        total_products = await self.db.products.count_documents({})
        
        # Low stock items (stock <= reorder level)
        low_stock_items = await self.db.products.count_documents({
            "$expr": {"$lte": ["$current_stock", "$reorder_level"]}
        })
        
        # Out of stock items
        out_of_stock_items = await self.db.products.count_documents({"current_stock": 0})
        
        # Total stock value (sum of all stock)
        pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$current_stock"}}}
        ]
        result = await self.db.products.aggregate(pipeline).to_list(1)
        total_stock_value = result[0]["total"] if result else 0
        
        return DashboardKPIs(
            total_products=total_products,
            low_stock_items=low_stock_items,
            out_of_stock_items=out_of_stock_items,
            total_stock_value=total_stock_value,
            pending_receipts=0,
            pending_deliveries=0,
            internal_transfers=0
        )

dashboard_service = DashboardService()
