from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class MovementType(str, Enum):
    RECEIPT = "receipt"
    DELIVERY = "delivery"
    INTERNAL = "internal"
    ADJUSTMENT = "adjustment"

class MovementStatus(str, Enum):
    DRAFT = "draft"
    WAITING = "waiting"
    READY = "ready"
    DONE = "done"
    CANCELED = "canceled"

class StockMovementLine(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    quantity: int
    unit_of_measure: str

class StockMovementBase(BaseModel):
    type: MovementType
    status: MovementStatus = MovementStatus.DRAFT
    reference: str
    partner_name: Optional[str] = None
    source_location_id: Optional[str] = None
    destination_location_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    lines: List[StockMovementLine]

class StockMovementUpdate(BaseModel):
    status: Optional[MovementStatus] = None
    notes: Optional[str] = None
    scheduled_date: Optional[datetime] = None

class StockMovementInDB(StockMovementBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    lines: List[StockMovementLine]
    organization_id: str  # Multi-tenant support
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    executed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class StockMovementResponse(BaseModel):
    id: str
    type: str
    status: str
    reference: str
    partner_name: Optional[str] = None
    source_location_id: Optional[str] = None
    destination_location_id: Optional[str] = None
    lines: List[StockMovementLine]
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    executed_at: Optional[datetime] = None
    created_by: str

class InventoryAdjustment(BaseModel):
    product_id: str
    location_id: Optional[str] = None
    location: Optional[str] = None
    counted_quantity: int
    notes: Optional[str] = None

class StockLedgerEntry(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_sku: str
    movement_type: str
    reference: str
    location_from: Optional[str] = None
    location_to: Optional[str] = None
    quantity: int
    balance_after: int
    timestamp: datetime
    created_by: str
