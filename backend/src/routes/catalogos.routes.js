// Rutas de catálogos (todas requieren autenticación)

const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', catalogosController.getAllCatalogos);
router.get('/roles', catalogosController.getRoles);
router.get('/estados-usuario', catalogosController.getEstadosUsuario);
router.get('/tipos-combustible', catalogosController.getTiposCombustible);
router.get('/tipos-orden', catalogosController.getTiposOrden);
router.get('/estados-orden', catalogosController.getEstadosOrden);
router.get('/prioridades', catalogosController.getPrioridades);
router.get('/estados-cotizacion', catalogosController.getEstadosCotizacion);
router.get('/tipos-notificacion', catalogosController.getTiposNotificacion);
router.get('/estados-cita', catalogosController.getEstadosCita);

module.exports = router;