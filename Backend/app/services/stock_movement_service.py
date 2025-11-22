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
    
    async def _get_user_org_id(self, user_email: str) -> str:
        """Get organization_id for a user"""
        user = await self.db.users.find_one({"email": user_email})
        if not user or "organization_id" not in user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User organization not found"
            )
        return user["organization_id"]
    
    async def create_movement(self, movement_data: StockMovementCreate, user_email: str) -> StockMovementResponse:
        """Create a new stock movement"""
        org_id = await self._get_user_org_id(user_email)
        
        movement_dict = {
            "type": movement_data.type,
            "status": movement_data.status,
            "reference": movement_data.reference,
            "partner_name": movement_data.partner_name,
            "source_location_id": movement_data.source_location_id,
            "destination_location_id": movement_data.destination_location_id,
            "scheduled_date": movement_data.scheduled_date,
            "notes": movement_data.notes,
            "lines": [line.dict() for line in movement_data.lines],
            "organization_id": org_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email,
            "executed_at": None
        }
        
        result = await self.db.stock_movements.insert_one(movement_dict)
        movement_dict["_id"] = result.inserted_id
        
        return self._to_response(movement_dict)
    
    async def get_movement_by_id(self, movement_id: str, user_email: str) -> Optional[StockMovementResponse]:
        """Get movement by ID"""
        if not ObjectId.is_valid(movement_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        
        movement = await self.db.stock_movements.find_one({
            "_id": ObjectId(movement_id),
            "organization_id": org_id
        })
        if not movement:
            return None
        
        return self._to_response(movement)
    
    async def get_all_movements(
        self,
        user_email: str,
        skip: int = 0,
        limit: int = 100,
        movement_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[StockMovementResponse]:
        """Get all movements with optional filtering"""
        org_id = await self._get_user_org_id(user_email)
        
        query = {"organization_id": org_id}
        if movement_type:
            query["type"] = movement_type
        if status:
            query["status"] = status
        
        cursor = self.db.stock_movements.find(query).skip(skip).limit(limit).sort("created_at", -1)
        movements = await cursor.to_list(length=limit)
        
        return [self._to_response(m) for m in movements]
    
    async def update_movement(self, movement_id: str, movement_data: StockMovementUpdate, user_email: str) -> Optional[StockMovementResponse]:
        """Update a movement"""
        if not ObjectId.is_valid(movement_id):
            return None
        
        org_id = await self._get_user_org_id(user_email)
        
        update_data = {k: v for k, v in movement_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return await self.get_movement_by_id(movement_id, user_email)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.stock_movements.update_one(
            {"_id": ObjectId(movement_id), "organization_id": org_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_movement_by_id(movement_id, user_email)
    
    async def execute_movement(self, movement_id: str, user_email: str) -> StockMovementResponse:
        """Execute a stock movement (mark as done and update stock levels)"""
        if not ObjectId.is_valid(movement_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movement not found")
        
        org_id = await self._get_user_org_id(user_email)
        
        movement = await self.db.stock_movements.find_one({
            "_id": ObjectId(movement_id),
            "organization_id": org_id
        })
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
            
            # Create ledger entry with location tracking
            product = await self.db.products.find_one({
                "_id": ObjectId(product_id),
                "organization_id": org_id
            })
            
            # Determine quantity change and location_id for ledger
            quantity_change = 0
            location_id = None
            
            if movement["type"] == "receipt":
                quantity_change = quantity
                location_id = movement.get("destination_location_id")
            elif movement["type"] == "delivery":
                quantity_change = -quantity
                location_id = movement.get("source_location_id")
            elif movement["type"] == "internal":
                # For internal transfers, create two ledger entries
                # 1. Decrease from source
                source_location_id = movement.get("source_location_id")
                if source_location_id:
                    ledger_entry_out = {
                        "product_id": product_id,
                        "product_name": line["product_name"],
                        "product_sku": line["product_sku"],
                        "movement_type": movement["type"],
                        "reference": movement["reference"],
                        "location_id": source_location_id,
                        "location_from": source_location_id,
                        "location_to": movement.get("destination_location_id"),
                        "quantity": quantity,
                        "quantity_change": -quantity,
                        "balance_after": product["current_stock"] if product else 0,
                        "organization_id": org_id,
                        "timestamp": datetime.utcnow(),
                        "created_by": movement["created_by"]
                    }
                    await self.db.stock_ledger.insert_one(ledger_entry_out)
                
                # 2. Increase in destination
                dest_location_id = movement.get("destination_location_id")
                if dest_location_id:
                    ledger_entry_in = {
                        "product_id": product_id,
                        "product_name": line["product_name"],
                        "product_sku": line["product_sku"],
                        "movement_type": movement["type"],
                        "reference": movement["reference"],
                        "location_id": dest_location_id,
                        "location_from": source_location_id,
                        "location_to": dest_location_id,
                        "quantity": quantity,
                        "quantity_change": quantity,
                        "balance_after": product["current_stock"] if product else 0,
                        "organization_id": org_id,
                        "timestamp": datetime.utcnow(),
                        "created_by": movement["created_by"]
                    }
                    await self.db.stock_ledger.insert_one(ledger_entry_in)
                continue  # Skip the regular ledger entry below
            
            # Regular ledger entry for receipt/delivery
            ledger_entry = {
                "product_id": product_id,
                "product_name": line["product_name"],
                "product_sku": line["product_sku"],
                "movement_type": movement["type"],
                "reference": movement["reference"],
                "location_id": location_id,
                "location_from": movement.get("source_location_id"),
                "location_to": movement.get("destination_location_id"),
                "quantity": quantity,
                "quantity_change": quantity_change,
                "balance_after": product["current_stock"] if product else 0,
                "organization_id": org_id,
                "timestamp": datetime.utcnow(),
                "created_by": movement["created_by"]
            }
            await self.db.stock_ledger.insert_one(ledger_entry)
        
        # Mark movement as done
        await self.db.stock_movements.update_one(
            {"_id": ObjectId(movement_id), "organization_id": org_id},
            {
                "$set": {
                    "status": "done",
                    "executed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await self.get_movement_by_id(movement_id, user_email)
    
    async def adjust_inventory(self, adjustment: InventoryAdjustment, user_email: str) -> dict:
        """Perform inventory adjustment"""
        if not ObjectId.is_valid(adjustment.product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        org_id = await self._get_user_org_id(user_email)
        
        product = await self.db.products.find_one({
            "_id": ObjectId(adjustment.product_id),
            "organization_id": org_id
        })
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
        # Get current stock at the specific location from ledger
        pipeline = [
            {"$match": {
                "product_id": adjustment.product_id,
                "location_id": adjustment.location_id,
                "organization_id": org_id
            }},
            {"$group": {
                "_id": None,
                "location_stock": {"$sum": "$quantity_change"}
            }}
        ]
        
        location_stock_result = await self.db.stock_ledger.aggregate(pipeline).to_list(length=1)
        current_location_stock = location_stock_result[0]["location_stock"] if location_stock_result else 0
        
        # Calculate difference at this location
        difference = adjustment.counted_quantity - current_location_stock
        
        # Update product total stock by the difference
        await self.db.products.update_one(
            {"_id": ObjectId(adjustment.product_id)},
            {"$inc": {"current_stock": difference}}
        )
        
        # Get new total stock
        updated_product = await self.db.products.find_one({"_id": ObjectId(adjustment.product_id)})
        new_total_stock = updated_product.get("current_stock", 0)
        
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
                "quantity": abs(difference),
                "unit_of_measure": product["unit_of_measure"]
            }],
            "organization_id": org_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_email,
            "executed_at": datetime.utcnow()
        }
        
        await self.db.stock_movements.insert_one(movement_dict)
        
        # Create ledger entry with location tracking
        ledger_entry = {
            "product_id": adjustment.product_id,
            "product_name": product["name"],
            "product_sku": product["sku"],
            "movement_type": "adjustment",
            "reference": movement_dict["reference"],
            "location_id": adjustment.location_id,
            "location_from": adjustment.location_id,
            "location_to": adjustment.location_id,
            "quantity": abs(difference),
            "quantity_change": difference,
            "balance_after": new_total_stock,
            "organization_id": org_id,
            "timestamp": datetime.utcnow(),
            "created_by": user_email
        }
        await self.db.stock_ledger.insert_one(ledger_entry)
        
        return {
            "message": "Inventory adjusted successfully",
            "location_previous_stock": current_location_stock,
            "location_new_stock": adjustment.counted_quantity,
            "difference": difference,
            "total_stock": new_total_stock
        }
    
    async def get_stock_ledger(
        self,
        user_email: str,
        skip: int = 0,
        limit: int = 100,
        product_id: Optional[str] = None,
        movement_type: Optional[str] = None
    ) -> List[StockLedgerEntry]:
        """Get stock ledger entries"""
        org_id = await self._get_user_org_id(user_email)
        
        query = {"organization_id": org_id}
        if product_id:
            query["product_id"] = product_id
        if movement_type:
            query["movement_type"] = movement_type
        
        cursor = self.db.stock_ledger.find(query).skip(skip).limit(limit).sort("timestamp", -1)
        entries = await cursor.to_list(length=limit)
        
        # Use async comprehension to handle product lookups
        results = []
        for entry in entries:
            result = await self._ledger_to_response(entry)
            results.append(result)
        return results
    
    def _to_response(self, movement: dict) -> StockMovementResponse:
        """Convert database document to response model"""
        return StockMovementResponse(
            id=str(movement["_id"]),
            type=movement["type"],
            status=movement["status"],
            reference=movement["reference"],
            partner_name=movement.get("partner_name"),
            source_location_id=movement.get("source_location_id"),
            destination_location_id=movement.get("destination_location_id"),
            lines=movement["lines"],
            scheduled_date=movement.get("scheduled_date"),
            notes=movement.get("notes"),
            created_at=movement["created_at"],
            executed_at=movement.get("executed_at"),
            created_by=movement["created_by"]
        )
    
    async def _ledger_to_response(self, entry: dict) -> StockLedgerEntry:
        """Convert ledger entry to response"""
        # Handle legacy entries without product_name/sku
        product_name = entry.get("product_name")
        product_sku = entry.get("product_sku")
        
        if not product_name or not product_sku:
            # Fetch product details
            product = await self.db.products.find_one({"_id": ObjectId(entry["product_id"])})
            if product:
                product_name = product.get("name", "Unknown")
                product_sku = product.get("sku", "N/A")
            else:
                product_name = "Unknown Product"
                product_sku = "N/A"
        
        return StockLedgerEntry(
            id=str(entry["_id"]),
            product_id=entry["product_id"],
            product_name=product_name,
            product_sku=product_sku,
            movement_type=entry["movement_type"],
            reference=entry["reference"],
            location_from=entry.get("location_from"),
            location_to=entry.get("location_to"),
            quantity=entry.get("quantity", entry.get("quantity_change", 0)),
            balance_after=entry.get("balance_after", 0),
            timestamp=entry.get("timestamp", entry.get("created_at", datetime.utcnow())),
            created_by=entry.get("created_by", "system")
        )

stock_movement_service = StockMovementService()
