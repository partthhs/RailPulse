import { Router } from "express";
import { weatherController } from "../controllers/weatherController.js";

const router = Router();

router.get("/", (req, res) => weatherController.getWeather(req, res));
router.get("/train/:trainNumber", (req, res) => weatherController.getJourneyWeather(req, res));

export default router;
