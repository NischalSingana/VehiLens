import { NextRequest } from 'next/server';

export function isAuthenticated(request: NextRequest): boolean {
    const session = request.cookies.get('admin-session');
    return session?.value === 'authenticated';
}
