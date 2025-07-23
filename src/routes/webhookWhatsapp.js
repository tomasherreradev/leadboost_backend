const express = require('express');
const router = express.Router();
const webhookWhatsappController = require('../controllers/socialAccountController/webhookWhatsapp');

// Verificación de webhook (GET)
router.get('/', webhookWhatsappController.verifyWebhook);
// Recepción de mensajes (POST)
router.post('/', webhookWhatsappController.handleWebhook);

module.exports = router;
