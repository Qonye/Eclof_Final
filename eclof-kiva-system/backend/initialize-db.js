const mongoose = require('mongoose');
const connectDB = require('./config/database');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Connect to database first
        await connectDB();
        console.log('Connected to MongoDB');
        
        // Import User model after connection is established
        const User = require('./models/User');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.agentId);
            process.exit(0);
        }
        
        // Create default admin user
        const adminUser = new User({
            agentId: 'AD001',
            name: 'System Administrator',
            email: 'admin@eclof.ke',
            password: 'eclof2025',
            role: 'admin',
            branch: null,
            createdBy: 'system'
        });
        
        await adminUser.save();
        console.log('✅ Default admin user created successfully!');
        console.log('Admin credentials:');
        console.log('Agent ID: AD001');
        console.log('Password: eclof2025');
        console.log('Email: admin@eclof.ke');
        
        // Create some sample field agents
        const sampleAgents = [
            {
                agentId: 'FA001',
                name: 'John Kamau',
                password: 'field123',
                role: 'field_agent',
                branch: 'Nairobi Central',
                createdBy: 'AD001'
            },
            {
                agentId: 'FA002',
                name: 'Mary Wanjiku',
                password: 'field123',
                role: 'field_agent',
                branch: 'Nairobi Central',
                createdBy: 'AD001'
            },
            {
                agentId: 'LO001',
                name: 'Samuel Kiprop',
                password: 'loan123',
                role: 'loan_officer',
                branch: 'Nairobi Central',
                createdBy: 'AD001'
            },
            {
                agentId: 'BM001',
                name: 'David Mwangi',
                password: 'manager123',
                role: 'branch_manager',
                branch: 'Nairobi Central',
                createdBy: 'AD001'
            }
        ];
        
        for (const agentData of sampleAgents) {
            const agent = new User(agentData);
            await agent.save();
            console.log(`✅ Created sample agent: ${agent.agentId} - ${agent.name}`);
        }
        
        console.log('\n🎉 Database initialization completed!');
        console.log('\nSample agent credentials:');
        console.log('Field Agent: FA001 / field123');
        console.log('Field Agent: FA002 / field123');
        console.log('Loan Officer: LO001 / loan123');
        console.log('Branch Manager: BM001 / manager123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
