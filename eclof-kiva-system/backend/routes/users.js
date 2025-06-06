const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
    authenticateToken, 
    requireAdmin, 
    requireManagerOrAdmin,
    requireUserManagement 
} = require('../middleware/auth');

// Protected routes - require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', userController.getCurrentUser);

// Admin only routes
router.get('/', requireUserManagement, userController.getAllUsers);
router.post('/', requireUserManagement, userController.createUser);
router.get('/:id', requireManagerOrAdmin, userController.getUserById);
router.put('/:id', requireUserManagement, userController.updateUser);
router.delete('/:id', requireUserManagement, userController.deleteUser);
router.post('/:id/reset-password', requireUserManagement, userController.resetPassword);

// Branch-specific routes (accessible by branch managers)
router.get('/branch/:branch', requireManagerOrAdmin, userController.getUsersByBranch);

module.exports = router;
