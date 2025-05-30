const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración para SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db/database.sqlite'), // Ruta donde se guardará el archivo .sqlite
  logging: false // Desactiva los logs de SQL en consola (opcional)
});

module.exports = sequelize;