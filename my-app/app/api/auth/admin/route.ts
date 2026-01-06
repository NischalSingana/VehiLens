import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/db/models/Admin';
import { adminLoginSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = adminLoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid credentials format', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { username, password } = validation.data;

        // Verify credentials
        const isValid = await verifyAdminPassword(username, password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create response with session cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful'
        });

        // Set HTTP-only cookie for session
        response.cookies.set('admin-session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('SERVER ERROR during admin login:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: 'Login failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    // Logout endpoint
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin-session');
    return response;
}
