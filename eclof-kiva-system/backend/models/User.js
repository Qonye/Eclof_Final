const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    agentId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^(FA|LO|BM|AD)\d{3}$/.test(v);
            },
            message: 'Agent ID must follow format: FA001, LO001, BM001, or AD001'
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allows multiple null values
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ['field_agent', 'loan_officer', 'branch_manager', 'admin'],
        default: 'field_agent'
    },
    branch: {
        type: String,
        required: function() {
            return this.role !== 'admin';
        },
        enum: [
            'Nairobi Central',
            'Kisumu Branch', 
            'Mombasa Branch',
            'Eldoret Branch',
            'Nakuru Branch',
            null // For admin users
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdBy: {
        type: String,
        default: 'system'
    },
    permissions: {
        canCreateSubmissions: {
            type: Boolean,
            default: true
        },
        canViewAllSubmissions: {
            type: Boolean,
            default: false
        },
        canManageUsers: {
            type: Boolean,
            default: false
        },
        canGenerateReports: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ agentId: 1 });
userSchema.index({ role: 1, branch: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        switch (this.role) {
            case 'admin':
                this.permissions = {
                    canCreateSubmissions: true,
                    canViewAllSubmissions: true,
                    canManageUsers: true,
                    canGenerateReports: true
                };
                this.branch = null;
                break;
            case 'branch_manager':
                this.permissions = {
                    canCreateSubmissions: true,
                    canViewAllSubmissions: true,
                    canManageUsers: false,
                    canGenerateReports: true
                };
                break;
            case 'loan_officer':
                this.permissions = {
                    canCreateSubmissions: true,
                    canViewAllSubmissions: false,
                    canManageUsers: false,
                    canGenerateReports: false
                };
                break;
            case 'field_agent':
                this.permissions = {
                    canCreateSubmissions: true,
                    canViewAllSubmissions: false,
                    canManageUsers: false,
                    canGenerateReports: false
                };
                break;
        }
    }
    next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    return this.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
    return this.find({ role: role, isActive: true });
};

// Static method to find by branch
userSchema.statics.findByBranch = function(branch) {
    return this.find({ branch: branch, isActive: true });
};

// Virtual for display name
userSchema.virtual('displayName').get(function() {
    return `${this.name} (${this.agentId})`;
});

// Virtual for role display
userSchema.virtual('roleDisplay').get(function() {
    const roleMap = {
        'field_agent': 'Field Agent',
        'loan_officer': 'Loan Officer', 
        'branch_manager': 'Branch Manager',
        'admin': 'Administrator'
    };
    return roleMap[this.role] || this.role;
});

// Transform output to remove password
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
