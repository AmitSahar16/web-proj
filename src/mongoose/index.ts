import mongoose from 'mongoose';

const connectToMongoDB = async (): Promise<void> => {
  const db = mongoose.connection;
  db.once('open', () => console.log('connected to MongoDB'));
  db.on('error', (error) => console.error('MongoDB connection error:', error));

  try {
    await mongoose.connect(process.env.DATABASE_URL || '', { useNewUrlParser: true });
  } catch (error) {
    console.error('error while trying to connect to mongo db', error);
    throw error;
  }
};

export default connectToMongoDB;

