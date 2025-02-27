const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// logout route
router.get('/logout', authController.logout);

// Fogot password
router.post('/forgetPassword', authController.forgetPassword);

module.exports = router;
