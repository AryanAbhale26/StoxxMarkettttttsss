import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface StockMovementLine {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_of_measure: string;
}

export interface StockMovement {
  id: string;
  type: 'receipt' | 'delivery' | 'internal' | 'adjustment';
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  reference: string;
  date: string;
  partner_name?: string;
  source_location_id?: string;
  source_location_name?: string;
  destination_location_id?: string;
  dest_location_name?: string;
  lines: StockMovementLine[];
  scheduled_date?: string;
  notes?: string;
  created_at: string;
  executed_at?: string;
  created_by: string;
}

export interface StockMovementCreate {
  type: 'receipt' | 'delivery' | 'internal';
  status?: 'draft' | 'waiting' | 'ready';
  reference: string;
  partner_name?: string;
  source_location_id?: string;
  destination_location_id?: string;
  lines: StockMovementLine[];
  scheduled_date?: string;
  notes?: string;
}

export interface StockMovementUpdate {
  status?: 'draft' | 'waiting' | 'ready' | 'canceled';
  scheduled_date?: string;
  notes?: string;
}

export interface InventoryAdjustment {
  product_id: string;
  location_id?: string;
  location?: string;
  counted_quantity: number;
  notes?: string;
}

export interface StockLedgerEntry {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  movement_type: string;
  reference: string;
  date: string;
  location?: string;
  location_from?: string;
  location_to?: string;
  quantity: number;
  quantity_change: number;
  balance_after: number;
  timestamp: string;
  created_by: string;
}

export const stockMovementService = {
  getAll: async (params?: any): Promise<StockMovement[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params?.status) queryParams.append('status', params.status);
    const response = await apiClient.get(`${API_ENDPOINTS.stockMovements.list}?${queryParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<StockMovement> => {
    const response = await apiClient.get(API_ENDPOINTS.stockMovements.get(id));
    return response.data;
  },

  create: async (data: StockMovementCreate): Promise<StockMovement> => {
    const response = await apiClient.post(API_ENDPOINTS.stockMovements.create, data);
    return response.data;
  },

  update: async (id: string, data: StockMovementUpdate): Promise<StockMovement> => {
    const response = await apiClient.put(API_ENDPOINTS.stockMovements.get(id), data);
    return response.data;
  },

  execute: async (id: string): Promise<StockMovement> => {
    const response = await apiClient.post(API_ENDPOINTS.stockMovements.execute(id));
    return response.data;
  },

  adjust: async (data: InventoryAdjustment): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.stockMovements.adjust, data);
    return response.data;
  },

  getLedger: async (params?: any): Promise<StockLedgerEntry[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.product_sku) queryParams.append('product_sku', params.product_sku);
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const response = await apiClient.get(`${API_ENDPOINTS.stockMovements.ledger}?${queryParams}`);
    return response.data;
  },
};
