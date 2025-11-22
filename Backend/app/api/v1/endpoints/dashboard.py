from fastapi import APIRouter, Depends
from app.services.dashboard_service import dashboard_service, DashboardKPIs
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/kpis", response_model=DashboardKPIs)
async def get_dashboard_kpis(current_user: dict = Depends(get_current_user)):
    """Get dashboard KPIs"""
    kpis = await dashboard_service.get_dashboard_kpis()
    return kpis
