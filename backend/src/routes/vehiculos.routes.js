// Rutas de vehículos

const express = require('express');
const router = express.Router();
const vehiculosController = require('../controllers/vehiculosController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/search', vehiculosController.searchVehiculos);
router.get('/marcas', vehiculosController.getMarcas);
router.get('/', vehiculosController.getAllVehiculos);
router.get('/placa/:placa', vehiculosController.getVehiculoByPlaca);
router.get('/:id', vehiculosController.getVehiculoById);
router.post('/', vehiculosController.createVehiculo);
router.put('/:id', vehiculosController.updateVehiculo);
router.delete('/:id', isAdminOrMechanic, vehiculosController.deleteVehiculo);
router.get('/:id/historial', vehiculosController.getHistorialVehiculo);

module.exports = router;