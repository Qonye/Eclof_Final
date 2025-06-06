const User = require('../models/User');

const userController = {
    
    // Get all users (admin only)
    getAllUsers: async (req, res) => {
        try {
            const { role, branch, active } = req.query;
            
            // Build filter
            const filter = {};
            if (role) filter.role = role;
            if (branch) filter.branch = branch;
            if (active !== undefined) filter.isActive = active === 'true';
            
            const users = await User.find(filter)
                .select('-password')
                .sort({ role: 1, name: 1 });
            
            res.json({
                success: true,
                data: users,
                count: users.length
            });
            
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching users'
            });
        }
    },
    
    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
            
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user'
            });
        }
    },
    
    // Create new user (admin only)
    createUser: async (req, res) => {
        try {
            const { agentId, name, email, password, role, branch } = req.body;
            
            // Validation
            if (!agentId || !name || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Agent ID, name, password, and role are required'
                });
            }
            
            // Check if agent ID already exists
            const existingUser = await User.findOne({ agentId: agentId.toUpperCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Agent ID already exists'
                });
            }
            
            // Check if email already exists (if provided)
            if (email) {
                const existingEmail = await User.findOne({ email: email.toLowerCase() });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }
            
            // Create user
            const userData = {
                agentId: agentId.toUpperCase(),
                name: name.trim(),
                password,
                role,
                createdBy: req.user.agentId
            };
            
            if (email) userData.email = email.toLowerCase().trim();
            if (branch) userData.branch = branch;
            
            const user = new User(userData);
            await user.save();
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: user._id,
                    agentId: user.agentId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    branch: user.branch,
                    isActive: user.isActive,
                    permissions: user.permissions,
                    createdAt: user.createdAt
                }
            });
            
        } catch (error) {
            console.error('Create user error:', error);
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error creating user'
            });
        }
    },
    
    // Update user (admin only)
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, email, role, branch, isActive, permissions } = req.body;
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Update fields
            if (name !== undefined) user.name = name.trim();
            if (email !== undefined) user.email = email ? email.toLowerCase().trim() : null;
            if (role !== undefined) user.role = role;
            if (branch !== undefined) user.branch = branch;
            if (isActive !== undefined) user.isActive = isActive;
            if (permissions !== undefined) {
                user.permissions = { ...user.permissions, ...permissions };
            }
            
            await user.save();
            
            res.json({
                success: true,
                message: 'User updated successfully',
                data: {
                    id: user._id,
                    agentId: user.agentId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    branch: user.branch,
                    isActive: user.isActive,
                    permissions: user.permissions,
                    updatedAt: user.updatedAt
                }
            });
            
        } catch (error) {
            console.error('Update user error:', error);
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error updating user'
            });
        }
    },
    
    // Delete user (admin only)
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            
            // Prevent admin from deleting themselves
            if (userId === req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Soft delete by setting isActive to false
            user.isActive = false;
            await user.save();
            
            res.json({
                success: true,
                message: 'User deactivated successfully'
            });
            
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting user'
            });
        }
    },
    
    // Reset user password (admin only)
    resetPassword: async (req, res) => {
        try {
            const userId = req.params.id;
            const { newPassword } = req.body;
            
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            user.password = newPassword;
            await user.save();
            
            res.json({
                success: true,
                message: 'Password reset successfully'
            });
            
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password'
            });
        }
    },
    
    // Get users by branch (for branch managers)
    getUsersByBranch: async (req, res) => {
        try {
            const { branch } = req.params;
            
            // Branch managers can only see users in their branch
            if (req.user.role === 'branch_manager' && req.user.branch !== branch) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Can only view users in your branch'
                });
            }
            
            const users = await User.find({ 
                branch,
                isActive: true 
            }).select('-password').sort({ role: 1, name: 1 });
            
            res.json({
                success: true,
                data: users,
                count: users.length
            });
            
        } catch (error) {
            console.error('Get users by branch error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching users by branch'
            });
        }
    },
    
    // Get current user profile
    getCurrentUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
            
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user profile'
            });
        }
    }
};

module.exports = userController;
