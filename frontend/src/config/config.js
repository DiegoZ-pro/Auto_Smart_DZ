// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================================

const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'AutoSmart',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Features
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',

  // Local Storage Keys
  storageKeys: {
    accessToken: 'autosmart_access_token',
    refreshToken: 'autosmart_refresh_token',
    user: 'autosmart_user'
  },

  // Roles
  roles: {
    ADMIN: 'admin',
    MECANICO: 'mecanico',
    CLIENTE: 'cliente'
  }
};

export default config;