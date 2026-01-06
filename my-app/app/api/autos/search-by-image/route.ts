import { NextRequest, NextResponse } from 'next/server';
import { findAutoByVehicleNumber } from '@/lib/db/models/Auto';
import { AIProcessingResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Call Python AI service
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const aiFormData = new FormData();
        // Create a proper File object with content type
        const imageBlob = new Blob([buffer], { type: file.type });
        aiFormData.append('file', imageBlob, file.name);

        let aiResponse: AIProcessingResponse;

        try {
            const response = await fetch(`${aiServiceUrl}/process-image`, {
                method: 'POST',
                body: aiFormData,
            });

            if (!response.ok) {
                throw new Error('AI service failed to process image');
            }

            aiResponse = await response.json();
        } catch (aiError: any) {
            console.error('AI SERVICE CONNECTION ERROR:', aiError);
            console.error('AI Service URL used:', aiServiceUrl);
            console.error('Error Stack:', aiError.stack);

            // Differentiate between 4xx/5xx from AI service vs Connection Refused
            const errorMessage = aiError.message || 'Unknown AI service error';

            return NextResponse.json(
                {
                    error: 'AI service communication failed',
                    details: errorMessage,
                    url: aiServiceUrl
                },
                { status: 503 }
            );
        }

        // Search for matching auto in database
        const matchedAuto = await findAutoByVehicleNumber(aiResponse.vehicleNumber);

        return NextResponse.json({
            vehicleNumber: aiResponse.vehicleNumber,
            confidence: aiResponse.confidence,
            detectionBox: aiResponse.detectionBox,
            matchedAutos: matchedAuto ? [matchedAuto] : [],
        });
    } catch (error: any) {
        console.error('SERVER ERROR during image search:', error);
        console.error('Error Stack:', error.stack);
        return NextResponse.json(
            {
                error: 'Failed to process image search',
                details: error.message
            },
            { status: 500 }
        );
    }
}
