const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const gmailAuth = require('../controllers/socialAccountController/gmailAuth');

router.get('/auth', authMiddleware, gmailAuth.getAuthUrl);
router.get('/callback', gmailAuth.handleCallback);
router.get('/status', authMiddleware, gmailAuth.getStatus);
router.delete('/disconnect', authMiddleware, gmailAuth.disconnect);

module.exports = router;
