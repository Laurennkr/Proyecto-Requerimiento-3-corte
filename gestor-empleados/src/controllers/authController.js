const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const SECRET_KEY = 'laurenesbova';

module.exports = {
  login: async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ mensaje: 'Faltan credenciales' });
    }

    const user = await Usuario.findOne({ where: { usuario, contrasena } });

    if (user) {
      const token = jwt.sign({ usuario: user.usuario }, SECRET_KEY);

      return res.json({ mensaje: 'Autenticado correctamente', token });
    }

    res.status(401).json({ error: 'Credenciales inválidas' });
  }
};
