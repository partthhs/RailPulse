import { Router } from "express";
import { plannerController } from "../controllers/plannerController.js";

const router = Router();

// Station Autocomplete
router.get("/stations", (req, res) => plannerController.searchStations(req, res));

// Trains Between Stations
router.get("/between", (req, res) => plannerController.getBetweenTrains(req, res));

// Monthly Travel Calendar
router.get("/calendar", (req, res) => plannerController.getMonthlyCalendar(req, res));

// Fare Comparison
router.get("/fares/compare", (req, res) => plannerController.compareFares(req, res));

// Watchlist
router.get("/watchlist", (req, res) => plannerController.getWatchlist(req, res));
router.post("/watchlist", (req, res) => plannerController.addToWatchlist(req, res));
router.delete("/watchlist/:id", (req, res) => plannerController.removeFromWatchlist(req, res));

// Fare Alerts / Fare Watch
router.get("/fare-watch", (req, res) => plannerController.getFareAlerts(req, res));
router.post("/fare-watch", (req, res) => plannerController.addFareAlert(req, res));
router.delete("/fare-watch/:id", (req, res) => plannerController.removeFareAlert(req, res));

// In-app Notifications
router.get("/notifications", (req, res) => plannerController.getNotifications(req, res));
router.patch("/notifications/:id/read", (req, res) => plannerController.markNotificationRead(req, res));
router.delete("/notifications", (req, res) => plannerController.clearNotifications(req, res));

export default router;
