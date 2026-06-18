// Rutas de clientes

const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { authenticate, isAdmin, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/me', clientesController.getMyProfile);
router.get('/search', isAdminOrMechanic, clientesController.searchClientes);
router.get('/', isAdminOrMechanic, clientesController.getAllClientes);
router.get('/:id', clientesController.getClienteById);
router.put('/:id', clientesController.updateCliente);
router.get('/:id/vehiculos', clientesController.getVehiculosCliente);
router.get('/:id/ordenes', clientesController.getOrdenesCliente);
router.get('/:id/estadisticas', clientesController.getEstadisticasCliente);

module.exports = router;