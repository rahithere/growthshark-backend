import mongoose from "mongoose";

const DB_NAME = "growthshark"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)

        return connectionInstance
    } catch (error) {
        console.error("MONGODB connection error ", error)
        throw error
    }
}

export default connectDB