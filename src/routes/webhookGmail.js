const express = require('express');
const router = express.Router();
const webhookGmailController = require('../controllers/socialAccountController/webhookGmail');

// Recepción de notificaciones push o polling (POST)
router.post('/', webhookGmailController.handleWebhook);

module.exports = router;
