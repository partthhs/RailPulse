import { WatchedTrain, FareAlert, SmartNotification } from "@railpulse/types";
import { plannerStorage } from "./plannerStorage.js";
import { railRadarProvider } from "../providers/railway/railRadarProvider.js";
import { calculateReservationOpeningDate } from "./reservationPolicy.js";
import { logger } from "../utils/logger.js";

export class NotificationService {
  /**
   * Add a train to watchlist
   */
  async addToWatchlist(item: Omit<WatchedTrain, "id" | "createdAt">): Promise<WatchedTrain> {
    const resv = calculateReservationOpeningDate(item.journeyDate, item.trainNumber);
    const bookingStatus = resv.isOpen ? "OPEN" : "UPCOMING";

    const saved = plannerStorage.addWatchedTrain({
      ...item,
      bookingStatus,
      reservationOpeningDate: resv.openingDateStr,
    });

    // Check if booking opens in <= 1 day and trigger alert
    if (!resv.isOpen && resv.daysUntilOpen <= 1) {
      plannerStorage.addNotification({
        title: "Reservation Opening Tomorrow",
        message: `Booking for ${item.trainName} (${item.trainNumber}) for journey on ${item.journeyDate} opens tomorrow at 08:00 AM IST.`,
        type: "BOOKING_OPENING",
        relatedTrainNumber: item.trainNumber,
        relatedTrainName: item.trainName,
        actionUrl: `/watchlist`,
      });
    }

    return saved;
  }

  getWatchlist(): WatchedTrain[] {
    return plannerStorage.getWatchedTrains();
  }

  removeWatchlist(id: string): boolean {
    return plannerStorage.removeWatchedTrain(id);
  }

  // --- Fare Alerts ---
  addFareAlert(item: Omit<FareAlert, "id" | "createdAt" | "lastCheckedAt">): FareAlert {
    return plannerStorage.addFareAlert(item);
  }

  getFareAlerts(): FareAlert[] {
    return plannerStorage.getFareAlerts();
  }

  removeFareAlert(id: string): boolean {
    return plannerStorage.removeFareAlert(id);
  }

  // --- Notifications ---
  getNotifications(): SmartNotification[] {
    return plannerStorage.getNotifications();
  }

  markRead(id: string): boolean {
    return plannerStorage.markNotificationRead(id);
  }

  clearAll(): void {
    plannerStorage.clearNotifications();
  }

  /**
   * Periodic background check on monitored trains (called by cron/worker)
   */
  async runMonitoringCycle(): Promise<void> {
    const watched = plannerStorage.getWatchedTrains();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    for (const item of watched) {
      try {
        // 1. Check reservation opening
        const resv = calculateReservationOpeningDate(item.journeyDate, item.trainNumber);
        if (!resv.isOpen && resv.daysUntilOpen === 1 && item.notifyBookingOpening) {
          plannerStorage.addNotification({
            title: "Booking Opening Alert",
            message: `Reservation for ${item.trainName} (${item.trainNumber}) opens tomorrow morning at 08:00 AM.`,
            type: "BOOKING_OPENING",
            relatedTrainNumber: item.trainNumber,
            relatedTrainName: item.trainName,
            actionUrl: `/watchlist`,
          });
        }

        // 2. Check live status if journey is today
        if (item.journeyDate === todayStr) {
          const status = await railRadarProvider.getTrainStatus(item.trainNumber);
          if (status) {
            // Check delay notification
            if (status.delayMinutes >= 20 && item.notifyDelay) {
              plannerStorage.addNotification({
                title: "Train Delay Alert",
                message: `${item.trainName} (${item.trainNumber}) is currently delayed by ${status.delayMinutes} minutes.`,
                type: "DELAY",
                relatedTrainNumber: item.trainNumber,
                relatedTrainName: item.trainName,
                actionUrl: `/track/${item.trainNumber}`,
              });
            }

            // Check approaching notification
            if (item.notifyApproaching && status.nextStation?.stationCode === item.boardingStationCode) {
              plannerStorage.addNotification({
                title: "Train Approaching Boarding Station",
                message: `${item.trainName} is approaching ${item.boardingStation} (ETA: ${status.nextStation.estimatedArrival || "shortly"}).`,
                type: "APPROACHING",
                relatedTrainNumber: item.trainNumber,
                relatedTrainName: item.trainName,
                actionUrl: `/track/${item.trainNumber}`,
              });
            }
          }
        }
      } catch (err: any) {
        logger.warn(`Monitoring cycle error for ${item.trainNumber}: ${err.message}`);
      }
    }

    // Check fare alerts
    const alerts = plannerStorage.getFareAlerts();
    for (const alert of alerts) {
      if (alert.currentFare <= alert.targetFare && alert.status !== "TARGET_REACHED") {
        alert.status = "TARGET_REACHED";
        plannerStorage.addNotification({
          title: "Target Fare Reached!",
          message: `Fare for ${alert.trainName} (${alert.trainNumber}) in ${alert.travelClass} dropped to ₹${alert.currentFare} (Target: ₹${alert.targetFare}).`,
          type: "FARE_REACHED",
          relatedTrainNumber: alert.trainNumber,
          relatedTrainName: alert.trainName,
          actionUrl: `/fare-watch`,
        });
      }
    }
  }
}

export const notificationService = new NotificationService();
