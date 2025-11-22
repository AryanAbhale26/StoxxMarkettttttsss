from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from bson import ObjectId
from app.core.database import get_database
from app.models.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationMember,
    AddMemberRequest
)

class OrganizationService:
    @property
    def db(self):
        return get_database()
    
    async def create_organization(self, org_data: OrganizationCreate, owner_id: str, owner_email: str, owner_name: str) -> OrganizationResponse:
        """Create a new organization for a user"""
        # Check if user already has an organization
        existing_org = await self.db.organizations.find_one({"owner_id": owner_id})
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an organization. Each user can own only one organization."
            )
        
        # Create organization with owner as first member
        org_dict = {
            "name": org_data.name,
            "description": org_data.description,
            "owner_id": owner_id,
            "members": [{
                "user_id": owner_id,
                "user_email": owner_email,
                "user_name": owner_name,
                "role": "owner",
                "joined_at": datetime.utcnow()
            }],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.organizations.insert_one(org_dict)
        org_dict["_id"] = result.inserted_id
        
        return self._to_response(org_dict)
    
    async def get_user_organization(self, user_id: str) -> Optional[OrganizationResponse]:
        """Get organization where user is owner or member"""
        # Check if user owns an organization
        org = await self.db.organizations.find_one({"owner_id": user_id})
        
        # If not owner, check if user is a member
        if not org:
            org = await self.db.organizations.find_one({"members.user_id": user_id})
        
        if not org:
            return None
        
        return self._to_response(org)
    
    async def add_member(self, org_id: str, member_request: AddMemberRequest, current_user_id: str) -> OrganizationResponse:
        """Add a collaborator to the organization"""
        if not ObjectId.is_valid(org_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        # Get organization
        org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        # Check if current user is owner or admin
        current_member = next((m for m in org["members"] if m["user_id"] == current_user_id), None)
        if not current_member or current_member["role"] not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and admins can add members"
            )
        
        # Check if user to add exists
        user_to_add = await self.db.users.find_one({"email": member_request.email})
        if not user_to_add:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email not found"
            )
        
        user_id = str(user_to_add["_id"])
        
        # Check if already a member
        if any(m["user_id"] == user_id for m in org["members"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member"
            )
        
        # Add member
        new_member = {
            "user_id": user_id,
            "user_email": user_to_add["email"],
            "user_name": user_to_add["full_name"],
            "role": member_request.role,
            "joined_at": datetime.utcnow()
        }
        
        await self.db.organizations.update_one(
            {"_id": ObjectId(org_id)},
            {
                "$push": {"members": new_member},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        updated_org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        return self._to_response(updated_org)
    
    async def remove_member(self, org_id: str, member_user_id: str, current_user_id: str) -> OrganizationResponse:
        """Remove a member from organization"""
        if not ObjectId.is_valid(org_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        # Can't remove owner
        if org["owner_id"] == member_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove organization owner"
            )
        
        # Check permissions
        current_member = next((m for m in org["members"] if m["user_id"] == current_user_id), None)
        if not current_member or current_member["role"] not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and admins can remove members"
            )
        
        # Remove member
        await self.db.organizations.update_one(
            {"_id": ObjectId(org_id)},
            {
                "$pull": {"members": {"user_id": member_user_id}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        updated_org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        return self._to_response(updated_org)
    
    async def update_member_role(self, org_id: str, member_user_id: str, new_role: str, current_user_id: str) -> OrganizationResponse:
        """Update a member's role"""
        if not ObjectId.is_valid(org_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
        # Only owner can change roles
        if org["owner_id"] != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can change member roles"
            )
        
        # Can't change owner's role
        if org["owner_id"] == member_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change owner's role"
            )
        
        # Update role
        await self.db.organizations.update_one(
            {"_id": ObjectId(org_id), "members.user_id": member_user_id},
            {
                "$set": {
                    "members.$.role": new_role,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        updated_org = await self.db.organizations.find_one({"_id": ObjectId(org_id)})
        return self._to_response(updated_org)
    
    def _to_response(self, org_dict: dict) -> OrganizationResponse:
        """Convert database document to response model"""
        members = [
            OrganizationMember(**member) for member in org_dict.get("members", [])
        ]
        
        return OrganizationResponse(
            id=str(org_dict["_id"]),
            name=org_dict["name"],
            description=org_dict.get("description"),
            owner_id=org_dict["owner_id"],
            members=members,
            created_at=org_dict["created_at"]
        )

organization_service = OrganizationService()
