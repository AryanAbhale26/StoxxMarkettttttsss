from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models.stock_movement import (
    StockMovementCreate,
    StockMovementUpdate,
    StockMovementResponse,
    InventoryAdjustment,
    StockLedgerEntry
)
from app.services.stock_movement_service import stock_movement_service
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
async def create_movement(
    movement_data: StockMovementCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new stock movement (receipt, delivery, or internal transfer)"""
    try:
        movement = await stock_movement_service.create_movement(movement_data, current_user["email"])
        return movement
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/", response_model=List[StockMovementResponse])
async def get_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    movement_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all stock movements with optional filtering"""
    try:
        movements = await stock_movement_service.get_all_movements(
            current_user["email"], skip, limit, movement_type, status
        )
        return movements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{movement_id}", response_model=StockMovementResponse)
async def get_movement(
    movement_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get movement by ID"""
    movement = await stock_movement_service.get_movement_by_id(movement_id, current_user["email"])
    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movement not found"
        )
    return movement

@router.put("/{movement_id}", response_model=StockMovementResponse)
async def update_movement(
    movement_id: str,
    movement_data: StockMovementUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a movement"""
    movement = await stock_movement_service.update_movement(
        movement_id, movement_data, current_user["email"]
    )
    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movement not found"
        )
    return movement

@router.post("/{movement_id}/execute", response_model=StockMovementResponse)
async def execute_movement(
    movement_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Execute a movement (mark as done and update stock levels)"""
    try:
        movement = await stock_movement_service.execute_movement(movement_id, current_user["email"])
        return movement
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/adjust", status_code=status.HTTP_200_OK)
async def adjust_inventory(
    adjustment: InventoryAdjustment,
    current_user: dict = Depends(get_current_user)
):
    """Perform inventory adjustment"""
    try:
        result = await stock_movement_service.adjust_inventory(adjustment, current_user["email"])
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/ledger/history", response_model=List[StockLedgerEntry])
async def get_stock_ledger(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    product_id: Optional[str] = None,
    movement_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get stock ledger history"""
    try:
        entries = await stock_movement_service.get_stock_ledger(
            current_user["email"], skip, limit, product_id, movement_type
        )
        return entries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
