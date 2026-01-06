import { NextRequest, NextResponse } from 'next/server';
import { searchAutos } from '@/lib/db/models/Auto';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const type = (searchParams.get('type') || 'vehicleNumber') as 'vehicleNumber' | 'driverName';

        if (!query) {
            return NextResponse.json({ autos: [] });
        }

        const autos = await searchAutos(query, type);

        return NextResponse.json({ autos });
    } catch (error) {
        console.error('Error searching autos:', error);
        return NextResponse.json(
            { error: 'Failed to search auto records' },
            { status: 500 }
        );
    }
}
