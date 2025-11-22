from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from bson import ObjectId
from app.core.database import get_database
from app.models.product import ProductCreate, ProductUpdate, ProductResponse

class ProductService:
    @property
    def db(self):
        return get_database()
    
    async def create_product(self, product_data: ProductCreate, user_email: str) -> ProductResponse:
        """Create a new product"""
        # Check if SKU already exists
        existing_product = await self.db.products.find_one({"sku": product_data.sku})
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )
        
        product_dict = {
            "name": product_data.name,
            "sku": product_data.sku,
            "category": product_data.category,
            "unit_of_measure": product_data.unit_of_measure,
            "description": product_data.description,
            "current_stock": product_data.initial_stock or 0,
            "reorder_level": product_data.reorder_level,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email
        }
        
        result = await self.db.products.insert_one(product_dict)
        product_dict["_id"] = result.inserted_id
        
        return self._to_response(product_dict)
    
    async def get_product_by_id(self, product_id: str) -> Optional[ProductResponse]:
        """Get product by ID"""
        if not ObjectId.is_valid(product_id):
            return None
        
        product = await self.db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return None
        
        return self._to_response(product)
    
    async def get_all_products(self, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[ProductResponse]:
        """Get all products with optional filtering"""
        query = {}
        if category:
            query["category"] = category
        
        cursor = self.db.products.find(query).skip(skip).limit(limit).sort("name", 1)
        products = await cursor.to_list(length=limit)
        
        return [self._to_response(p) for p in products]
    
    async def update_product(self, product_id: str, product_data: ProductUpdate) -> Optional[ProductResponse]:
        """Update a product"""
        if not ObjectId.is_valid(product_id):
            return None
        
        update_data = {k: v for k, v in product_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return await self.get_product_by_id(product_id)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_product_by_id(product_id)
    
    async def delete_product(self, product_id: str) -> bool:
        """Delete a product"""
        if not ObjectId.is_valid(product_id):
            return False
        
        result = await self.db.products.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0
    
    async def get_low_stock_products(self) -> List[ProductResponse]:
        """Get products with stock below reorder level"""
        cursor = self.db.products.find({
            "$expr": {"$lte": ["$current_stock", "$reorder_level"]}
        })
        products = await cursor.to_list(length=None)
        return [self._to_response(p) for p in products]
    
    async def search_products(self, query: str) -> List[ProductResponse]:
        """Search products by name or SKU"""
        cursor = self.db.products.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"sku": {"$regex": query, "$options": "i"}}
            ]
        })
        products = await cursor.to_list(length=50)
        return [self._to_response(p) for p in products]
    
    def _to_response(self, product: dict) -> ProductResponse:
        """Convert database document to response model"""
        is_low_stock = product.get("current_stock", 0) <= product.get("reorder_level", 0)
        
        return ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            sku=product["sku"],
            category=product["category"],
            unit_of_measure=product["unit_of_measure"],
            description=product.get("description"),
            current_stock=product.get("current_stock", 0),
            reorder_level=product.get("reorder_level", 10),
            created_at=product["created_at"],
            updated_at=product["updated_at"],
            is_low_stock=is_low_stock
        )

product_service = ProductService()
