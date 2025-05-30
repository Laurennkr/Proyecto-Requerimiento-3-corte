const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cargo = sequelize.define('Cargo', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'green'
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Cargos',
    timestamps: true
  });

  Cargo.associate = function(models) {
    Cargo.hasMany(models.Empleado, {
      foreignKey: 'CargoId',
      as: 'Empleados',
      onDelete: 'SET NULL'
    });
  };

  return Cargo;
};