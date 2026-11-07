import { Router } from "express";
import { geographyController } from "../controllers/weatherController.js";

const router = Router();

router.get("/nearby", (req, res) => geographyController.getNearby(req, res));
router.get("/train/:trainNumber/nearby", (req, res) => geographyController.getTrainNearby(req, res));

export default router;
