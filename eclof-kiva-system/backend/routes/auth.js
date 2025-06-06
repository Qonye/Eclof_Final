const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/verify-token', authController.verifyToken);

// Protected routes
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
