from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from bson import ObjectId
from app.core.database import get_database
from app.models.stock_movement import (
    StockMovementCreate,
    StockMovementUpdate,
    StockMovementResponse,
    InventoryAdjustment,
    StockLedgerEntry,
    MovementType,
    MovementStatus
)

class StockMovementService:
    @property
    def db(self):
        return get_database()
    
    async def create_movement(self, movement_data: StockMovementCreate, user_email: str) -> StockMovementResponse:
        """Create a new stock movement"""
        movement_dict = {
            "type": movement_data.type,
            "status": movement_data.status,
            "reference": movement_data.reference,
            "source_location_id": movement_data.source_location_id,
            "destination_location_id": movement_data.destination_location_id,
            "scheduled_date": movement_data.scheduled_date,
            "notes": movement_data.notes,
            "lines": [line.dict() for line in movement_data.lines],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email,
            "executed_at": None
        }
        
        result = await self.db.stock_movements.insert_one(movement_dict)
        movement_dict["_id"] = result.inserted_id
        
        return self._to_response(movement_dict)
    
    async def get_movement_by_id(self, movement_id: str) -> Optional[StockMovementResponse]:
        """Get movement by ID"""
        if not ObjectId.is_valid(movement_id):
            return None
        
        movement = await self.db.stock_movements.find_one({"_id": ObjectId(movement_id)})
        if not movement:
            return None
        
        return self._to_response(movement)
    
    async def get_all_movements(
        self,
        skip: int = 0,
        limit: int = 100,
        movement_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[StockMovementResponse]:
        """Get all movements with optional filtering"""
        query = {}
        if movement_type:
            query["type"] = movement_type
        if status:
            query["status"] = status
        
        cursor = self.db.stock_movements.find(query).skip(skip).limit(limit).sort("created_at", -1)
        movements = await cursor.to_list(length=limit)
        
        return [self._to_response(m) for m in movements]
    
    async def update_movement(self, movement_id: str, movement_data: StockMovementUpdate) -> Optional[StockMovementResponse]:
        """Update a movement"""
        if not ObjectId.is_valid(movement_id):
            return None
        
        update_data = {k: v for k, v in movement_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return await self.get_movement_by_id(movement_id)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.stock_movements.update_one(
            {"_id": ObjectId(movement_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_movement_by_id(movement_id)
    
    async def execute_movement(self, movement_id: str) -> StockMovementResponse:
        """Execute a stock movement (mark as done and update stock levels)"""
        if not ObjectId.is_valid(movement_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movement not found")
        
        movement = await self.db.stock_movements.find_one({"_id": ObjectId(movement_id)})
        if not movement:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movement not found")
        
        if movement["status"] == "done":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movement already executed")
        
        # Update product stock levels based on movement type
        for line in movement["lines"]:
            product_id = line["product_id"]
            quantity = line["quantity"]
            
            if movement["type"] == "receipt":
                # Increase stock for receipts
                await self.db.products.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$inc": {"current_stock": quantity}}
                )
            elif movement["type"] == "delivery":
                # Decrease stock for deliveries
                await self.db.products.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$inc": {"current_stock": -quantity}}
                )
            # Internal transfers don't change total stock
            
            # Create ledger entry
            product = await self.db.products.find_one({"_id": ObjectId(product_id)})
            ledger_entry = {
                "product_id": product_id,
                "product_name": line["product_name"],
                "product_sku": line["product_sku"],
                "movement_type": movement["type"],
                "reference": movement["reference"],
                "location_from": movement.get("source_location_id"),
                "location_to": movement.get("destination_location_id"),
                "quantity": quantity,
                "balance_after": product["current_stock"] if product else 0,
                "timestamp": datetime.utcnow(),
                "created_by": movement["created_by"]
            }
            await self.db.stock_ledger.insert_one(ledger_entry)
        
        # Mark movement as done
        await self.db.stock_movements.update_one(
            {"_id": ObjectId(movement_id)},
            {
                "$set": {
                    "status": "done",
                    "executed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_movement_by_id(movement_id)
    
    async def adjust_inventory(self, adjustment: InventoryAdjustment, user_email: str) -> dict:
        """Perform inventory adjustment"""
        if not ObjectId.is_valid(adjustment.product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        product = await self.db.products.find_one({"_id": ObjectId(adjustment.product_id)})
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        current_stock = product.get("current_stock", 0)
        difference = adjustment.counted_quantity - current_stock
        
        # Update product stock
        await self.db.products.update_one(
            {"_id": ObjectId(adjustment.product_id)},
            {"$set": {"current_stock": adjustment.counted_quantity}}
        )
        
        # Create adjustment movement record
        movement_dict = {
            "type": "adjustment",
            "status": "done",
            "reference": f"ADJ-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
            "source_location_id": adjustment.location_id,
            "destination_location_id": adjustment.location_id,
            "notes": adjustment.notes,
            "lines": [{
                "product_id": adjustment.product_id,
                "product_name": product["name"],
                "product_sku": product["sku"],
                "quantity": difference,
                "unit_of_measure": product["unit_of_measure"]
            }],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email,
            "executed_at": datetime.utcnow()
        }
        
        await self.db.stock_movements.insert_one(movement_dict)
        
        # Create ledger entry
        ledger_entry = {
            "product_id": adjustment.product_id,
            "product_name": product["name"],
            "product_sku": product["sku"],
            "movement_type": "adjustment",
            "reference": movement_dict["reference"],
            "location_from": adjustment.location_id,
            "location_to": adjustment.location_id,
            "quantity": difference,
            "balance_after": adjustment.counted_quantity,
            "timestamp": datetime.utcnow(),
            "created_by": user_email
        }
        await self.db.stock_ledger.insert_one(ledger_entry)
        
        return {
            "message": "Inventory adjusted successfully",
            "previous_stock": current_stock,
            "new_stock": adjustment.counted_quantity,
            "difference": difference
        }
    
    async def get_stock_ledger(
        self,
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[str] = None,
        movement_type: Optional[str] = None
    ) -> List[StockLedgerEntry]:
        """Get stock ledger entries"""
        query = {}
        if product_id:
            query["product_id"] = product_id
        if movement_type:
            query["movement_type"] = movement_type
        
        cursor = self.db.stock_ledger.find(query).skip(skip).limit(limit).sort("timestamp", -1)
        entries = await cursor.to_list(length=limit)
        
        return [self._ledger_to_response(e) for e in entries]
    
    def _to_response(self, movement: dict) -> StockMovementResponse:
        """Convert database document to response model"""
        return StockMovementResponse(
            id=str(movement["_id"]),
            type=movement["type"],
            status=movement["status"],
            reference=movement["reference"],
            source_location_id=movement.get("source_location_id"),
            destination_location_id=movement.get("destination_location_id"),
            lines=movement["lines"],
            scheduled_date=movement.get("scheduled_date"),
            notes=movement.get("notes"),
            created_at=movement["created_at"],
            executed_at=movement.get("executed_at"),
            created_by=movement["created_by"]
        )
    
    def _ledger_to_response(self, entry: dict) -> StockLedgerEntry:
        """Convert ledger entry to response"""
        return StockLedgerEntry(
            id=str(entry["_id"]),
            product_id=entry["product_id"],
            product_name=entry["product_name"],
            product_sku=entry["product_sku"],
            movement_type=entry["movement_type"],
            reference=entry["reference"],
            location_from=entry.get("location_from"),
            location_to=entry.get("location_to"),
            quantity=entry["quantity"],
            balance_after=entry["balance_after"],
            timestamp=entry["timestamp"],
            created_by=entry["created_by"]
        )

stock_movement_service = StockMovementService()
