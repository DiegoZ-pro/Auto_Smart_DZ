// ============================================================================
// CONSTANTES GLOBALES
// ============================================================================

export const ROLES = {
  ADMIN: 'admin',
  MECANICO: 'mecanico',
  CLIENTE: 'cliente'
};

export const ESTADOS_ORDEN = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  EN_REVISION: 3,
  DIAGNOSTICADO: 4,
  ESPERANDO_REPUESTOS: 5,
  REPARANDO: 6,
  CALIBRACION: 7,
  COMPLETADO: 8,
  LISTO_ENTREGA: 9,
  ENTREGADO: 10,
  CANCELADO: 11
};

export const ESTADOS_COTIZACION = {
  BORRADOR: 1,
  ENVIADA: 2,
  APROBADA: 3,
  RECHAZADA: 4,
  VENCIDA: 5
};

export const TIPOS_ORDEN = {
  VEHICULO: 1,
  LABORATORIO: 2
};

export const PRIORIDADES = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  URGENTE: 4
};

export const ESTADOS_CITA = {
  PENDIENTE: 1,
  CONFIRMADA: 2,
  CANCELADA: 3,
  COMPLETADA: 4
};

export const RUTAS = {
  // Rutas públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  NOTICIAS: '/noticias',

  // Rutas de cliente
  AGENDAR_CITA: '/agendar-cita',
  MI_PERFIL: '/mi-perfil',
  MIS_VEHICULOS: '/mis-vehiculos',
  MIS_ORDENES: '/mis-ordenes',

  // Rutas de taller (Admin/Mecánico)
  DASHBOARD: '/dashboard',
  RECEPCION_VEHICULO: '/recepcion-vehiculo',
  RECEPCION_LABORATORIO: '/recepcion-laboratorio',
  ORDENES_TRABAJO: '/ordenes-trabajo',
  COTIZACIONES: '/cotizaciones',
  KANBAN: '/kanban',
  DIAGNOSTICO_IA: '/diagnostico-ia',
  ESCANEO_3D: '/escaneo-3d',
  GESTION_USUARIOS: '/gestion-usuarios',
  KPIS_TALLER: '/kpis-taller',
  CONFIGURACION: '/configuracion'
};

export const MENSAJES = {
  ERROR_GENERICO: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
  ERROR_RED: 'Error de conexión. Verifica tu internet.',
  SESION_EXPIRADA: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  LOGIN_EXITOSO: 'Inicio de sesión exitoso',
  REGISTRO_EXITOSO: 'Registro exitoso. Bienvenido a AutoSmart',
  DATOS_INVALIDOS: 'Por favor, verifica los datos ingresados'
};