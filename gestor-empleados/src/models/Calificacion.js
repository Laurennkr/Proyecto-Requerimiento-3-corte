const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Calificacion = sequelize.define('Calificacion', {
    criterios: {
      type: DataTypes.JSON,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Calificaciones',
    timestamps: false
  });

  Calificacion.associate = function(models) {
    Calificacion.belongsTo(models.Empleado, {
      foreignKey: 'EmpleadoId',
      as: 'Empleado',
      onDelete: 'CASCADE'
    });
  };

  return Calificacion;
}; 