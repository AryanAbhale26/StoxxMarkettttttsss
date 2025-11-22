import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  warehouse_id: string;
  type: string;
  location_type: string;
  created_at: string;
}

export interface WarehouseCreate {
  name: string;
  code: string;
  address?: string;
  is_active?: boolean;
}

export interface LocationCreate {
  name: string;
  code: string;
  warehouse_id: string;
  type: string;
  location_type?: string;
}

export const warehouseService = {
  getAll: async (activeOnly: boolean = false): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('active_only', 'true');
    const response = await apiClient.get(`${API_ENDPOINTS.warehouses.list}?${params}`);
    return response.data;
  },

  getAllWarehouses: async (activeOnly: boolean = false): Promise<Warehouse[]> => {
    return warehouseService.getAll(activeOnly);
  },

  create: async (data: WarehouseCreate): Promise<Warehouse> => {
    const response = await apiClient.post(API_ENDPOINTS.warehouses.create, data);
    return response.data;
  },

  createWarehouse: async (data: WarehouseCreate): Promise<Warehouse> => {
    return warehouseService.create(data);
  },

  getAllLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get(API_ENDPOINTS.warehouses.allLocations);
    return response.data;
  },

  createLocation: async (data: LocationCreate): Promise<Location> => {
    const response = await apiClient.post(API_ENDPOINTS.warehouses.locations, data);
    return response.data;
  },
};
