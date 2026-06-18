// Configuración global de la app — lee variables de entorno con fallbacks

const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  appName: import.meta.env.VITE_APP_NAME || 'AutoSmart',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
  storageKeys: {
    accessToken: 'autosmart_access_token',
    refreshToken: 'autosmart_refresh_token',
    user: 'autosmart_user'
  },

  roles: {
    ADMIN: 'admin',
    MECANICO: 'mecanico',
    CLIENTE: 'cliente'
  }
};

export default config;