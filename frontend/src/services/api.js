// ============================================================================
// CONFIGURACIÓN DE AXIOS - API CLIENT
// ============================================================================

import axios from 'axios';
import config from '../config/config';

// Crear instancia de Axios
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Request - Agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autosmart_access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejar errores y refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    // Excluir endpoints de autenticación para no interferir con login/register
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('autosmart_refresh_token');

        if (!refreshToken) {
          localStorage.removeItem('autosmart_access_token');
          localStorage.removeItem('autosmart_refresh_token');
          localStorage.removeItem('autosmart_user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;

        localStorage.setItem('autosmart_access_token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar y redirigir al login
        localStorage.removeItem('autosmart_access_token');
        localStorage.removeItem('autosmart_refresh_token');
        localStorage.removeItem('autosmart_user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Extraer el mensaje real del backend para errores no-401
    const message = error.response?.data?.message || error.message;
    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

export default api;