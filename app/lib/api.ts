import { type AxiosRequestConfig } from "axios";
import axiosInstance from "../services/axiosConfig";

// Generic API response type
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// API endpoints con manejo flexible de respuestas
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { usuario: string; contrasena: string }) =>
      axiosInstance.post<ApiResponse<{ token: string }> | { token: string }>(
        "/login",
        credentials
      ),
    logout: () => axiosInstance.post<ApiResponse<void> | void>("/logout"),
    refreshToken: () =>
      axiosInstance.post<ApiResponse<{ token: string }> | { token: string }>(
        "/refresh-token"
      ),
  },

  // Generic CRUD operations con tipos flexibles
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T | ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T | ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T | ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T | ApiResponse<T>>(url, config),
};

export default api;
