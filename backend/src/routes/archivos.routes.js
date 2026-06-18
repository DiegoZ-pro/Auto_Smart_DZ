// Rutas de archivos adjuntos a órdenes

const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.use(authenticate);

router.get('/estadisticas', isAdminOrMechanic, archivosController.getEstadisticas);
router.post('/upload', archivosController.uploadArchivos);
router.get('/orden/:ordenId', archivosController.getArchivosByOrden);
router.get('/:id', archivosController.getArchivoById);
router.delete('/:id', archivosController.deleteArchivo);
router.put('/:id/descripcion', archivosController.updateDescripcion);

module.exports = router;