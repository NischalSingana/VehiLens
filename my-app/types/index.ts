import { ObjectId } from 'mongodb';

export interface Auto {
  _id?: ObjectId;
  driverName: string;
  vehicleNumber: string;
  area: string;
  imageUrl: string;
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
