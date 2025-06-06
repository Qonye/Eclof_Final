// Frontend Configuration
// This file manages API endpoints and environment-specific settings

class Config {
  constructor() {
    // Determine the API base URL based on environment
    this.API_BASE_URL = this.getApiBaseUrl();
  }

  getApiBaseUrl() {
    // Check if we're in development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '0.0.0.0';
    
    if (isDevelopment) {
      // Development: Use explicit backend URL
      return 'http://localhost:3000';
    } else {
      // Production: Use same origin (assumes backend and frontend are served from same domain)
      return window.location.origin;
    }
  }

  // API endpoint methods
  getSubmissionsUrl() {
    return `${this.API_BASE_URL}/api/submissions`;
  }

  getSubmissionUrl(id) {
    return `${this.API_BASE_URL}/api/submissions/${id}`;
  }

  getGenerateProfileUrl(id) {
    return `${this.API_BASE_URL}/api/submissions/${id}/generate-profile`;
  }  getDeleteSubmissionUrl(id) {
    return `${this.API_BASE_URL}/api/submissions/${id}`;
  }

  // Utility method to make API calls with proper error handling
  async apiCall(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Environment info
  isDevelopment() {
    return this.API_BASE_URL.includes('localhost');
  }

  isProduction() {
    return !this.isDevelopment();
  }
}

// Create global config instance
window.AppConfig = new Config();

console.log('App Config initialized:', {
  environment: window.AppConfig.isDevelopment() ? 'development' : 'production',
  apiBaseUrl: window.AppConfig.API_BASE_URL
});
