from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from bson import ObjectId
from app.core.database import get_database
from app.models.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
    WarehouseResponse,
    LocationCreate,
    LocationResponse
)

class WarehouseService:
    @property
    def db(self):
        return get_database()
    
    async def create_warehouse(self, warehouse_data: WarehouseCreate) -> WarehouseResponse:
        """Create a new warehouse"""
        existing = await self.db.warehouses.find_one({"code": warehouse_data.code})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Warehouse with this code already exists"
            )
        
        warehouse_dict = {
            "name": warehouse_data.name,
            "code": warehouse_data.code,
            "address": warehouse_data.address,
            "is_active": warehouse_data.is_active,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.warehouses.insert_one(warehouse_dict)
        warehouse_dict["_id"] = result.inserted_id
        
        return self._to_response(warehouse_dict)
    
    async def get_all_warehouses(self, active_only: bool = False) -> List[WarehouseResponse]:
        """Get all warehouses"""
        query = {"is_active": True} if active_only else {}
        cursor = self.db.warehouses.find(query).sort("name", 1)
        warehouses = await cursor.to_list(length=None)
        return [self._to_response(w) for w in warehouses]
    
    async def get_warehouse_by_id(self, warehouse_id: str) -> Optional[WarehouseResponse]:
        """Get warehouse by ID"""
        if not ObjectId.is_valid(warehouse_id):
            return None
        
        warehouse = await self.db.warehouses.find_one({"_id": ObjectId(warehouse_id)})
        if not warehouse:
            return None
        
        return self._to_response(warehouse)
    
    async def create_location(self, location_data: LocationCreate) -> LocationResponse:
        """Create a new location"""
        location_dict = {
            "name": location_data.name,
            "warehouse_id": location_data.warehouse_id,
            "type": location_data.type,
            "created_at": datetime.utcnow()
        }
        
        result = await self.db.locations.insert_one(location_dict)
        location_dict["_id"] = result.inserted_id
        
        return self._location_to_response(location_dict)
    
    async def get_locations_by_warehouse(self, warehouse_id: str) -> List[LocationResponse]:
        """Get all locations for a warehouse"""
        cursor = self.db.locations.find({"warehouse_id": warehouse_id}).sort("name", 1)
        locations = await cursor.to_list(length=None)
        return [self._location_to_response(l) for l in locations]
    
    async def get_all_locations(self) -> List[LocationResponse]:
        """Get all locations"""
        cursor = self.db.locations.find({}).sort("name", 1)
        locations = await cursor.to_list(length=None)
        return [self._location_to_response(l) for l in locations]
    
    def _to_response(self, warehouse: dict) -> WarehouseResponse:
        """Convert warehouse document to response"""
        return WarehouseResponse(
            id=str(warehouse["_id"]),
            name=warehouse["name"],
            code=warehouse["code"],
            address=warehouse.get("address"),
            is_active=warehouse["is_active"],
            created_at=warehouse["created_at"]
        )
    
    def _location_to_response(self, location: dict) -> LocationResponse:
        """Convert location document to response"""
        return LocationResponse(
            id=str(location["_id"]),
            name=location["name"],
            warehouse_id=location["warehouse_id"],
            type=location["type"],
            created_at=location["created_at"]
        )

warehouse_service = WarehouseService()
