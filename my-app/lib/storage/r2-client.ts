import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const isR2Configured = !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);

if (!isR2Configured) {
    console.warn('⚠️  Cloudflare R2 credentials not configured. Using local file storage for development.');
}

// Initialize R2 client only if credentials are configured
let r2Client: S3Client | null = null;

if (isR2Configured) {
    r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
    });
}

// Local storage fallback for development
async function saveImageLocally(file: Buffer, fileName: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Write file to disk
    fs.writeFileSync(filePath, file);

    // Return public URL path
    return `/uploads/${uniqueFileName}`;
}

async function deleteImageLocally(imageUrl: string): Promise<void> {
    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // Delete file if it exists
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export async function uploadImageToR2(
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    // Use local storage if R2 is not configured
    if (!isR2Configured) {
        return saveImageLocally(file, fileName);
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'vehilens-images';
    const publicUrl = process.env.R2_PUBLIC_URL || '';

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file,
        ContentType: contentType,
    });

    await r2Client!.send(command);

    // Return proxy URL (hides R2 bucket location)
    return `/api/images/${uniqueFileName}`;
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
    // Use local storage if R2 is not configured
    if (!isR2Configured) {
        return deleteImageLocally(imageUrl);
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'vehilens-images';

    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    await r2Client!.send(command);
}

export { r2Client };
