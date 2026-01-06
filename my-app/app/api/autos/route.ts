import { NextRequest, NextResponse } from 'next/server';
import { getAllAutos } from '@/lib/db/models/Auto';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const { autos, total } = await getAllAutos(page, limit);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            autos,
            total,
            page,
            totalPages,
            limit,
        });
    } catch (error: any) {
        console.error('SERVER ERROR fetching autos:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: 'Failed to fetch auto records',
                details: error.message
            },
            { status: 500 }
        );
    }
}
