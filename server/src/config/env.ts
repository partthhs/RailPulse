import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load from root and server directory .env files
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Ensure SSL interception on Windows development environments doesn't abort fetch
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  railRadarApiKey: process.env.RAILRADAR_API_KEY || "rg_da955710a8c247e2a423f4b000d045e4",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "f6aa258ab2cc52be4a3f746a5d6028ca",
  openTopographyApiKey: process.env.OPENTOPOGRAPHY_API_KEY || "8b2cbbd2ffc9d2cb4672d93474f5284d",
  mapTilerApiKey: process.env.MAPTILER_API_KEY || "mMyG3TwsUk1XwpK3TDEN",
  overpassEndpoint: process.env.OVERPASS_ENDPOINT || "https://overpass-api.de/api/interpreter",
};
