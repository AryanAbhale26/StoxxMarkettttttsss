const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/auth/signup`,
    login: `${API_BASE_URL}/auth/login`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  products: {
    list: `${API_BASE_URL}/products`,
    create: `${API_BASE_URL}/products`,
    update: (id: string) => `${API_BASE_URL}/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/products/${id}`,
    get: (id: string) => `${API_BASE_URL}/products/${id}`,
    search: `${API_BASE_URL}/products/search`,
    lowStock: `${API_BASE_URL}/products/low-stock`,
  },
  dashboard: {
    kpis: `${API_BASE_URL}/dashboard/kpis`,
  },
  stockMovements: {
    list: `${API_BASE_URL}/stock-movements`,
    create: `${API_BASE_URL}/stock-movements`,
    get: (id: string) => `${API_BASE_URL}/stock-movements/${id}`,
    update: (id: string) => `${API_BASE_URL}/stock-movements/${id}`,
    execute: (id: string) => `${API_BASE_URL}/stock-movements/${id}/execute`,
    adjust: `${API_BASE_URL}/stock-movements/adjust`,
    ledger: `${API_BASE_URL}/stock-movements/ledger/history`,
  },
  warehouses: {
    list: `${API_BASE_URL}/warehouses`,
    create: `${API_BASE_URL}/warehouses`,
    get: (id: string) => `${API_BASE_URL}/warehouses/${id}`,
    locations: `${API_BASE_URL}/warehouses/locations`,
    allLocations: `${API_BASE_URL}/warehouses/locations/all`,
    warehouseLocations: (id: string) => `${API_BASE_URL}/warehouses/${id}/locations`,
  },
};

export default API_BASE_URL;
