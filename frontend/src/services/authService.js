// Funciones de autenticación que llaman a la API

import api from './api';

// Envía las credenciales y devuelve el usuario con sus tokens
const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  return response.data;
};

// Registra un nuevo cliente
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);

  return response.data;
};

// Cierra sesión en el backend y limpia el localStorage
const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    localStorage.removeItem('autosmart_access_token');
    localStorage.removeItem('autosmart_refresh_token');
    localStorage.removeItem('autosmart_user');
  }
};

// Trae los datos del usuario a partir del token
const getMe = async () => {
  const response = await api.get('/auth/me');

  return response.data;
};

// Cambia la contraseña verificando la actual
const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    oldPassword,
    newPassword
  });

  return response.data;
};

// Actualiza nombre y teléfono del perfil propio
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