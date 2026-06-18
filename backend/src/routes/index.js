// Enrutador principal que agrupa todas las rutas de la API

const express = require('express');
const router = express.Router();

// Rutas de cada módulo
const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const catalogosRoutes = require('./catalogos.routes');
const clientesRoutes = require('./clientes.routes');
const vehiculosRoutes = require('./vehiculos.routes');
const ordenesRoutes = require('./ordenes.routes');
const cotizacionesRoutes = require('./cotizaciones.routes');
const archivosRoutes = require('./archivos.routes');
const notificacionesRoutes = require('./notificaciones.routes');
const citasRoutes = require('./citas.routes');
const configuracionRoutes = require('./configuracion.routes');
const chatRoutes = require('./chat.routes');

// Endpoint de bienvenida con lista de rutas disponibles
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a AutoSmart API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      catalogos: '/api/catalogos',
      clientes: '/api/clientes',
      vehiculos: '/api/vehiculos',
      ordenes: '/api/ordenes',
      cotizaciones: '/api/cotizaciones',
      archivos: '/api/archivos',
      notificaciones: '/api/notificaciones',
      citas: '/api/citas',
      chat: '/api/chat'
    }
  });
});

// Health check para verificar que el servidor responde
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Registro de todas las rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/vehiculos', vehiculosRoutes);
router.use('/ordenes', ordenesRoutes);
router.use('/cotizaciones', cotizacionesRoutes);
router.use('/archivos', archivosRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/citas', citasRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/chat', chatRoutes);

module.exports = router;