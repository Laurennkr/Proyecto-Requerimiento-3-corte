const { Cargo, Empleado } = require('../models');

module.exports = {
  async crear(req, res) {
    try {
      const cargo = await Cargo.create(req.body);
      res.status(201).json(cargo);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error al crear cargo',
        detalles: error.message 
      });
    }
  },

  async listar(req, res) {
    try {
      const cargos = await Cargo.findAll({
        include: {
          model: Empleado,
          as: 'Empleados',
          attributes: ['id', 'nombre']
        }
      });
      res.json(cargos);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al listar cargos',
        detalles: error.message 
      });
    }
  },

  async obtener(req, res) {
    try {
      const cargo = await Cargo.findByPk(req.params.id, {
        include: {
          model: Empleado,
          as: 'Empleados'
        }
      });
      
      if (!cargo) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }
      
      res.json(cargo);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener cargo',
        detalles: error.message 
      });
    }
  },

  async actualizar(req, res) {
    try {
      const [updated] = await Cargo.update(req.body, {
        where: { id: req.params.id }
      });

      if (!updated) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      const cargoActualizado = await Cargo.findByPk(req.params.id);
      res.json(cargoActualizado);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error al actualizar cargo',
        detalles: error.message 
      });
    }
  },

  async eliminar(req, res) {
    try {
      const cargo = await Cargo.findByPk(req.params.id);
      
      if (!cargo) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      await cargo.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al eliminar cargo',
        detalles: error.message 
      });
    }
  }
};