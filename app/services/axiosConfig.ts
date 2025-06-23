import axios from "axios";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    console.log(`🔑 REQUEST [${config.method?.toUpperCase()}] ${config.url}:`);
    console.log('  Token disponible:', token ? 'SÍ' : 'NO');
    console.log('  Token preview:', token ? `${token.substring(0, 30)}...` : 'N/A');
    
    if (token) {
      // Estrategia principal: Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      
      // Estrategia de respaldo para Edge: múltiples métodos
      if (navigator.userAgent.includes('Edg')) {
        console.log('  🔧 Edge detectado - aplicando estrategias de respaldo');
        
        // Método 1: Header personalizado adicional
        config.headers['X-Auth-Token'] = token;
        
        // Método 2: En el query parameter como respaldo
        const url = new URL(config.url!, config.baseURL);
        url.searchParams.set('token', token);
        config.url = url.pathname + url.search;
        
        // Método 3: Forzar headers explícitamente
        config.headers.set('Authorization', `Bearer ${token}`);
        config.headers.set('Content-Type', 'application/json');
      }
      
      console.log('  Authorization header agregado:', `Bearer ${token.substring(0, 30)}...`);
    } else {
      console.warn('  ⚠️ NO HAY TOKEN - La petición fallará');
    }
    
    console.log('  Headers finales:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de token expirado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Unauthorized) y no es una petición de refresh token o login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token") &&
      !originalRequest.url.includes("login")
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
