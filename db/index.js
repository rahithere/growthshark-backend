import mongoose from "mongoose";

const DB_NAME = "growthshark";

const connectDB = async () => {
    try {
        // Already connected? Reuse the connection.
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // Reuse an ongoing connection attempt.
        if (!globalThis.mongoConnectionPromise) {
            globalThis.mongoConnectionPromise = mongoose
                .connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
                .catch((error) => {
                    // Allow a future request to retry if connection fails.
                    globalThis.mongoConnectionPromise = null;
                    throw error;
                });
        }

        const connectionInstance =
            await globalThis.mongoConnectionPromise;

        console.log(
            `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );

        return connectionInstance;
    } catch (error) {
        console.error("MONGODB connection error ", error);
        throw error;
    }
};

export default connectDB;
