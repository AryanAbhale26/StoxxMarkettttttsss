from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.warehouse import (
    WarehouseCreate,
    WarehouseResponse,
    LocationCreate,
    LocationResponse
)
from app.services.warehouse_service import warehouse_service
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new warehouse"""
    try:
        warehouse = await warehouse_service.create_warehouse(warehouse_data)
        return warehouse
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/", response_model=List[WarehouseResponse])
async def get_warehouses(
    active_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get all warehouses"""
    try:
        warehouses = await warehouse_service.get_all_warehouses(active_only)
        return warehouses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get warehouse by ID"""
    warehouse = await warehouse_service.get_warehouse_by_id(warehouse_id)
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )
    return warehouse

@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location_data: LocationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new location"""
    try:
        location = await warehouse_service.create_location(location_data)
        return location
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/locations/all", response_model=List[LocationResponse])
async def get_all_locations(current_user: dict = Depends(get_current_user)):
    """Get all locations"""
    try:
        locations = await warehouse_service.get_all_locations()
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{warehouse_id}/locations", response_model=List[LocationResponse])
async def get_warehouse_locations(
    warehouse_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all locations for a warehouse"""
    try:
        locations = await warehouse_service.get_locations_by_warehouse(warehouse_id)
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
