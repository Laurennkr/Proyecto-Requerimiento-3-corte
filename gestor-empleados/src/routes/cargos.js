const router = require('express').Router();
const {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar
} = require('../controllers/cargosController');

router.post('/', crear);
router.get('/', listar);
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;