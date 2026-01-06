import { Collection } from 'mongodb';
import { getDatabase } from '../mongodb';
import { Auto } from '@/types';

export async function getAutosCollection(): Promise<Collection<Auto>> {
    const db = await getDatabase();
    const collection = db.collection<Auto>('autos');

    // Create indexes for efficient searching
    await collection.createIndex({ vehicleNumber: 1 }, { unique: true });
    await collection.createIndex({ driverName: 'text' });
    await collection.createIndex({ createdAt: -1 });

    return collection;
}

export async function createAuto(auto: Omit<Auto, '_id' | 'createdAt' | 'updatedAt'>): Promise<Auto> {
    const collection = await getAutosCollection();
    const now = new Date();

    const newAuto: Omit<Auto, '_id'> = {
        ...auto,
        createdAt: now,
        updatedAt: now,
    };

    const result = await collection.insertOne(newAuto as Auto);
    return { ...newAuto, _id: result.insertedId } as Auto;
}

export async function findAutoByVehicleNumber(vehicleNumber: string | null | undefined): Promise<Auto | null> {
    if (!vehicleNumber) return null;

    const collection = await getAutosCollection();
    // Normalize: Remove all spaces for database query
    const cleanNumber = vehicleNumber.replace(/\s/g, '');
    return collection.findOne({
        vehicleNumber: { $regex: new RegExp(`^${cleanNumber}$`, 'i') }
    });
}

export async function searchAutos(query: string, type: 'vehicleNumber' | 'driverName'): Promise<Auto[]> {
    const collection = await getAutosCollection();

    if (type === 'vehicleNumber') {
        // Normalize: Remove all spaces for vehicle number search
        const cleanQuery = query.replace(/\s/g, '');
        return collection.find({
            vehicleNumber: { $regex: new RegExp(cleanQuery, 'i') }
        }).toArray();
    } else {
        return collection.find({
            driverName: { $regex: new RegExp(query, 'i') }
        }).toArray();
    }
}

export async function getAllAutos(page: number = 1, limit: number = 20): Promise<{ autos: Auto[], total: number }> {
    const collection = await getAutosCollection();
    const skip = (page - 1) * limit;

    const [autos, total] = await Promise.all([
        collection.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(),
    ]);

    return { autos, total };
}

export async function updateAuto(id: string, updates: Partial<Auto>): Promise<boolean> {
    const collection = await getAutosCollection();
    const { ObjectId } = require('mongodb');

    // Remove _id from updates to avoid error
    const { _id, ...updateFields } = updates;

    // Add updatedAt
    const finalUpdates = {
        ...updateFields,
        updatedAt: new Date(),
    };

    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: finalUpdates }
    );

    return result.modifiedCount > 0;
}

export async function deleteAuto(id: string): Promise<boolean> {
    const collection = await getAutosCollection();
    const { ObjectId } = require('mongodb');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}
