import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface DashboardKPIs {
  total_products: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_stock_value: number;
  pending_receipts: number;
  pending_deliveries: number;
  internal_transfers: number;
}

export const dashboardService = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await apiClient.get(API_ENDPOINTS.dashboard.kpis);
    return response.data;
  },
};
