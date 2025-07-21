const express = require('express');
const router = express.Router();
const facebookAuth = require('../controllers/socialAccountController/facebookAuth');
const authMiddleware = require('../middleware/auth');

// Rutas públicas para la autenticación
router.get('/auth', authMiddleware, facebookAuth.getAuthUrl);
router.get('/callback', facebookAuth.handleCallback);

// Rutas protegidas que requieren autenticación
router.get('/status', authMiddleware, facebookAuth.getStatus);
router.delete('/disconnect', authMiddleware, facebookAuth.disconnect);

module.exports = router; 