import * as dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import { loadLaunchesData } from "./models/launches.model";
import { loadPlanetsData } from "./models/planets.model";
import { mongoConnect } from "./services/mongo";

const PORT = process.env.PORT || 8000;

const server = createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.info(`Server listening on PORT: ${PORT}`);
  });
}
startServer();
