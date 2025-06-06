const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'eclof-kiva-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Agent/User Authentication
const authController = {
    
    // Login agent/user
    login: async (req, res) => {
        try {
            const { agentId, password } = req.body;
            
            if (!agentId || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Agent ID and password are required'
                });
            }
            
            // Find user by agentId
            const user = await User.findOne({ 
                agentId: agentId.toUpperCase(),
                isActive: true 
            });
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid agent ID or password'
                });
            }
            
            // Check password
            const isPasswordValid = await user.comparePassword(password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid agent ID or password'
                });
            }
            
            // Update last login
            await user.updateLastLogin();
            
            // Generate token
            const token = generateToken(user._id);
            
            // Return user data and token
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        agentId: user.agentId,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        roleDisplay: user.roleDisplay,
                        branch: user.branch,
                        permissions: user.permissions,
                        lastLogin: user.lastLogin
                    },
                    token
                }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    },
    
    // Verify token and get user
    verifyToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }
            
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Get user
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or user inactive'
                });
            }
            
            res.json({
                success: true,
                data: { user }
            });
            
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },
    
    // Admin login (separate endpoint for better security)
    adminLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }
            
            // Find admin user (can be by agentId or email)
            const user = await User.findOne({
                $or: [
                    { agentId: username.toUpperCase() },
                    { email: username.toLowerCase() }
                ],
                role: 'admin',
                isActive: true
            });
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin credentials'
                });
            }
            
            // Check password
            const isPasswordValid = await user.comparePassword(password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin credentials'
                });
            }
            
            // Update last login
            await user.updateLastLogin();
            
            // Generate token
            const token = generateToken(user._id);
            
            res.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    user: {
                        id: user._id,
                        agentId: user.agentId,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions,
                        lastLogin: user.lastLogin
                    },
                    token
                }
            });
            
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during admin login'
            });
        }
    },
    
    // Change password
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }
            
            // Get user with password
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Update password
            user.password = newPassword;
            await user.save();
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
            
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while changing password'
            });
        }
    }
};

module.exports = authController;
