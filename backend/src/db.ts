import mongoose from "mongoose";

import { dbUrl } from "./config";

const connectToDatabase = async () => {
  const url = dbUrl;
  if (url === '') {
    throw new Error("MONGODB_URL is not defined in the environment variables");
  }
  try {
    await mongoose.connect(url,{
      dbName: 'WriteThatDown'
    });
    
  }
  catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
  console.log("Connected to db!")
}


export { connectToDatabase };
