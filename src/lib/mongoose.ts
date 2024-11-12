import "server-only";

import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.DATABASE_URL) return console.log("Mongodb url is missing");

  if (isConnected) return;

  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      dbName: "2FA",
    });

    isConnected = true;

    console.log("Connected to Mongodb");
  } catch (error) {
    console.log("Error while connecting to mongodb -> ", error);
  }
};
