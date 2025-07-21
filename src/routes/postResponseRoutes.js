const express = require('express');
const router = express.Router();

const getAll = require('../controllers/postResponseController/getAll');
const showPostResponse = require('../controllers/postResponseController/showPostResponse');
const storePostResponse = require('../controllers/postResponseController/storePostResponse');
const updatePostResponse = require('../controllers/postResponseController/updatePostResponse');
const deletePostResponse = require('../controllers/postResponseController/deletePostResponse');

router.get('/', getAll);
router.get('/:id', showPostResponse);
router.post('/', storePostResponse);
router.put('/:id', updatePostResponse);
router.delete('/:id', deletePostResponse);

module.exports = router;
