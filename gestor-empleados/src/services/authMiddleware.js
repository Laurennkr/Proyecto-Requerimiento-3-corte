const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header recibido:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extraído:', token);

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'laurenesbova', (err, decoded) => {
    if (err) {
      console.log('Error en verificación de token:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.log('Token verificado, payload:', decoded);
    req.user = decoded;
    next();
  });
}

module.exports = verificarToken;
