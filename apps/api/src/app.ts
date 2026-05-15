import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { projectRoutes } from "./modules/projects/project.routes.js";
import { taskRoutes } from "./modules/tasks/task.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";

export const app = express();

const allowedOrigins = [
  env.CLIENT_URL,
  ...(env.CLIENT_URLS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [])
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin === "https://team-task-managerweb-production.up.railway.app" ||
    origin.endsWith(".up.railway.app");

  if (origin && isAllowed) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(helmet());
const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin === "https://team-task-managerweb-production.up.railway.app" ||
      origin.endsWith(".up.railway.app");

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", dashboardRoutes);
app.use("/api", taskRoutes);

app.use(notFound);
app.use(errorHandler);
