const mongoose = require('mongoose');

const connectToMongoDB = async () => {
    const db = mongoose.connection;
    db.once("open", () => console.log('connected to MongoDB'));
    db.on("error", (error) => console.error('MongoDB connection error:', error));

    try {
        await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
    } catch (error) {
        logger.error("error while trying to connect to mongo db");
        throw error;
    }
};

module.exports = connectToMongoDB;

