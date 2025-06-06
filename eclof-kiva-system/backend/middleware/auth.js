const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'eclof-kiva-secret-key-2025';

// Verify JWT token and attach user to request
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user inactive'
            });
        }
        
        // Attach user to request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Token authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        // Allow if user has any of the required roles
        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!userRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

// Check if user has specific permission
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!req.user.permissions || !req.user.permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: `Permission required: ${permission}`
            });
        }
        
        next();
    };
};

// Check if user is admin
const requireAdmin = requireRole('admin');

// Check if user is admin or branch manager
const requireManagerOrAdmin = requireRole(['admin', 'branch_manager']);

// Check if user can manage users
const requireUserManagement = requirePermission('canManageUsers');

// Check if user can view all submissions  
const requireViewAllSubmissions = requirePermission('canViewAllSubmissions');

// Optional authentication (for endpoints that work both authenticated and unauthenticated)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
        
    } catch (error) {
        // For optional auth, we don't return errors
        // Just continue without user
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requirePermission,
    requireAdmin,
    requireManagerOrAdmin,
    requireUserManagement,
    requireViewAllSubmissions,
    optionalAuth
};
