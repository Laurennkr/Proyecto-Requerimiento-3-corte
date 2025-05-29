const express = require('express');
const router = express.Router();
const {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar,
  calificar,
  exportarTodasCalificaciones,
  listarCalificaciones
} = require('../controllers/empleadosController');
const { verificarToken } = require('../middleware/auth');

router.post('/', verificarToken, crear);
router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, obtener);
router.put('/:id', verificarToken, actualizar);
router.delete('/:id', verificarToken, eliminar);
router.post('/:id/calificar', verificarToken, calificar);
router.get('/:id/calificaciones', verificarToken, listarCalificaciones);
router.get('/calificaciones/exportar', verificarToken, exportarTodasCalificaciones);

module.exports = router;