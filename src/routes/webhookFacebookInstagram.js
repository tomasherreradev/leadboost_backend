const express = require('express');
const router = express.Router();
const webhookFacebookInstagramController = require('../controllers/socialAccountController/webhookFacebookInstagram');

// Endpoint de prueba
router.get('/test', webhookFacebookInstagramController.testWebhook);

// Verificación de webhook (GET)
router.get('/', webhookFacebookInstagramController.verifyWebhook);
// Recepción de mensajes (POST)
router.post('/', webhookFacebookInstagramController.handleWebhook);

module.exports = router;
