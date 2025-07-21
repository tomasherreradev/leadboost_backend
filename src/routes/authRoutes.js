const express = require('express');
const router = express.Router();

const register = require('../controllers/authController/register');
const login = require('../controllers/authController/login');
const forgotPassword = require('../controllers/authController/forgotPassword');
const resetPassword = require('../controllers/authController/resetPassword');

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router; 