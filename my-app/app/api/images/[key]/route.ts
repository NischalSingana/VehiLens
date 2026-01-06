import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/storage/r2-client';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await context.params;

        if (!key) {
            return new NextResponse('Image key is required', { status: 400 });
        }

        if (!r2Client) {
            console.error('R2 client not initialized');
            return new NextResponse('Storage service unavailable', { status: 503 });
        }

        const bucketName = process.env.R2_BUCKET_NAME || 'autoscan-images';

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        try {
            const response = await r2Client.send(command);

            // Convert the body to a Buffer/Uint8Array
            // Note: response.Body in AWS SDK v3 Node runtime is a readable stream or blob
            // We use transformToByteArray for compatibility
            const imageBuffer = await response.Body?.transformToByteArray();

            if (!imageBuffer) {
                return new NextResponse('Image not found', { status: 404 });
            }

            return new NextResponse(Buffer.from(imageBuffer), {
                headers: {
                    'Content-Type': response.ContentType || 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });

        } catch (s3Error: any) {
            if (s3Error.name === 'NoSuchKey') {
                return new NextResponse('Image not found', { status: 404 });
            }
            throw s3Error;
        }

    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
