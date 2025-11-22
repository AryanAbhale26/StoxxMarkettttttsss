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
    
    async def _get_user_org_id(self, user_email: str) -> str:
        """Get organization_id for a user"""
        user = await self.db.users.find_one({"email": user_email})
        if not user or not user.get("organization_id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User organization not found"
            )
        return user["organization_id"]
    
    async def create_product(self, product_data: ProductCreate, user_email: str) -> ProductResponse:
        """Create a new product"""
        org_id = await self._get_user_org_id(user_email)
        
        # Check if SKU already exists within organization
        existing_product = await self.db.products.find_one({
            "sku": product_data.sku,
            "organization_id": org_id
        })
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists in your organization"
            )
        
        product_dict = {
            "name": product_data.name,
            "sku": product_data.sku,
            "category": product_data.category,
            "unit_of_measure": product_data.unit_of_measure,
            "description": product_data.description,
            "current_stock": product_data.initial_stock or 0,
            "reorder_level": product_data.reorder_level,
            "organization_id": org_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email
        }
        
        result = await self.db.products.insert_one(product_dict)
        product_dict["_id"] = result.inserted_id
        
        # Create initial stock ledger entry if initial_stock > 0 and location is provided
        if product_data.initial_stock and product_data.initial_stock > 0 and product_data.location_id:
            # Validate location and warehouse
            if not ObjectId.is_valid(product_data.location_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid location_id"
                )
            
            location = await self.db.locations.find_one({
                "_id": ObjectId(product_data.location_id),
                "organization_id": org_id
            })
            
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Location not found in your organization"
                )
            
            # Create stock ledger entry for initial stock
            ledger_entry = {
                "product_id": str(result.inserted_id),
                "location_id": product_data.location_id,
                "warehouse_id": product_data.warehouse_id,
                "movement_type": "receipt",
                "reference": f"Initial Stock - {product_data.sku}",
                "quantity_change": product_data.initial_stock,
                "balance": product_data.initial_stock,
                "organization_id": org_id,
                "created_at": datetime.utcnow(),
                "created_by": user_email
            }
            
            await self.db.stock_ledger.insert_one(ledger_entry)
        
        return self._to_response(product_dict)
    
    async def get_product_by_id(self, product_id: str, user_email: str) -> Optional[ProductResponse]:
        """Get product by ID (within user's organization)"""
        if not ObjectId.is_valid(product_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        product = await self.db.products.find_one({
            "_id": ObjectId(product_id),
            "organization_id": org_id
        })
        if not product:
            return None
        
        return self._to_response(product)
    
    async def get_all_products(self, user_email: str, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[ProductResponse]:
        """Get all products within user's organization"""
        org_id = await self._get_user_org_id(user_email)
        
        query = {"organization_id": org_id}
        if category:
            query["category"] = category
        
        cursor = self.db.products.find(query).skip(skip).limit(limit).sort("name", 1)
        products = await cursor.to_list(length=limit)
        
        return [self._to_response(p) for p in products]
    
    async def update_product(self, product_id: str, product_data: ProductUpdate, user_email: str) -> Optional[ProductResponse]:
        """Update a product (within user's organization)"""
        if not ObjectId.is_valid(product_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        update_data = {k: v for k, v in product_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return await self.get_product_by_id(product_id, user_email)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.products.update_one(
            {"_id": ObjectId(product_id), "organization_id": org_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_product_by_id(product_id, user_email)
    
    async def delete_product(self, product_id: str, user_email: str) -> bool:
        """Delete a product (within user's organization)"""
        if not ObjectId.is_valid(product_id):
            return False
        
        org_id = await self._get_user_org_id(user_email)
        result = await self.db.products.delete_one({
            "_id": ObjectId(product_id),
            "organization_id": org_id
        })
        return result.deleted_count > 0
    
    async def get_low_stock_products(self, user_email: str) -> List[ProductResponse]:
        """Get products with stock below reorder level (within user's organization)"""
        org_id = await self._get_user_org_id(user_email)
        cursor = self.db.products.find({
            "organization_id": org_id,
            "$expr": {"$lte": ["$current_stock", "$reorder_level"]}
        })
        products = await cursor.to_list(length=None)
        return [self._to_response(p) for p in products]
    
    async def search_products(self, query: str, user_email: str) -> List[ProductResponse]:
        """Search products by name or SKU (within user's organization)"""
        org_id = await self._get_user_org_id(user_email)
        cursor = self.db.products.find({
            "organization_id": org_id,
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
