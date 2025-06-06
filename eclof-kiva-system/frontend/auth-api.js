// API-based Authentication System
// Replaces the hardcoded agent-config.js with secure backend authentication

const API_BASE_URL = 'http://localhost:3000/api';

// Authentication API functions
const AuthAPI = {
    // Login agent with API call
    async login(agentId, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ agentId, password })
            });

            const data = await response.json();            if (response.ok && data.success) {
                // Store JWT token and user data
                localStorage.setItem('authToken', data.data.token);
                sessionStorage.setItem('currentAgent', JSON.stringify(data.data.user));
                sessionStorage.setItem('agentLoggedIn', 'true');
                
                return {
                    success: true,
                    agent: data.data.user,
                    token: data.data.token
                };
            }else {
                return {
                    success: false,
                    message: data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection.'
            };
        }
    },    // Verify token with backend
    async verifyToken() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });if (response.ok) {
                const data = await response.json();
                // Update session data if needed
                if (data.data && data.data.user) {
                    sessionStorage.setItem('currentAgent', JSON.stringify(data.data.user));
                }
                return true;
            }else {
                // Token is invalid, clear auth data
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Password change error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    },    // Get current logged in agent
    getCurrentAgent() {
        const agentData = sessionStorage.getItem('currentAgent');
        // Handle cases where sessionStorage returns string "undefined" or null/empty
        if (!agentData || agentData === 'null' || agentData === 'undefined') {
            return null;
        }
        try {
            return JSON.parse(agentData);
        } catch (error) {
            console.error('Error parsing agent data:', error);
            // Clear corrupted data
            sessionStorage.removeItem('currentAgent');
            return null;
        }
    },

    // Check if agent is logged in
    isLoggedIn() {
        return sessionStorage.getItem('agentLoggedIn') === 'true' && 
               this.getCurrentAgent() !== null &&
               localStorage.getItem('authToken') !== null;
    },

    // Logout agent
    logout() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('currentAgent');
        sessionStorage.removeItem('agentLoggedIn');
    },

    // Get agent display name
    getAgentDisplayName() {
        const agent = this.getCurrentAgent();
        return agent ? `${agent.name} (${agent.agentId})` : 'Unknown Agent';
    },

    // Get agent branch
    getAgentBranch() {
        const agent = this.getCurrentAgent();
        return agent ? agent.branch : 'Unknown Branch';
    },

    // Get agent role
    getAgentRole() {
        const agent = this.getCurrentAgent();
        return agent ? agent.role : 'unknown';
    },

    // Get auth token for API calls
    getAuthToken() {
        return localStorage.getItem('authToken');
    },

    // Check if agent has specific permission
    hasPermission(permission) {
        const agent = this.getCurrentAgent();
        if (!agent || !agent.permissions) return false;
        return agent.permissions.includes(permission);
    },

    // Check if agent has specific role
    hasRole(role) {
        const agent = this.getCurrentAgent();
        return agent && agent.role === role;
    }
};

// Compatibility layer for existing code
const AgentAuth = {
    // Login agent (wrapper for API call)
    async login(agentId, password) {
        return await AuthAPI.login(agentId, password);
    },

    // Get current logged in agent
    getCurrentAgent() {
        return AuthAPI.getCurrentAgent();
    },

    // Check if agent is logged in
    isLoggedIn() {
        return AuthAPI.isLoggedIn();
    },

    // Logout agent
    logout() {
        AuthAPI.logout();
    },

    // Get agent display name
    getAgentDisplayName() {
        return AuthAPI.getAgentDisplayName();
    },

    // Get agent branch
    getAgentBranch() {
        return AuthAPI.getAgentBranch();
    },

    // Authenticate function (for backwards compatibility)
    authenticate(agentId, password) {
        // This will be handled by the async login method
        console.warn('authenticate() is deprecated. Use login() instead.');
        return { success: false, message: 'Use async login method' };
    }
};

// Make both APIs available globally
window.AuthAPI = AuthAPI;
window.AgentAuth = AgentAuth;

// Admin Authentication API functions
const AdminAuth = {
    // Admin login with API call
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store JWT token and admin data
                localStorage.setItem('adminAuthToken', data.data.token);
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('currentAdmin', JSON.stringify(data.data.user));
                
                return {
                    success: true,
                    admin: data.data.user,
                    token: data.data.token
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection.'
            };
        }
    },

    // Verify admin token
    async verifyToken() {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                const data = await response.json();
                // Update session data if needed
                if (data.user) {
                    sessionStorage.setItem('currentAdmin', JSON.stringify(data.user));
                }
                return true;
            } else {
                // Token is invalid, clear auth data
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Admin token verification error:', error);
            return false;
        }
    },

    // Check if admin is logged in
    isLoggedIn() {
        return sessionStorage.getItem('adminLoggedIn') === 'true' && 
               localStorage.getItem('adminAuthToken') !== null;
    },

    // Logout admin
    logout() {
        localStorage.removeItem('adminAuthToken');
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('currentAdmin');
    },

    // Get current admin
    getCurrentAdmin() {
        const adminData = sessionStorage.getItem('currentAdmin');
        if (!adminData || adminData === 'null' || adminData === 'undefined') {
            return null;
        }
        try {
            return JSON.parse(adminData);
        } catch (error) {
            console.error('Error parsing admin data:', error);
            sessionStorage.removeItem('currentAdmin');
            return null;
        }
    },

    // Get auth token for API calls
    getAuthToken() {
        return localStorage.getItem('adminAuthToken');
    }
};

// User Management API
const UserManagementAPI = {
    // Get all users
    async getAllUsers() {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
            }            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },    // Create new user
    async createUser(userData) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },    // Update user
    async updateUser(agentId, userData) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${agentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },    // Delete user
    async deleteUser(agentId) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${agentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete user');
            }

            return data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },    // Toggle user active status
    async toggleUserStatus(agentId, isActive) {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${agentId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user status');
            }

            return data;
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }
};

// Make admin APIs available globally
window.AdminAuth = AdminAuth;
window.UserManagementAPI = UserManagementAPI;

// Auto-verify tokens on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Verify agent token
    if (AuthAPI.isLoggedIn()) {
        const isValid = await AuthAPI.verifyToken();
        if (!isValid) {
            console.log('Agent token expired, user logged out');
            // Redirect to login if on a protected page
            if (window.location.pathname.includes('admin')) {
                window.location.href = 'index.html';
            }
        }
    }
    
    // Verify admin token
    if (AdminAuth.isLoggedIn()) {
        const isValid = await AdminAuth.verifyToken();
        if (!isValid) {
            console.log('Admin token expired, logging out');
            AdminAuth.logout();
            // Reload page if on admin dashboard
            if (window.location.pathname.includes('admin')) {
                window.location.reload();
            }
        }
    }
});
