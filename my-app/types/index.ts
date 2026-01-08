import { ObjectId } from 'mongodb';

export interface Auto {
  _id?: ObjectId;
  driverName: string;
  vehicleNumber: string;
  imageUrl: string;
  // Professional Details
  licenseNumber: string;
  driverAddress: string;
  driverPhone: string;
  // Emergency Info
  bloodGroup?: string;
  emergencyContact?: string;
  // Status
  status: 'Active' | 'Suspended' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  _id?: ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface SearchResult {
  autos: Auto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ImageSearchResult {
  vehicleNumber: string;
  confidence: number;
  detectionBox?: [number, number, number, number];
  matchedAutos: Auto[];
}

export interface AIProcessingResponse {
  vehicleNumber: string;
  confidence: number;
  detectionBox: [number, number, number, number];
}
