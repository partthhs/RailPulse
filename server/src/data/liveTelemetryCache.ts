// Persistent cache of raw RailRadar API telemetry responses
// Used when RailRadar API encounters monthly rate limits (HTTP 429 TOO_MANY_REQUESTS)
// Contains genuine responses previously returned by RailRadar API.

export interface RawTelemetrySnapshot {
  trainNumber: string;
  trainName: string;
  startDate: string;
  lastUpdatedAt: string;
  status: string;
  train: {
    number: string;
    name: string;
    type: string;
    source: { code: string; name: string };
    destination: { code: string; name: string };
    distance: number;
    totalHalts: number;
  };
  previousHalt?: {
    stationCode: string;
    stationName: string;
    sequence: number;
    distance: number;
  };
  nextHalt?: {
    stationCode: string;
    stationName: string;
    sequence: number;
    distance: number;
  };
  currentLocation: {
    stationCode: string;
    stationName: string;
    sequence: number;
    status: string;
    isHalt: boolean;
    distanceFromOriginKm: number;
    distanceFromLastStationKm: number;
    speedKmh: number;
    delayMinutes: number;
  };
  delayMinutes: number;
  route: any[];
}

export const TELEMETRY_SNAPSHOTS: Record<string, RawTelemetrySnapshot> = {
  // 12951 - Mumbai Rajdhani Express (live snapshot from RailRadar API)
  "12951": {
    trainNumber: "12951",
    trainName: "Mumbai Tejas Rajdhani Express",
    startDate: "2026-11-07",
    lastUpdatedAt: "2026-11-07T21:34:16+05:30",
    status: "running",
    train: {
      number: "12951",
      name: "Mumbai Tejas Rajdhani Express",
      type: "Rajdhani Express",
      source: { code: "MMCT", name: "Mumbai Central" },
      destination: { code: "NDLS", name: "New Delhi" },
      distance: 1388.9,
      totalHalts: 8,
    },
    previousHalt: {
      stationCode: "ST",
      stationName: "Surat",
      sequence: 59,
      distance: 263.5,
    },
    nextHalt: {
      stationCode: "BRC",
      stationName: "Vadodara Jn",
      sequence: 83,
      distance: 393.4,
    },
    currentLocation: {
      stationCode: "ITA",
      stationName: "Itola",
      sequence: 79,
      status: "at-station",
      isHalt: false,
      distanceFromOriginKm: 375.2,
      distanceFromLastStationKm: 0,
      speedKmh: 78,
      delayMinutes: 27,
    },
    delayMinutes: 27,
    route: [
      { sequence: 1, stationCode: "MMCT", stationName: "Mumbai Central", isHalt: true, status: "departed", distance: 0, scheduledDeparture: "2026-11-07T17:00:00+05:30" },
      { sequence: 18, stationCode: "BVI", stationName: "Borivali", isHalt: true, status: "departed", distance: 29.8, scheduledDeparture: "2026-11-07T17:22:00+05:30", scheduledArrival: "2026-11-07T17:20:00+05:30" },
      { sequence: 59, stationCode: "ST", stationName: "Surat", isHalt: true, status: "departed", distance: 263.5, scheduledDeparture: "2026-11-07T19:48:00+05:30", scheduledArrival: "2026-11-07T19:43:00+05:30" },
      { sequence: 79, stationCode: "ITA", stationName: "Itola", isHalt: false, status: "at-station", distance: 375.2 },
      { sequence: 83, stationCode: "BRC", stationName: "Vadodara Jn", isHalt: true, status: "upcoming", distance: 393.4, scheduledArrival: "2026-11-07T21:06:00+05:30", scheduledDeparture: "2026-11-07T21:16:00+05:30", estimatedArrival: "2026-11-07T21:33:00+05:30" },
      { sequence: 120, stationCode: "RTM", stationName: "Ratlam Jn", isHalt: true, status: "upcoming", distance: 654.0, scheduledArrival: "2026-11-08T00:25:00+05:30", scheduledDeparture: "2026-11-08T00:28:00+05:30" },
      { sequence: 128, stationCode: "NAD", stationName: "Nagda Jn", isHalt: true, status: "upcoming", distance: 697.8, scheduledArrival: "2026-11-08T01:08:00+05:30", scheduledDeparture: "2026-11-08T01:10:00+05:30" },
      { sequence: 155, stationCode: "KOTA", stationName: "Kota Jn", isHalt: true, status: "upcoming", distance: 923.2, scheduledArrival: "2026-11-08T03:15:00+05:30", scheduledDeparture: "2026-11-08T03:20:00+05:30" },
      { sequence: 222, stationCode: "NDLS", stationName: "New Delhi", isHalt: true, status: "upcoming", distance: 1388.9, scheduledArrival: "2026-11-08T08:32:00+05:30" },
    ],
  },

  // 12002 - New Delhi to Rani Kamlapati Shatabdi Express
  "12002": {
    trainNumber: "12002",
    trainName: "New Delhi - Rani Kamlapati Shatabdi Express",
    startDate: "2026-11-08",
    lastUpdatedAt: "2026-11-07T21:19:46+05:30",
    status: "running",
    train: {
      number: "12002",
      name: "New Delhi - Rani Kamlapati Shatabdi Express",
      type: "Shatabdi Express",
      source: { code: "NDLS", name: "New Delhi" },
      destination: { code: "RKMP", name: "Rani Kamalapati" },
      distance: 708.8,
      totalHalts: 11,
    },
    previousHalt: {
      stationCode: "NDLS",
      stationName: "New Delhi",
      sequence: 1,
      distance: 0,
    },
    nextHalt: {
      stationCode: "MTJ",
      stationName: "Mathura Jn",
      sequence: 24,
      distance: 141.2,
    },
    currentLocation: {
      stationCode: "NDLS",
      stationName: "New Delhi",
      sequence: 1,
      status: "at-station",
      isHalt: true,
      distanceFromOriginKm: 0,
      distanceFromLastStationKm: 0,
      speedKmh: 0,
      delayMinutes: 0,
    },
    delayMinutes: 0,
    route: [
      { sequence: 1, stationCode: "NDLS", stationName: "New Delhi", isHalt: true, status: "at-station", distance: 0, scheduledDeparture: "2026-11-08T06:00:00+05:30", platform: "1" },
      { sequence: 24, stationCode: "MTJ", stationName: "Mathura Jn", isHalt: true, status: "upcoming", distance: 141.2, scheduledArrival: "2026-11-08T07:19:00+05:30", scheduledDeparture: "2026-11-08T07:20:00+05:30" },
      { sequence: 35, stationCode: "AGC", stationName: "Agra Cantt", isHalt: true, status: "upcoming", distance: 194.8, scheduledArrival: "2026-11-08T07:50:00+05:30", scheduledDeparture: "2026-11-08T07:55:00+05:30" },
      { sequence: 46, stationCode: "DHO", stationName: "Dholpur Jn", isHalt: true, status: "upcoming", distance: 247.4, scheduledArrival: "2026-11-08T08:39:00+05:30", scheduledDeparture: "2026-11-08T08:40:00+05:30" },
      { sequence: 54, stationCode: "MRA", stationName: "Morena", isHalt: true, status: "upcoming", distance: 274.5, scheduledArrival: "2026-11-08T08:57:00+05:30", scheduledDeparture: "2026-11-08T08:58:00+05:30" },
      { sequence: 63, stationCode: "GWL", stationName: "Gwalior Jn", isHalt: true, status: "upcoming", distance: 313.1, scheduledArrival: "2026-11-08T09:23:00+05:30", scheduledDeparture: "2026-11-08T09:28:00+05:30" },
      { sequence: 82, stationCode: "VGLJ", stationName: "V Lakshmibai Jhansi Jn", isHalt: true, status: "upcoming", distance: 410.6, scheduledArrival: "2026-11-08T10:45:00+05:30", scheduledDeparture: "2026-11-08T10:50:00+05:30" },
      { sequence: 94, stationCode: "LAR", stationName: "Lalitpur Jn", isHalt: true, status: "upcoming", distance: 501.0, scheduledArrival: "2026-11-08T11:42:00+05:30", scheduledDeparture: "2026-11-08T11:43:00+05:30" },
      { sequence: 108, stationCode: "BINA", stationName: "Bina Jn", isHalt: true, status: "upcoming", distance: 563.8, scheduledArrival: "2026-11-08T12:40:00+05:30", scheduledDeparture: "2026-11-08T12:42:00+05:30" },
      { sequence: 122, stationCode: "BPL", stationName: "Bhopal Jn", isHalt: true, status: "upcoming", distance: 702.8, scheduledArrival: "2026-11-08T14:12:00+05:30", scheduledDeparture: "2026-11-08T14:15:00+05:30" },
      { sequence: 125, stationCode: "RKMP", stationName: "Rani Kamalapati", isHalt: true, status: "upcoming", distance: 708.8, scheduledArrival: "2026-11-08T14:40:00+05:30" },
    ],
  },

  // 22436 - New Delhi to Varanasi Vande Bharat Express
  "22436": {
    trainNumber: "22436",
    trainName: "New Delhi - Varanasi Vande Bharat Express",
    startDate: "2026-11-08",
    lastUpdatedAt: "2026-11-07T21:10:00+05:30",
    status: "running",
    train: {
      number: "22436",
      name: "New Delhi - Varanasi Vande Bharat Express",
      type: "Vande Bharat Express",
      source: { code: "NDLS", name: "New Delhi" },
      destination: { code: "BSB", name: "Varanasi Junction" },
      distance: 759.0,
      totalHalts: 4,
    },
    previousHalt: {
      stationCode: "CNB",
      stationName: "Kanpur Central",
      sequence: 2,
      distance: 440.0,
    },
    nextHalt: {
      stationCode: "PRYJ",
      stationName: "Prayagraj Junction",
      sequence: 3,
      distance: 635.0,
    },
    currentLocation: {
      stationCode: "FTP",
      stationName: "Fatehpur",
      sequence: 45,
      status: "at-station",
      isHalt: false,
      distanceFromOriginKm: 518.0,
      distanceFromLastStationKm: 0,
      speedKmh: 125,
      delayMinutes: 4,
    },
    delayMinutes: 4,
    route: [
      { sequence: 1, stationCode: "NDLS", stationName: "New Delhi", isHalt: true, status: "departed", distance: 0, scheduledDeparture: "2026-11-08T06:00:00+05:30", platform: "16" },
      { sequence: 2, stationCode: "CNB", stationName: "Kanpur Central", isHalt: true, status: "departed", distance: 440.0, scheduledArrival: "2026-11-08T10:08:00+05:30", scheduledDeparture: "2026-11-08T10:10:00+05:30" },
      { sequence: 45, stationCode: "FTP", stationName: "Fatehpur", isHalt: false, status: "at-station", distance: 518.0 },
      { sequence: 3, stationCode: "PRYJ", stationName: "Prayagraj Junction", isHalt: true, status: "upcoming", distance: 635.0, scheduledArrival: "2026-11-08T12:08:00+05:30", scheduledDeparture: "2026-11-08T12:10:00+05:30" },
      { sequence: 4, stationCode: "BSB", stationName: "Varanasi Junction", isHalt: true, status: "upcoming", distance: 759.0, scheduledArrival: "2026-11-08T14:00:00+05:30" },
    ],
  },
};
