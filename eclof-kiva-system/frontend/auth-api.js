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

            const data = await response.json();

            if (response.ok && data.success) {
                // Store JWT token and user data
                localStorage.setItem('authToken', data.token);
                sessionStorage.setItem('currentAgent', JSON.stringify(data.user));
                sessionStorage.setItem('agentLoggedIn', 'true');
                
                return {
                    success: true,
                    agent: data.user,
                    token: data.token
                };
            } else {
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
    },

    // Verify token with backend
    async verifyToken() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Update session data if needed
                if (data.user) {
                    sessionStorage.setItem('currentAgent', JSON.stringify(data.user));
                }
                return true;
            } else {
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
    },

    // Get current logged in agent
    getCurrentAgent() {
        const agentData = sessionStorage.getItem('currentAgent');
        return agentData ? JSON.parse(agentData) : null;
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

// Auto-verify token on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (AuthAPI.isLoggedIn()) {
        const isValid = await AuthAPI.verifyToken();
        if (!isValid) {
            console.log('Token expired, user logged out');
            // Redirect to login if on a protected page
            if (window.location.pathname.includes('admin')) {
                window.location.href = 'index.html';
            }
        }
    }
});
