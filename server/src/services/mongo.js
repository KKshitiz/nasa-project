import * as dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("Mongoose connection ready");
});
mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
  mongoose.set("strictQuery", false);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

export { mongoConnect, mongoDisconnect };
