const express = require('express');
const router = express.Router();
const whatsappAuth = require('../controllers/socialAccountController/whatsappAuth');
const authMiddleware = require('../middleware/auth');

// Rutas públicas para la autenticación
router.get('/auth', authMiddleware, whatsappAuth.getAuthUrl);
router.get('/callback', whatsappAuth.handleCallback);

// Rutas protegidas que requieren autenticación
router.get('/status', authMiddleware, whatsappAuth.getStatus);
router.delete('/disconnect', authMiddleware, whatsappAuth.disconnect);

module.exports = router; 