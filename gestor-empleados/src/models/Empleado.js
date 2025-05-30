const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empleado = sequelize.define('Empleado', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true
    },
    turno: {
      type: DataTypes.STRING,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'activo'
    },
    icono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CargoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cargos',
        key: 'id'
      }
    },
    cedula: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'Empleados',
    timestamps: true
  });

  Empleado.associate = function(models) {
    Empleado.belongsTo(models.Cargo, {
      foreignKey: 'CargoId',
      as: 'Cargo',
      onDelete: 'SET NULL'
    });
  };

  return Empleado;
};