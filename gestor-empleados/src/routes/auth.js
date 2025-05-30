const router = require('express').Router();
const { login } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

module.exports = router;