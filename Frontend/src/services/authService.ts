import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  signup: async (data: SignupData): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.signup, data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.verifyOtp, { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
      email,
      otp,
      new_password,
    });
    return response.data;
  },
};
