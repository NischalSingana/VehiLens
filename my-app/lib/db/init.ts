import { initializeDefaultAdmin } from '@/lib/db/models/Admin';

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database...');

        // Create default admin user
        await initializeDefaultAdmin();

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
}

// Run initialization
initializeDatabase();
