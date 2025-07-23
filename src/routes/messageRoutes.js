const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/messages?provider=facebook|instagram
router.get('/', authenticate, messageController.getMessagesByUser);

module.exports = router;
