// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================

import api from './api';

/**
 * Login de usuario
 */
const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  return response.data;
};

/**
 * Registro de nuevo usuario (cliente)
 */
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);

  return response.data;
};

/**
 * Cerrar sesión
 */
const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar localStorage
    localStorage.removeItem('autosmart_access_token');
    localStorage.removeItem('autosmart_refresh_token');
    localStorage.removeItem('autosmart_user');
  }
};

/**
 * Obtener información del usuario autenticado
 */
const getMe = async () => {
  const response = await api.get('/auth/me');

  return response.data;
};

/**
 * Cambiar contraseña
 */
const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    oldPassword,
    newPassword
  });

  return response.data;
};

/**
 * Actualizar perfil propio (nombre y teléfono)
 */
const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const authService = {
  login,
  register,
  logout,
  getMe,
  changePassword,
  updateProfile
};