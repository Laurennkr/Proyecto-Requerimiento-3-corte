const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Usuario', {
    usuario: {
      type: Sequelize.STRING,
      unique: true
    },
    contrasena: Sequelize.STRING // ← sin tilde
  }, { timestamps: false });
};
