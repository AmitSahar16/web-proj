import mongoose from 'mongoose';

export const configMongo = async () => {
    const db = mongoose.connection;
    db.once('open', () => console.log('connected to MongoDB'));
    db.on('error', (error) => console.error('MongoDB connection error:', error));

    try {
        await mongoose.connect(process.env.DATABASE_URL || '');
    } catch (error) {
        console.error('error while trying to connect to mongo db', error);
        throw error;
    }
};