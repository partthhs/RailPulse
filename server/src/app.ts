import express from "express";
import cors from "cors";
import trainRoutes from "./routes/trainRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import geographyRoutes from "./routes/geographyRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import { config } from "./config/env.js";
import { logger } from "./utils/logger.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "RailPulse API",
      version: "1.0.0",
    });
  });

  // API v1 routes
  app.use("/api/v1/trains", trainRoutes);
  app.use("/api/v1/weather", weatherRoutes);
  app.use("/api/v1/geography", geographyRoutes);
  app.use("/api/v1/journeys", shareRoutes);
  app.use("/api/v1/planner", plannerRoutes);

  // Fallback 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Endpoint ${req.method} ${req.url} does not exist.` },
    });
  });

  return app;
}
