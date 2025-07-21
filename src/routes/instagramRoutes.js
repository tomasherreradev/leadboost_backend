const express = require('express');
const router = express.Router();
const instagramAuth = require('../controllers/socialAccountController/instagramAuth');
const authMiddleware = require('../middleware/auth');

// Rutas públicas para la autenticación
router.get('/auth', authMiddleware, instagramAuth.getAuthUrl);
router.get('/callback', instagramAuth.handleCallback);

// Rutas protegidas que requieren autenticación
router.get('/status', authMiddleware, instagramAuth.getStatus);
router.delete('/disconnect', authMiddleware, instagramAuth.disconnect);

module.exports = router; 