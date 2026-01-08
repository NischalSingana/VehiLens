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
        // area removed
        const imageFile = formData.get('image') as File;

        // Professional Details
        const licenseNumber = formData.get('licenseNumber') as string;
        // badgeNumber, ownerName removed
        const driverAddress = formData.get('driverAddress') as string;
        const driverPhone = formData.get('driverPhone') as string;
        const bloodGroup = formData.get('bloodGroup') as string | undefined;
        const emergencyContact = formData.get('emergencyContact') as string | undefined;
        const status = (formData.get('status') as any) || 'Active';

        // Validate form data
        const validation = autoFormSchema.safeParse({
            driverName,
            vehicleNumber,
            // area removed
            licenseNumber,
            // badgeNumber, ownerName removed
            driverAddress,
            driverPhone,
            bloodGroup,
            emergencyContact,
            status,
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
            ...validation.data,
            vehicleNumber: validation.data.vehicleNumber.toUpperCase(),
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
        // Handle duplicate fields
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const fieldName = field === 'vehicleNumber' ? 'Vehicle number' :
                field === 'licenseNumber' ? 'License number' : field;
            return NextResponse.json(
                { error: `${fieldName} already exists in the system` },
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
