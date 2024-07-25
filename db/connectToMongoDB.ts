import 'dotenv/config';
import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.error(`Error while connecting to mongoDB: ${err.message}`);
  }
}

export default connectToMongoDB;
