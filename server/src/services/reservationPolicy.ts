/**
 * Indian Railways Reservation Opening Policy Calculator
 * Effective November 1, 2024 (PIB Official Notification):
 * Standard Advance Reservation Period (ARP) is 60 days, excluding the journey date.
 * Booking opens at 08:00 AM Indian Standard Time (IST, UTC+05:30).
 */

export interface ReservationPolicyConfig {
  advanceReservationDays: number; // default: 60
  openingTimeIST: string; // "08:00"
  trainExceptions?: Record<string, number>; // Specific trains with shorter/longer ARP (e.g. intercity/hill trains)
}

export const DEFAULT_RESERVATION_POLICY: ReservationPolicyConfig = {
  advanceReservationDays: 60,
  openingTimeIST: "08:00",
  trainExceptions: {
    // Some short-distance intercity / passenger trains have 30 days
    "12004": 60,
    "12951": 60,
    "22436": 60,
  },
};

/**
 * Calculates the exact date and time when booking opens for a journey date
 */
export function calculateReservationOpeningDate(
  journeyDateStr: string, // YYYY-MM-DD
  trainNumber?: string,
  policy = DEFAULT_RESERVATION_POLICY
): {
  openingDateStr: string; // YYYY-MM-DD
  openingDateTimeIST: string; // ISO string with +05:30
  daysUntilOpen: number;
  isOpen: boolean;
  arpDays: number;
} {
  const arp = (trainNumber && policy.trainExceptions?.[trainNumber]) || policy.advanceReservationDays;

  const journeyDate = new Date(`${journeyDateStr}T00:00:00+05:30`);
  // Subtract ARP days
  const openingDate = new Date(journeyDate.getTime() - arp * 24 * 60 * 60 * 1000);

  const year = openingDate.getFullYear();
  const month = String(openingDate.getMonth() + 1).padStart(2, "0");
  const day = String(openingDate.getDate()).padStart(2, "0");
  const openingDateStr = `${year}-${month}-${day}`;
  const openingDateTimeIST = `${openingDateStr}T${policy.openingTimeIST}:00+05:30`;

  const now = new Date();
  const openingTimestamp = new Date(openingDateTimeIST).getTime();
  const diffMs = openingTimestamp - now.getTime();
  const daysUntilOpen = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const isOpen = now.getTime() >= openingTimestamp;

  return {
    openingDateStr,
    openingDateTimeIST,
    daysUntilOpen: Math.max(0, daysUntilOpen),
    isOpen,
    arpDays: arp,
  };
}
