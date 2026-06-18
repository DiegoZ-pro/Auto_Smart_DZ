// Rutas de órdenes de trabajo

const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/kanban', isAdminOrMechanic, ordenesController.getOrdenesKanban);
router.get('/estadisticas', isAdminOrMechanic, ordenesController.getEstadisticas);
router.get('/', ordenesController.getAllOrdenes);
router.get('/:id', ordenesController.getOrdenById);
router.post('/', isAdminOrMechanic, ordenesController.createOrden);
router.put('/:id', isAdminOrMechanic, ordenesController.updateOrden);
router.put('/:id/estado', isAdminOrMechanic, ordenesController.cambiarEstado);
router.put('/:id/asignar-mecanico', isAdminOrMechanic, ordenesController.asignarMecanico);
router.get('/:id/historial', ordenesController.getHistorialEstados);

module.exports = router;