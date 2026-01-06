import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin dashboard routes
    if (pathname.startsWith('/admin/dashboard')) {
        const session = request.cookies.get('admin-session');

        if (!session || session.value !== 'authenticated') {
            // Redirect to login if not authenticated
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard/:path*'],
};
