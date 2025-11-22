from pydantic import BaseModel, Field
from typing import Optional, List
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

class OrganizationMember(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    role: str = "member"  # owner, admin, member
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationInDB(OrganizationBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str  # User who created the organization
    members: List[OrganizationMember] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OrganizationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    members: List[OrganizationMember]
    created_at: datetime

class AddMemberRequest(BaseModel):
    email: str
    role: str = "member"  # member, admin

class UpdateMemberRoleRequest(BaseModel):
    role: str  # member, admin
