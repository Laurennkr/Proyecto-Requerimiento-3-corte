const express = require('express'); 
const cors = require('cors'); // <-- importa cors

const app = express();

app.use(cors({
  origin: '*', // o 'http://localhost:5500' de forma específica
  exposedHeaders: ['Authorization']
}));

app.use(express.json());

const authRoutes = require('./routes/auth');
const cargosRoutes = require('./routes/cargos');
const empleadosRoutes = require('./routes/empleados');
const verificarToken = require('./services/authMiddleware');

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/cargos', verificarToken, cargosRoutes);
app.use('/empleados', verificarToken, empleadosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.listen(5000, () => {
  console.log('Servidor en http://localhost:5000');
});
