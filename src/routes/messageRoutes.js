const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController/messageController');
const authMiddleware = require('../middleware/auth');

// GET /api/messages?provider=facebook|instagram
router.get('/', authMiddleware, messageController.getMessagesByUser);

module.exports = router;
