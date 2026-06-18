// Rutas de cotizaciones

const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', cotizacionesController.getAllCotizaciones);
router.get('/numero/:numero', cotizacionesController.getCotizacionByNumero);
router.get('/orden/:ordenId', cotizacionesController.getCotizacionesByOrden);
router.get('/:id', cotizacionesController.getCotizacionById);
router.post('/', isAdminOrMechanic, cotizacionesController.createCotizacion);
router.put('/:id', isAdminOrMechanic, cotizacionesController.updateCotizacion);
router.post('/:id/enviar', isAdminOrMechanic, cotizacionesController.enviarCotizacion);
// aprobar y rechazar los puede hacer el cliente
router.post('/:id/aprobar', cotizacionesController.aprobarCotizacion);
router.post('/:id/rechazar', cotizacionesController.rechazarCotizacion);

module.exports = router;