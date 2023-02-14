import { Router } from "express";
import {
  httpAbortLaunch,
  httpAddNewLaunch,
  httpGetAllLaunches,
} from "./launches.controller.js";

const launchesRouter = Router();

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:launchId", httpAbortLaunch);

export default launchesRouter;
