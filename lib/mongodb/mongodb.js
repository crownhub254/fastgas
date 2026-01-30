import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw during build - just warn
const isMongoConfigured = !!MONGODB_URI;

if (!isMongoConfigured && typeof window === 'undefined') {
    console.warn('Warning: MONGODB_URI is not defined. Database features will not work.');
}

// Mongoose connection caching
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (!isMongoConfigured) {
        console.warn('MongoDB not configured. Returning null connection.');
        return null;
    }
    
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Native MongoDB client for direct operations
let client;
let clientPromise;

if (isMongoConfigured) {
    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new MongoClient(MONGODB_URI);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(MONGODB_URI);
        clientPromise = client.connect();
    }
} else {
    // Create a mock promise that will reject if used
    clientPromise = Promise.reject(new Error('MongoDB not configured'));
}

export { isMongoConfigured };
export default clientPromise;
