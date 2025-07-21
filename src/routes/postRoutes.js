const express = require('express');
const router = express.Router();

const getAll = require('../controllers/postController/getAll');
const showPost = require('../controllers/postController/showPost');
const storePost = require('../controllers/postController/storePost');
const updatePost = require('../controllers/postController/updatePost');
const deletePost = require('../controllers/postController/deletePost');
const authMiddleware = require('../middleware/auth');

const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.get('/', getAll);
router.get('/:id', showPost);
router.post('/create', authMiddleware, storePost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
