// Instancia de Axios configurada para toda la app

import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adjunta el access token a cada request automáticamente
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

// Maneja errores de respuesta: renueva el token si está vencido
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Intenta renovar el token solo si el error es 401 y no es un endpoint de auth
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
        // Si el refresh también falla, redirige al login y limpia el storage
        localStorage.removeItem('autosmart_access_token');
        localStorage.removeItem('autosmart_refresh_token');
        localStorage.removeItem('autosmart_user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Extrae el mensaje de error del backend para que useAuth pueda mostrarlo
    const message = error.response?.data?.message || error.message;
    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

export default api;