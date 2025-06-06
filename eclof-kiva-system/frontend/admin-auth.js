// Admin Authentication System
// Replaces hardcoded admin credentials with secure API authentication

// Use the API_BASE_URL already defined in auth-api.js

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
                localStorage.setItem('adminAuthToken', data.token);
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('currentAdmin', JSON.stringify(data.user));
                
                return {
                    success: true,
                    admin: data.user,
                    token: data.token
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
        return adminData ? JSON.parse(adminData) : null;
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
        const token = AdminAuth.getAuthToken();
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Create new user
    async createUser(userData) {
        const token = AdminAuth.getAuthToken();
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
    },

    // Update user
    async updateUser(agentId, userData) {
        const token = AdminAuth.getAuthToken();
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
    },

    // Delete user
    async deleteUser(agentId) {
        const token = AdminAuth.getAuthToken();
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
    },

    // Toggle user active status
    async toggleUserStatus(agentId, isActive) {
        const token = AdminAuth.getAuthToken();
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

// Make APIs available globally
window.AdminAuth = AdminAuth;
window.UserManagementAPI = UserManagementAPI;

// Auto-verify admin token on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (AdminAuth.isLoggedIn()) {
        const isValid = await AdminAuth.verifyToken();
        if (!isValid) {
            console.log('Admin token expired, logging out');
            AdminAuth.logout();
            // Redirect to login if needed
            if (window.location.pathname.includes('admin')) {
                window.location.reload();
            }
        }
    }
});
