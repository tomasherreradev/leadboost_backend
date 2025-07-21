const express = require('express');
const router = express.Router();

const getAll = require('../controllers/userController/getAll');
const showUser = require('../controllers/userController/showUser');
const storeUser = require('../controllers/userController/storeUser');
const updateUser = require('../controllers/userController/updateUser');
const deleteUser = require('../controllers/userController/deleteUser');

router.get('/', getAll);
router.get('/:id', showUser);
router.post('/', storeUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
