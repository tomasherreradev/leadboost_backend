const express = require('express');
const router = express.Router();

const getAll = require('../controllers/postTargetController/getAll');
const showPostTarget = require('../controllers/postTargetController/showPostTarget');
const storePostTarget = require('../controllers/postTargetController/storePostTarget');
const updatePostTarget = require('../controllers/postTargetController/updatePostTarget');
const deletePostTarget = require('../controllers/postTargetController/deletePostTarget');

router.get('/', getAll);
router.get('/:id', showPostTarget);
router.post('/', storePostTarget);
router.put('/:id', updatePostTarget);
router.delete('/:id', deletePostTarget);

module.exports = router;
