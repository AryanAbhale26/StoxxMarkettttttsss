import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface LocationStock {
  location_id: string;
  location_name: string;
  quantity: number;
}

export interface ProductLocationStock {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_stock: number;
  locations: LocationStock[];
}

export interface ProductInLocation {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
}

export interface LocationStockSummary {
  location_id: string;
  location_name: string;
  warehouse_id: string;
  warehouse_name: string;
  products: ProductInLocation[];
  total_products: number;
}

export const locationStockService = {
  getProductLocationStock: async (productId: string): Promise<ProductLocationStock> => {
    const response = await apiClient.get(API_ENDPOINTS.locationStock.productStock(productId));
    return response.data;
  },

  getAllProductsLocationStock: async (): Promise<ProductLocationStock[]> => {
    const response = await apiClient.get(API_ENDPOINTS.locationStock.allProducts);
    return response.data;
  },

  getLocationStockSummary: async (locationId: string): Promise<LocationStockSummary> => {
    const response = await apiClient.get(API_ENDPOINTS.locationStock.locationSummary(locationId));
    return response.data;
  },

  getAllLocationsStockSummary: async (): Promise<LocationStockSummary[]> => {
    const response = await apiClient.get(API_ENDPOINTS.locationStock.allLocations);
    return response.data;
  },
};
