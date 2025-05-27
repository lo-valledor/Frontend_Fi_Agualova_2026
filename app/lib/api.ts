import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { authService } from "../services/authService";

// Usar una URL por defecto si la variable de entorno no está disponible
const API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.1.139:8081/Enerlova";

console.log("API URL configurada:", API_URL); // Agregar log para depuración

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  timeout: 15000, // 15 segundos de timeout
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log para depuración
    console.log(`Enviando solicitud a: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("Error en la solicitud API:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Si response.data es un objeto y tiene una propiedad "data", extráela
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      // Preservamos la estructura original para que sea compatible con el tipado
      return response;
    }

    // Si no tiene la estructura esperada, la mantenemos como está
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Manejar error 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const newToken = await authService.refreshToken();
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error al refrescar token:", refreshError);
        // Si refresh falla, logout user
        await authService.logout();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // Mejorar el mensaje de error para debugging
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error desconocido en la API";
    error.message = errorMessage;
    console.error(
      `Error API (${error.response?.status || "sin status"}):`,
      errorMessage
    );

    return Promise.reject(error);
  }
);

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
