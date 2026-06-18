// Servidor principal de AutoSmart

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Cabeceras de seguridad HTTP
app.use(helmet());

// Configuración de CORS para permitir el frontend desde localhost e IP local
const cors = require('cors');

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.100.13:5173',
      'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200
}));

// Body parser siempre después de CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Límite de tamaño del body para no saturar el servidor
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Comprime las respuestas para que pesen menos
app.use(compression());

// Logs de requests en consola
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Limita las peticiones por IP para evitar abuso
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplica el rate limiting solo a la API
app.use('/api', limiter);

// Sirve los archivos subidos directamente desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Ruta de info básica en la raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AutoSmart Backend API',
    version: '2.0.0',
    documentation: '/api',
    health: '/api/health'
  });
});

// Todas las rutas de la API
app.use('/api', routes);

// Ruta no encontrada
app.use(notFound);

// Manejador global de errores (siempre va al final)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Primero verifica que la base de datos esté disponible
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos');
      console.error('Verifica las credenciales en el archivo .env');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('AutoSmart Backend - Sistema de Gestión de Talleres');
      console.log('='.repeat(60));
      console.log(`Servidor corriendo en puerto: ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Base de datos: ${process.env.DB_NAME}`);
      console.log(`API disponible en: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Si hay una promesa rechazada sin catch, se cierra el servidor limpiamente
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
  console.error('Cerrando servidor...');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  console.error('Cerrando servidor...');
  process.exit(1);
});

startServer();

module.exports = app;