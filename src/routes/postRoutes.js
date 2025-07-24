const express = require('express');
const router = express.Router();

const getAll = require('../controllers/postController/getAll');
const showPost = require('../controllers/postController/showPost');
const storePost = require('../controllers/postController/storePost');
const updatePost = require('../controllers/postController/updatePost');
const deletePost = require('../controllers/postController/deletePost');
const authMiddleware = require('../middleware/auth');

const fileUpload = require('express-fileupload');

// Permitir múltiples archivos
router.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  useTempFiles: true,
  tempFileDir: '/tmp/',
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  parseNested: true,
  debug: false,
  // Permitir múltiples archivos
  limits: { files: 10 },
  // No es necesario especificar 'multiple: true' en express-fileupload, solo manejarlo en el controlador
}));

router.get('/', getAll);
router.get('/:id', showPost);
router.post('/create', authMiddleware, storePost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
