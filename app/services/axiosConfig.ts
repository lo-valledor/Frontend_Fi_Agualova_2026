import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// Crear una instancia separada para refresh token para evitar interceptor circular
const refreshAxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor de request para agregar el token automáticamente
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si no hay respuesta del servidor, es un error de red o timeout
    if (!error.response) {
      toast.error('Error de red. Por favor, verifica tu conexión.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Manejo de errores específicos por código de estado
    switch (status) {
      case 400: {
        const errorMessage400 =
          data?.message ||
          (typeof data === 'string'
            ? data
            : 'Error en la solicitud. Verifica los datos.');
        toast.error(errorMessage400);
        break;
      }

      case 403:
        toast.error('No tienes permiso para realizar esta acción.');
        break;

      case 401: {
        // Excluimos rutas donde un 401 es una respuesta esperada
        const routesWithExpected401 = [
          '/login',
          '/refresh-token',
          'validar-usuario-modificacion',
          'cambiar-contrasena',
        ];
        const isExpected401 = routesWithExpected401.some(route =>
          originalRequest.url?.includes(route)
        );

        if (isExpected401) {
          // Dejamos que el error sea manejado por la lógica del componente
          return Promise.reject(error);
        }

        // Si ya se intentó refrescar el token, no volver a intentarlo
        if (originalRequest._retry) {
          console.log('Refresh token falló, cerrando sesión');
          toast.error(
            'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
          );
          localStorage.removeItem('token');
          window.location.href = '/session-expired';
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          console.log('Intentando refresh token...');
          // Usar la instancia separada para evitar interceptor circular
          const response = await refreshAxiosInstance.post('/refresh-token');
          const newToken = response.data.token;

          if (newToken) {
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('Token refrescado exitosamente');
            return axiosInstance(originalRequest);
          } else {
            throw new Error('No se recibió token válido');
          }
        } catch (refreshError) {
          console.log('Error en refresh token:', refreshError);
          toast.error(
            'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
          );
          localStorage.removeItem('token');
          window.location.href = '/session-expired';
          return Promise.reject(refreshError);
        }
      }

      case 500:
        toast.error('Error del servidor. Por favor, intenta más tarde.');
        break;

      default:
        // Para otros errores, mostrar un mensaje genérico
        toast.error(data?.message || 'Ha ocurrido un error inesperado.');
        break;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
