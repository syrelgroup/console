import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoute from "./modules/auth/routes.js";
import activityRoute from "./modules/activity/routes.js";
import aiRoute from "./modules/ai/routes.js";
import { middleware } from "./libs/util.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// ROOT APP
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/auth", authRoute);
app.use("/activities", middleware, activityRoute);
app.use("/ai", aiRoute);

const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready ...`);
});
