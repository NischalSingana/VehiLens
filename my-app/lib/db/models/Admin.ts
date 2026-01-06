import { Collection } from 'mongodb';
import { getDatabase } from '../mongodb';
import { Admin } from '@/types';
import bcrypt from 'bcryptjs';

export async function getAdminsCollection(): Promise<Collection<Admin>> {
    const db = await getDatabase();
    const collection = db.collection<Admin>('admins');

    // Create unique index on username
    await collection.createIndex({ username: 1 }, { unique: true });

    return collection;
}

export async function createAdmin(username: string, password: string): Promise<Admin> {
    const collection = await getAdminsCollection();
    const passwordHash = await bcrypt.hash(password, 10);

    const admin: Omit<Admin, '_id'> = {
        username,
        passwordHash,
        createdAt: new Date(),
    };

    const result = await collection.insertOne(admin as Admin);
    return { ...admin, _id: result.insertedId } as Admin;
}

export async function findAdminByUsername(username: string): Promise<Admin | null> {
    const collection = await getAdminsCollection();
    return collection.findOne({ username });
}

export async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
    const admin = await findAdminByUsername(username);
    if (!admin) return false;

    return bcrypt.compare(password, admin.passwordHash);
}

export async function initializeDefaultAdmin(): Promise<void> {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await findAdminByUsername(adminUsername);
    if (!existingAdmin) {
        await createAdmin(adminUsername, adminPassword);
        console.log(`✅ Default admin created: ${adminUsername}`);
    }
}
