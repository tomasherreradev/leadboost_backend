const express = require('express');
const router = express.Router();

const getAll = require('../controllers/socialAccountController/getAll');
const showSocialAccount = require('../controllers/socialAccountController/showSocialAccount');
const storeSocialAccount = require('../controllers/socialAccountController/storeSocialAccount');
const updateSocialAccount = require('../controllers/socialAccountController/updateSocialAccount');
const deleteSocialAccount = require('../controllers/socialAccountController/deleteSocialAccount');
const getStatus = require('../controllers/socialAccountController/getStatus');
const authMiddleware = require('../middleware/auth');

router.get('/status', authMiddleware, getStatus);
router.get('/', getAll);
router.get('/:id', showSocialAccount);
router.post('/', storeSocialAccount);
router.put('/:id', updateSocialAccount);
router.delete('/:id', deleteSocialAccount);

module.exports = router;
