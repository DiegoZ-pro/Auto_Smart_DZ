// Rutas de citas

const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/horarios-disponibles', citasController.getHorariosDisponibles);
router.get('/estadisticas', isAdminOrMechanic, citasController.getEstadisticas);
router.get('/', citasController.getAllCitas);
router.get('/cliente/:clienteId', citasController.getCitasByCliente);
router.get('/:id', citasController.getCitaById);
router.post('/', citasController.createCita);
router.put('/:id', citasController.updateCita);
router.put('/:id/confirmar', isAdminOrMechanic, citasController.confirmarCita);
router.put('/:id/cancelar', citasController.cancelarCita);
router.put('/:id/completar', isAdminOrMechanic, citasController.completarCita);

module.exports = router;