// the database connection logic
// it is separated to keep the code modular and maintainable

import mongoose from "mongoose";

export default async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (e) {
    console.error("DB connect error", e);
    process.exit(1);
  }
}
