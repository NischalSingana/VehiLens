import { NextResponse } from 'next/server';
import { initializeDefaultAdmin } from '@/lib/db/models/Admin';

export async function POST() {
    try {
        await initializeDefaultAdmin();
        return NextResponse.json({
            success: true,
            message: 'Admin user initialized successfully'
        });
    } catch (error: any) {
        console.error('Error initializing admin:', error);
        return NextResponse.json(
            { error: 'Failed to initialize admin', details: error.message },
            { status: 500 }
        );
    }
}
