// Field Agent Authentication Configuration
const FIELD_AGENTS = {
    // Format: agentId: { name, branch, role, password }
    "FA001": {
        name: "John Kamau",
        branch: "Nairobi Central",
        role: "field_agent",
        password: "field123"
    },
    "FA002": {
        name: "Mary Wanjiku",
        branch: "Nairobi Central", 
        role: "field_agent",
        password: "field123"
    },
    "FA003": {
        name: "Peter Ochieng",
        branch: "Kisumu Branch",
        role: "field_agent",
        password: "field123"
    },
    "FA004": {
        name: "Grace Akinyi",
        branch: "Kisumu Branch",
        role: "field_agent", 
        password: "field123"
    },
    "LO001": {
        name: "Samuel Kiprop",
        branch: "Nairobi Central",
        role: "loan_officer",
        password: "loan123"
    },
    "LO002": {
        name: "Ruth Nyambura",
        branch: "Kisumu Branch", 
        role: "loan_officer",
        password: "loan123"
    },
    "BM001": {
        name: "David Mwangi",
        branch: "Nairobi Central",
        role: "branch_manager",
        password: "manager123"
    },
    "BM002": {
        name: "Alice Chebet",
        branch: "Kisumu Branch",
        role: "branch_manager", 
        password: "manager123"
    }
};

// Agent Authentication Functions
const AgentAuth = {
    // Authenticate agent
    authenticate: function(agentId, password) {
        const agent = FIELD_AGENTS[agentId];
        if (agent && agent.password === password) {
            return {
                success: true,
                agent: {
                    agentId: agentId,
                    name: agent.name,
                    branch: agent.branch,
                    role: agent.role
                }
            };
        }
        return { success: false, message: "Invalid agent ID or password" };
    },

    // Get current logged in agent
    getCurrentAgent: function() {
        const agentData = sessionStorage.getItem('currentAgent');
        return agentData ? JSON.parse(agentData) : null;
    },

    // Login agent
    login: function(agentId, password) {
        const authResult = this.authenticate(agentId, password);
        if (authResult.success) {
            sessionStorage.setItem('currentAgent', JSON.stringify(authResult.agent));
            sessionStorage.setItem('agentLoggedIn', 'true');
        }
        return authResult;
    },

    // Logout agent
    logout: function() {
        sessionStorage.removeItem('currentAgent');
        sessionStorage.removeItem('agentLoggedIn');
    },

    // Check if agent is logged in
    isLoggedIn: function() {
        return sessionStorage.getItem('agentLoggedIn') === 'true' && this.getCurrentAgent() !== null;
    },

    // Get agent display name
    getAgentDisplayName: function() {
        const agent = this.getCurrentAgent();
        return agent ? `${agent.name} (${agent.agentId})` : 'Unknown Agent';
    },

    // Get agent branch
    getAgentBranch: function() {
        const agent = this.getCurrentAgent();
        return agent ? agent.branch : 'Unknown Branch';
    }
};

// Make AgentAuth available globally
window.AgentAuth = AgentAuth;
