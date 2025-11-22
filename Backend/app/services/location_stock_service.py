from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.core.database import get_database
from app.models.location_stock import ProductLocationStock, LocationStock, LocationStockSummary

class LocationStockService:
    @property
    def db(self):
        return get_database()
    
    async def _get_user_org_id(self, user_email: str) -> str:
        """Get organization_id for a user"""
        user = await self.db.users.find_one({"email": user_email})
        if not user or "organization_id" not in user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User organization not found"
            )
        return user["organization_id"]
    
    async def get_product_location_stock(self, product_id: str, user_email: str) -> Optional[ProductLocationStock]:
        """Get stock levels for a specific product across all locations"""
        if not ObjectId.is_valid(product_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        
        # Get product details
        product = await self.db.products.find_one({
            "_id": ObjectId(product_id),
            "organization_id": org_id
        })
        if not product:
            return None
        
        # Aggregate stock by location from stock_ledger
        pipeline = [
            {"$match": {
                "product_id": product_id,
                "organization_id": org_id
            }},
            {"$group": {
                "_id": "$location_id",
                "quantity": {"$sum": "$quantity_change"}
            }},
            {"$match": {"quantity": {"$gt": 0}}}  # Only locations with stock
        ]
        
        location_stocks = []
        async for loc in self.db.stock_ledger.aggregate(pipeline):
            location_id = loc["_id"]
            if location_id:
                # Get location details
                location = await self.db.locations.find_one({
                    "_id": ObjectId(location_id),
                    "organization_id": org_id
                })
                if location:
                    location_stocks.append(LocationStock(
                        location_id=str(location["_id"]),
                        location_name=location["name"],
                        quantity=loc["quantity"]
                    ))
        
        total_stock = sum(loc.quantity for loc in location_stocks)
        
        return ProductLocationStock(
            product_id=str(product["_id"]),
            product_name=product["name"],
            product_sku=product["sku"],
            total_stock=total_stock,
            locations=location_stocks
        )
    
    async def get_all_products_location_stock(self, user_email: str) -> List[ProductLocationStock]:
        """Get stock levels for all products across all locations"""
        org_id = await self._get_user_org_id(user_email)
        
        products = await self.db.products.find({"organization_id": org_id}).to_list(length=1000)
        
        result = []
        for product in products:
            product_stock = await self.get_product_location_stock(str(product["_id"]), user_email)
            if product_stock:
                result.append(product_stock)
        
        return result
    
    async def get_location_stock_summary(self, location_id: str, user_email: str) -> Optional[LocationStockSummary]:
        """Get all products and their quantities in a specific location"""
        if not ObjectId.is_valid(location_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        
        # Get location details
        location = await self.db.locations.find_one({
            "_id": ObjectId(location_id),
            "organization_id": org_id
        })
        if not location:
            return None
        
        # Get warehouse details
        warehouse = await self.db.warehouses.find_one({
            "_id": ObjectId(location["warehouse_id"]),
            "organization_id": org_id
        })
        
        # Aggregate products in this location
        pipeline = [
            {"$match": {
                "location_id": location_id,
                "organization_id": org_id
            }},
            {"$group": {
                "_id": "$product_id",
                "quantity": {"$sum": "$quantity_change"}
            }},
            {"$match": {"quantity": {"$gt": 0}}}
        ]
        
        products = []
        async for item in self.db.stock_ledger.aggregate(pipeline):
            product_id = item["_id"]
            product = await self.db.products.find_one({
                "_id": ObjectId(product_id),
                "organization_id": org_id
            })
            if product:
                products.append({
                    "product_id": str(product["_id"]),
                    "product_name": product["name"],
                    "product_sku": product["sku"],
                    "quantity": item["quantity"]
                })
        
        return LocationStockSummary(
            location_id=str(location["_id"]),
            location_name=location["name"],
            warehouse_id=str(location["warehouse_id"]),
            warehouse_name=warehouse["name"] if warehouse else "Unknown",
            products=products,
            total_products=len(products)
        )
    
    async def get_all_locations_stock_summary(self, user_email: str) -> List[LocationStockSummary]:
        """Get stock summary for all locations"""
        org_id = await self._get_user_org_id(user_email)
        
        locations = await self.db.locations.find({"organization_id": org_id}).to_list(length=1000)
        
        result = []
        for location in locations:
            summary = await self.get_location_stock_summary(str(location["_id"]), user_email)
            if summary:
                result.append(summary)
        
        return result

location_stock_service = LocationStockService()
