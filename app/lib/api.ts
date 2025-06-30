import { type AxiosRequestConfig } from 'axios';
import axiosInstance from '../services/axiosConfig';
import { useLoadingBar } from '~/context/LoadingBarContext';

// Generic API response type
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// API endpoints con manejo flexible de respuestas
const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { usuario: string; contrasena: string }) =>
      axiosInstance.post<ApiResponse<{ token: string }> | { token: string }>(
        '/login',
        credentials,
      ),
    logout: () => axiosInstance.post<ApiResponse<void> | void>('/logout'),
    refreshToken: () =>
      axiosInstance.post<ApiResponse<{ token: string }> | { token: string }>(
        '/refresh-token',
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

export function useApiWithLoadingBar() {
  const loadingBarRef = useLoadingBar();

  const requestWithBar = async (method: string, ...args: any[]) => {
    if (loadingBarRef?.current) {
      loadingBarRef.current.current?.continuousStart();
    }
    try {
      const result = await (api as any)[method](...args);
      return result;
    } finally {
      if (loadingBarRef?.current) {
        loadingBarRef.current.complete();
      }
    }
  };

  return {
    get: (...args: any[]) => requestWithBar('get', ...args),
    post: (...args: any[]) => requestWithBar('post', ...args),
    put: (...args: any[]) => requestWithBar('put', ...args),
    delete: (...args: any[]) => requestWithBar('delete', ...args) as any,
  };
}

export default api;
