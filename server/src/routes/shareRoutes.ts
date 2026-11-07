import { Router, Request, Response } from "express";
import crypto from "crypto";
import { trainService } from "../services/trainService.js";

const router = Router();

// In-memory / cache store for share tokens
const SHARED_JOURNEYS: Record<string, { trainNumber: string; createdAt: string }> = {};

router.post("/share", async (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.body;
    if (!trainNumber) {
      return res.status(400).json({ success: false, error: { message: "trainNumber is required" } });
    }

    const shareToken = crypto.randomBytes(8).toString("hex");
    SHARED_JOURNEYS[shareToken] = {
      trainNumber,
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: {
        shareId: shareToken,
        shareUrl: `/share/${shareToken}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get("/share/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const item = SHARED_JOURNEYS[token];
    if (!item) {
      return res.status(404).json({ success: false, error: { message: "Shared journey link expired or invalid" } });
    }

    const status = await trainService.getStatus(item.trainNumber);
    res.json({
      success: true,
      data: {
        token,
        trainNumber: item.trainNumber,
        status,
        createdAt: item.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
