import { NextRequest, NextResponse } from 'next/server';
import { updateAuto, deleteAuto } from '@/lib/db/models/Auto';
import { autoFormSchema } from '@/lib/utils/validation';
import { validateImage } from '@/lib/storage/image-validator';
import { uploadImageToR2 } from '@/lib/storage/r2-client';

function isAuthenticated(request: NextRequest): boolean {
    const session = request.cookies.get('admin-session');
    return session?.value === 'authenticated';
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login as admin.' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json(
                { error: 'Record ID is required' },
                { status: 400 }
            );
        }

        const success = await deleteAuto(id);

        if (!success) {
            return NextResponse.json(
                { error: 'Record not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting auto record:', error);
        return NextResponse.json(
            { error: 'Failed to delete record' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login as admin.' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const formData = await request.formData();

        // Extract form fields
        const driverName = formData.get('driverName') as string;
        const vehicleNumber = formData.get('vehicleNumber') as string;
        const area = formData.get('area') as string;
        const imageFile = formData.get('image') as File | null;

        // Validate form data
        const validation = autoFormSchema.safeParse({
            driverName,
            vehicleNumber,
            area,
        });

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid form data', details: validation.error.errors },
                { status: 400 }
            );
        }

        let updates: any = {
            driverName: validation.data.driverName,
            vehicleNumber: validation.data.vehicleNumber.replace(/\s/g, '').toUpperCase(), // Normalize
            area: validation.data.area,
        };

        // Handle image update if provided
        if (imageFile && imageFile.size > 0) {
            // Validate image
            const imageValidation = validateImage(imageFile.type, imageFile.size, 'auto');
            if (!imageValidation.valid) {
                return NextResponse.json(
                    { error: imageValidation.error },
                    { status: 400 }
                );
            }

            // Upload new image
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const imageUrl = await uploadImageToR2(buffer, imageFile.name, imageFile.type);

            updates.imageUrl = imageUrl;
        }

        const success = await updateAuto(id, updates);

        if (!success) {
            return NextResponse.json(
                { error: 'Record not found or update failed' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Record updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating auto record:', error);

        // Handle duplicate vehicle number check if needed (though tricky on update)
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Vehicle number already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update record' },
            { status: 500 }
        );
    }
}
