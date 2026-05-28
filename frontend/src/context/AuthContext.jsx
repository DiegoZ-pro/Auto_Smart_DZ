// ============================================================================
// AUTH CONTEXT - Manejo de autenticación global
// ============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { MENSAJES } from '../utils/constants';

const AuthContext = createContext(null);

// Normaliza el objeto user del backend (snake_case) a camelCase consistente
const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    nombreCompleto: raw.nombre_completo ?? raw.nombreCompleto ?? '',
    telefono: raw.telefono ?? '',
    rol: raw.rol,
    avatarUrl: raw.avatar_url ?? raw.avatarUrl ?? null,
    ultimoAcceso: raw.ultimo_acceso ?? raw.ultimoAcceso ?? null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('autosmart_user');
        const token = localStorage.getItem('autosmart_access_token');

        if (storedUser && token) {
          setUser(normalizeUser(JSON.parse(storedUser)));
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load user from storage:', err.message);
        localStorage.removeItem('autosmart_user');
        localStorage.removeItem('autosmart_access_token');
        localStorage.removeItem('autosmart_refresh_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login(email, password);

      const { user: rawLoginUser, tokens } = response.data;
      const user = normalizeUser(rawLoginUser);

      // Guardar en localStorage
      localStorage.setItem('autosmart_access_token', tokens.accessToken);
      localStorage.setItem('autosmart_refresh_token', tokens.refreshToken);
      localStorage.setItem('autosmart_user', JSON.stringify(user));

      setUser(user);

      return { success: true, user };
    } catch (err) {
      console.error('[AuthContext] login error:', err.message, '| status:', err.status);

      let errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';

      if (err.response) {
        const status = err.response.status;
        const backendMessage = err.response.data?.message;

        if (status === 401) {
          errorMessage = 'Las credenciales son incorrectas. Verifica tu email y contraseña.';
        } else if (status === 403) {
          if (backendMessage?.toLowerCase().includes('bloqueado')) {
            errorMessage = 'Tu cuenta está bloqueada. Contacta al administrador.';
          } else if (backendMessage?.toLowerCase().includes('inactivo')) {
            errorMessage = 'Tu cuenta está inactiva. Contacta al administrador.';
          } else {
            errorMessage = backendMessage || 'Acceso denegado.';
          }
        } else if (status === 400) {
          errorMessage = backendMessage || 'Datos inválidos. Verifica la información.';
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(userData);

      const { user: rawRegUser, tokens } = response.data;
      const user = normalizeUser(rawRegUser);

      // Guardar en localStorage
      localStorage.setItem('autosmart_access_token', tokens.accessToken);
      localStorage.setItem('autosmart_refresh_token', tokens.refreshToken);
      localStorage.setItem('autosmart_user', JSON.stringify(user));

      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('[AuthContext] register error:', err.message, '| status:', err.status);

      let errorMessage = 'Error al registrarse. Por favor, intenta nuevamente.';

      if (err.response) {
        const status = err.response.status;
        const backendMessage = err.response.data?.message;

        if (status === 409) {
          errorMessage = 'Este correo electrónico ya está registrado. Usa otro email o inicia sesión.';
        } else if (status === 400) {
          if (backendMessage?.toLowerCase().includes('email')) {
            errorMessage = 'El formato del email es inválido.';
          } else if (backendMessage?.toLowerCase().includes('contraseña') || backendMessage?.toLowerCase().includes('password')) {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          } else if (backendMessage?.toLowerCase().includes('teléfono') || backendMessage?.toLowerCase().includes('telefono')) {
            errorMessage = 'El formato del teléfono es inválido.';
          } else {
            errorMessage = backendMessage || 'Datos inválidos. Verifica la información.';
          }
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('[AuthContext] logout API call failed:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('autosmart_access_token');
      localStorage.removeItem('autosmart_refresh_token');
      localStorage.removeItem('autosmart_user');
    }
  };

  // Actualizar usuario (normaliza siempre snake_case → camelCase)
  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    localStorage.setItem('autosmart_user', JSON.stringify(normalized));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isMecanico: user?.rol === 'mecanico',
    isCliente: user?.rol === 'cliente'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
};