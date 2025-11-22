from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from app.models.organization import (
    OrganizationCreate,
    OrganizationResponse,
    AddMemberRequest,
    UpdateMemberRoleRequest
)
from app.services.organization_service import organization_service
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new organization (one per user)"""
    try:
        result = await organization_service.create_organization(
            org_data,
            str(current_user["_id"]),
            current_user["email"],
            current_user["full_name"]
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/my-organization", response_model=Optional[OrganizationResponse])
async def get_my_organization(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's organization (owned or member)"""
    try:
        result = await organization_service.get_user_organization(str(current_user["_id"]))
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/{org_id}/members", response_model=OrganizationResponse)
async def add_member(
    org_id: str,
    member_request: AddMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add a collaborator to the organization"""
    try:
        result = await organization_service.add_member(
            org_id,
            member_request,
            str(current_user["_id"])
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/{org_id}/members/{member_user_id}", response_model=OrganizationResponse)
async def remove_member(
    org_id: str,
    member_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a member from organization"""
    try:
        result = await organization_service.remove_member(
            org_id,
            member_user_id,
            str(current_user["_id"])
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.patch("/{org_id}/members/{member_user_id}/role", response_model=OrganizationResponse)
async def update_member_role(
    org_id: str,
    member_user_id: str,
    role_update: UpdateMemberRoleRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a member's role"""
    try:
        result = await organization_service.update_member_role(
            org_id,
            member_user_id,
            role_update.role,
            str(current_user["_id"])
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
