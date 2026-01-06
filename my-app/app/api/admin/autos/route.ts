import { NextRequest, NextResponse } from 'next/server';
import { createAuto } from '@/lib/db/models/Auto';
import { autoFormSchema } from '@/lib/utils/validation';
import { uploadImageToR2 } from '@/lib/storage/r2-client';
import { validateImage } from '@/lib/storage/image-validator';

function isAuthenticated(request: NextRequest): boolean {
    const session = request.cookies.get('admin-session');
    return session?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login as admin.' },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        // Extract form fields
        const driverName = formData.get('driverName') as string;
        const vehicleNumber = formData.get('vehicleNumber') as string;
        const area = formData.get('area') as string;
        const imageFile = formData.get('image') as File;

        // Validate form data
        const validation = autoFormSchema.safeParse({
            driverName,
            vehicleNumber,
            area,
        });

        if (!validation.success) {
            console.error('Validation failed:', validation.error.errors);
            return NextResponse.json(
                { error: 'Invalid form data', details: validation.error.errors },
                { status: 400 }
            );
        }

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Auto image is required' },
                { status: 400 }
            );
        }

        // Validate image
        const imageValidation = validateImage(imageFile.type, imageFile.size, 'auto');
        if (!imageValidation.valid) {
            return NextResponse.json(
                { error: imageValidation.error },
                { status: 400 }
            );
        }

        // Upload image to R2
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const imageUrl = await uploadImageToR2(buffer, imageFile.name, imageFile.type);

        // Create auto record in database
        const auto = await createAuto({
            driverName: validation.data.driverName,
            vehicleNumber: validation.data.vehicleNumber.replace(/\s/g, '').toUpperCase(),
            area: validation.data.area,
            imageUrl,
        });

        return NextResponse.json({
            success: true,
            auto,
        }, { status: 201 });
    } catch (error: any) {
        console.error('SERVER ERROR creating auto record:', error);
        console.error('Error Stack:', error.stack);

        // Handle duplicate vehicle number
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Vehicle number already exists in the system' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to create auto record',
                details: error.message
            },
            { status: 500 }
        );
    }
}
