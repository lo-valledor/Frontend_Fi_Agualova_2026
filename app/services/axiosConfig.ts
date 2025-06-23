import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de token expirado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Unauthorized) y no es una petición de refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Obtener el token actual para enviarlo en la petición de refresh
        const currentToken = sessionStorage.getItem("token");

        if (!currentToken) {
          throw new Error("No hay token disponible");
        }

        // Intentar refrescar el token
        const newToken = await authService.refreshToken();
        sessionStorage.setItem("token", newToken);

        // Actualizar el token en la petición original y reintentarla
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si no se puede refrescar el token, redirigir a la página de sesión expirada
        sessionStorage.removeItem("token");
        window.location.href = "/session-expired";
        return Promise.reject(refreshError);
      }
    }

    // Si el error es 400 y contiene mensaje sobre logout o sesión cerrada
    if (
      error.response?.status === 400 &&
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("cerrado sesión")
    ) {
      sessionStorage.removeItem("token");
      window.location.href = "/session-expired";
      return Promise.reject(
        new Error(
          "La sesión ha sido cerrada. Por favor, inicie sesión nuevamente."
        )
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
