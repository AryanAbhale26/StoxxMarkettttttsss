from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

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

class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class WarehouseInDB(WarehouseBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    organization_id: str  # Multi-tenant support
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class WarehouseResponse(BaseModel):
    id: str
    name: str
    code: str
    address: Optional[str] = None
    is_active: bool
    created_at: datetime

class LocationBase(BaseModel):
    name: str
    warehouse_id: str
    type: str = "storage"  # storage, receiving, shipping

class LocationCreate(LocationBase):
    pass

class LocationInDB(LocationBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    organization_id: str  # Multi-tenant support
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class LocationResponse(BaseModel):
    id: str
    name: str
    warehouse_id: str
    type: str
    created_at: datetime
