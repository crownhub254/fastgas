import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw during build - just warn
const isMongoConfigured = !!MONGODB_URI;

if (!isMongoConfigured && typeof window === 'undefined') {
    console.warn('Warning: MONGODB_URI is not defined. Database features will not work.');
}

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

export { isMongoConfigured };
