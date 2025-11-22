from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models.location_stock import ProductLocationStock, LocationStockSummary
from app.services.location_stock_service import location_stock_service
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/products/{product_id}", response_model=ProductLocationStock)
async def get_product_location_stock(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get stock levels for a specific product across all locations"""
    try:
        result = await location_stock_service.get_product_location_stock(product_id, current_user["email"])
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/products", response_model=List[ProductLocationStock])
async def get_all_products_location_stock(
    current_user: dict = Depends(get_current_user)
):
    """Get stock levels for all products across all locations"""
    try:
        result = await location_stock_service.get_all_products_location_stock(current_user["email"])
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/locations/{location_id}", response_model=LocationStockSummary)
async def get_location_stock_summary(
    location_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all products and their quantities in a specific location"""
    try:
        result = await location_stock_service.get_location_stock_summary(location_id, current_user["email"])
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/locations", response_model=List[LocationStockSummary])
async def get_all_locations_stock_summary(
    current_user: dict = Depends(get_current_user)
):
    """Get stock summary for all locations"""
    try:
        result = await location_stock_service.get_all_locations_stock_summary(current_user["email"])
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
