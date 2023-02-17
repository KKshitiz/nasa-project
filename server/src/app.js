import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import api from "./routes/api";

const rootPath = path.resolve(path.dirname(""));

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);

app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(rootPath, "public")));

app.use("/v1", api);

app.get("/*", (req, res) => {
  return res.sendFile(path.join(rootPath, "public", "index.html"));
});

export default app;
