const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db/database.sqlite'),
  logging: console.log
});

// Importar modelos
const Usuario = require('./Usuario')(sequelize);
const Cargo = require('./Cargo')(sequelize);
const Empleado = require('./Empleado')(sequelize);
const Calificacion = require('./Calificacion')(sequelize);

// Definir relaciones
Cargo.hasMany(Empleado, { foreignKey: 'CargoId', as: 'Empleados' });
Empleado.belongsTo(Cargo, { foreignKey: 'CargoId', as: 'Cargo' });
Empleado.hasMany(Calificacion, { foreignKey: 'EmpleadoId', as: 'Calificaciones' });
Calificacion.belongsTo(Empleado, { foreignKey: 'EmpleadoId', as: 'Empleado' });

async function initializeDatabase() {
  try {
    await sequelize.sync({ force: true });

    // Datos iniciales
    await Usuario.create({ usuario: 'admin', contrasena: 'admin123' });

    const cargo1 = await Cargo.create({
      nombre: 'Gerente',
      color: 'blue',
      descripcion: 'Responsable de departamento'
    });

    const cargo2 = await Cargo.create({
      nombre: 'Desarrollador',
      color: 'green',
      descripcion: 'Desarrollo de software'
    });

    await Empleado.create({
      nombre: 'Ana Pérez',
      cedula: '10000001',
      area: 'TI',
      turno: 'AM',
      estado: 'activo',
      icono: '👩‍💻',
      CargoId: cargo1.id
    });

    await Empleado.create({
      nombre: 'Carlos Gómez',
      cedula: '10000002',
      area: 'Soporte',
      turno: 'PM',
      estado: 'activo',
      icono: '👨‍💼',
      CargoId: cargo2.id
    });

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Solo inicializar si no estamos en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
}

module.exports = {
  sequelize,
  Usuario,
  Cargo,
  Empleado,
  Calificacion
};