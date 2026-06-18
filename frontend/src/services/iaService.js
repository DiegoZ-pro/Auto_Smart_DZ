// SERVICIO DE IA - Detección de daños en piezas automotrices, en este primer modulo solo detecta Disco de Freno, pero se puede extender a otras piezas fácilmente

import config from '../config/config';

const IA_URL = import.meta.env.VITE_IA_URL || 'http://localhost:8000';

// Equivalente a api.js pero apuntando al microservicio de IA
const fetchIA = async (endpoint, options = {}) => {
  const token = localStorage.getItem(config.storageKeys.accessToken);

  const response = await fetch(`${IA_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Si el token expiró, limpia el storage y redirige al login igual que api.js
  if (response.status === 401) {
    localStorage.removeItem(config.storageKeys.accessToken);
    localStorage.removeItem(config.storageKeys.refreshToken);
    localStorage.removeItem(config.storageKeys.user);
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Error en el servicio de IA');
  }

  return data;
};

const iaService = {
  // Verifica que el microservicio de IA esté respondiendo
  verificarConexion: async () => {
    try {
      const resp = await fetch(`${IA_URL}/health`, { method: 'GET' });
      return resp.ok;
    } catch {
      return false;
    }
  },

  // Envía una imagen al modelo y devuelve el resultado del análisis
  analizarPieza: async (archivo) => {
    const form = new FormData();
    form.append('imagen', archivo);

    return fetchIA('/predecir', {
      method: 'POST',
      body: form,
    });
  },
};

export default iaService;