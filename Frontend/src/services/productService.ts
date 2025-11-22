import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  description?: string;
  current_stock: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
  is_low_stock: boolean;
}

export interface ProductCreate {
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  description?: string;
  reorder_level: number;
  initial_stock?: number;
  warehouse_id?: string;
  location_id?: string;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  category?: string;
  unit_of_measure?: string;
  description?: string;
  reorder_level?: number;
}

export const productService = {
  getAll: async (skip: number = 0, limit: number = 100, category?: string): Promise<Product[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    const response = await apiClient.get(`${API_ENDPOINTS.products.list}?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(API_ENDPOINTS.products.get(id));
    return response.data;
  },

  create: async (data: ProductCreate): Promise<Product> => {
    const response = await apiClient.post(API_ENDPOINTS.products.create, data);
    return response.data;
  },

  update: async (id: string, data: ProductUpdate): Promise<Product> => {
    const response = await apiClient.put(API_ENDPOINTS.products.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.products.delete(id));
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get(`${API_ENDPOINTS.products.search}?q=${query}`);
    return response.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get(API_ENDPOINTS.products.lowStock);
    return response.data;
  },
};
