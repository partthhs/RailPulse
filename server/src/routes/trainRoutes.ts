import { Router } from "express";
import { trainController } from "../controllers/trainController.js";

const router = Router();

router.get("/search", (req, res) => trainController.search(req, res));
router.get("/:trainNumber/status", (req, res) => trainController.getStatus(req, res));
router.get("/:trainNumber/route", (req, res) => trainController.getRoute(req, res));
router.get("/:trainNumber/analytics", (req, res) => trainController.getAnalytics(req, res));

export default router;
