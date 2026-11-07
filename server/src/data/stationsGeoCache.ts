/**
 * Station Geo-Cache
 * Provides lat/lng for major Indian railway stations.
 * RailRadar halt objects do NOT include coordinates, so we resolve them here.
 * Unknown stations get coordinates interpolated from the route GeoJSON linestring.
 */

export interface StationGeo {
  lat: number;
  lng: number;
  name?: string;
  zone?: string;
}

export const STATIONS_GEO: Record<string, StationGeo> = {
  // ── WESTERN RAILWAY ─────────────────────────────────────────────────────
  MMCT: { lat: 18.9696, lng: 72.8193, name: "Mumbai Central", zone: "WR" },
  BDTS: { lat: 19.0601, lng: 72.8370, name: "Bandra Terminus", zone: "WR" },
  BVI:  { lat: 19.2288, lng: 72.8574, name: "Borivali", zone: "WR" },
  VR:   { lat: 19.3764, lng: 72.8311, name: "Virar", zone: "WR" },
  BSR:  { lat: 19.5908, lng: 72.7988, name: "Vasai Road", zone: "WR" },
  BH:   { lat: 20.3000, lng: 72.9500, name: "Bharuch", zone: "WR" },
  ST:   { lat: 21.2049, lng: 72.8407, name: "Surat", zone: "WR" },
  BRC:  { lat: 22.3107, lng: 73.1812, name: "Vadodara Junction", zone: "WR" },
  ADI:  { lat: 23.0258, lng: 72.5873, name: "Ahmedabad Junction", zone: "WR" },
  RTM:  { lat: 23.3441, lng: 75.0357, name: "Ratlam Junction", zone: "WR" },
  KOTA: { lat: 25.2138, lng: 75.8648, name: "Kota Junction", zone: "WCR" },
  SWM:  { lat: 25.9928, lng: 76.3683, name: "Sawai Madhopur", zone: "WCR" },
  JP:   { lat: 26.9124, lng: 75.7873, name: "Jaipur Junction", zone: "NWR" },
  MTJ:  { lat: 27.4924, lng: 77.6737, name: "Mathura Junction", zone: "NCR" },
  AGC:  { lat: 27.1767, lng: 78.0081, name: "Agra Cantt", zone: "NCR" },

  // ── CENTRAL RAILWAY ──────────────────────────────────────────────────────
  CSMT: { lat: 18.9398, lng: 72.8355, name: "Mumbai CSMT", zone: "CR" },
  KYN:  { lat: 19.2355, lng: 73.0588, name: "Kalyan Junction", zone: "CR" },
  PUNE: { lat: 18.5276, lng: 73.8745, name: "Pune Junction", zone: "CR" },
  BSL:  { lat: 21.0074, lng: 74.7418, name: "Bhusaval Junction", zone: "CR" },
  NGP:  { lat: 21.1458, lng: 79.0882, name: "Nagpur", zone: "CR" },
  WD:   { lat: 21.2167, lng: 79.1167, name: "Wardha Junction", zone: "CR" },
  SEG:  { lat: 20.0459, lng: 77.3092, name: "Hingoli Deccan", zone: "SCR" },

  // ── NORTHERN RAILWAY ─────────────────────────────────────────────────────
  NDLS: { lat: 28.6415, lng: 77.2207, name: "New Delhi", zone: "NR" },
  NZM:  { lat: 28.5726, lng: 77.2622, name: "Hazrat Nizamuddin", zone: "NR" },
  DLI:  { lat: 28.6579, lng: 77.2302, name: "Old Delhi Junction", zone: "NR" },
  SZM:  { lat: 28.6677, lng: 77.1922, name: "Sadar Bazar", zone: "NR" },
  GZB:  { lat: 28.6692, lng: 77.4287, name: "Ghaziabad Junction", zone: "NR" },
  ALJN: { lat: 27.8974, lng: 78.0821, name: "Aligarh Junction", zone: "NR" },
  TDL:  { lat: 27.2081, lng: 78.2394, name: "Tundla Junction", zone: "NR" },
  CNB:  { lat: 26.4539, lng: 80.3512, name: "Kanpur Central", zone: "NCR" },
  LKO:  { lat: 26.8322, lng: 80.9177, name: "Lucknow Charbagh", zone: "NR" },
  LJN:  { lat: 26.8465, lng: 80.9280, name: "Lucknow NER", zone: "NER" },
  PRYJ: { lat: 25.4437, lng: 81.8286, name: "Prayagraj Junction", zone: "NCR" },
  BSB:  { lat: 25.3284, lng: 82.9868, name: "Varanasi Junction", zone: "NER" },
  MGS:  { lat: 25.3669, lng: 83.1151, name: "Mughal Sarai Jn", zone: "ECR" },
  DDU:  { lat: 25.5698, lng: 83.4583, name: "Pt DD Upadhyaya Jn", zone: "ECR" },
  ALD:  { lat: 25.4477, lng: 81.8316, name: "Prayagraj Allahabad Jn", zone: "NCR" },
  FBD:  { lat: 27.1474, lng: 78.3952, name: "Firozabad", zone: "NCR" },
  ETW:  { lat: 26.7821, lng: 79.0123, name: "Etawah Junction", zone: "NCR" },
  AMRE: { lat: 26.5185, lng: 80.0540, name: "Auraiya", zone: "NCR" },
  PNBE: { lat: 25.6113, lng: 85.1427, name: "Patna Junction", zone: "ECR" },
  RJPB: { lat: 25.6214, lng: 85.1344, name: "Rajendra Nagar", zone: "ECR" },
  GAYA: { lat: 24.7955, lng: 85.0022, name: "Gaya Junction", zone: "ECR" },

  // ── EASTERN / NORTHEAST FRONTIER ─────────────────────────────────────────
  HWH:  { lat: 22.5839, lng: 88.3425, name: "Howrah Junction", zone: "ER" },
  SDAH: { lat: 22.5751, lng: 88.3680, name: "Sealdah", zone: "ER" },
  KOAA: { lat: 22.5496, lng: 88.3350, name: "Kolkata", zone: "ER" },
  ASN:  { lat: 23.6826, lng: 86.9757, name: "Asansol Junction", zone: "ER" },
  DHN:  { lat: 23.7984, lng: 86.4345, name: "Dhanbad Junction", zone: "ECR" },
  BKSC: { lat: 23.6693, lng: 86.1526, name: "Bokaro Steel City", zone: "SER" },
  RNC:  { lat: 23.3441, lng: 85.3096, name: "Ranchi", zone: "SER" },
  GHY:  { lat: 26.1925, lng: 91.7458, name: "Guwahati", zone: "NFR" },
  DBRG: { lat: 27.4751, lng: 94.9024, name: "Dibrugarh", zone: "NFR" },
  MLDT: { lat: 25.1363, lng: 88.1300, name: "Malda Town", zone: "NFR" },
  NJP:  { lat: 26.7046, lng: 88.4034, name: "New Jalpaiguri", zone: "NFR" },
  KIR:  { lat: 25.5466, lng: 87.5805, name: "Katihar Junction", zone: "NFR" },
  BGP:  { lat: 25.2369, lng: 86.9842, name: "Bhagalpur", zone: "ECR" },
  SPJ:  { lat: 25.8692, lng: 85.8048, name: "Samastipur Junction", zone: "ECR" },
  MFP:  { lat: 26.1193, lng: 85.3908, name: "Muzaffarpur Junction", zone: "ECR" },
  CPR:  { lat: 25.7892, lng: 84.9892, name: "Chhapra Junction", zone: "ECR" },
  SHC:  { lat: 25.5648, lng: 85.6218, name: "Sitamarhi", zone: "ECR" },

  // ── SOUTH CENTRAL / SOUTH ────────────────────────────────────────────────
  SC:   { lat: 17.4336, lng: 78.5002, name: "Secunderabad Junction", zone: "SCR" },
  HYB:  { lat: 17.3891, lng: 78.4765, name: "Hyderabad Deccan", zone: "SCR" },
  NED:  { lat: 18.3384, lng: 76.8186, name: "Nanded", zone: "SCR" },
  PGT:  { lat: 10.5276, lng: 76.2144, name: "Palakkad Junction", zone: "SR" },
  TVC:  { lat: 8.4855, lng: 76.9492, name: "Thiruvananthapuram Central", zone: "SR" },
  ERS:  { lat: 9.9816, lng: 76.2999, name: "Ernakulam Junction", zone: "SR" },
  SRR:  { lat: 10.0632, lng: 76.3327, name: "Shoranur Junction", zone: "SR" },
  CLT:  { lat: 11.2588, lng: 75.7804, name: "Kozhikode", zone: "SR" },
  CAN:  { lat: 11.9988, lng: 75.3706, name: "Kannur", zone: "SR" },
  MAQ:  { lat: 12.8695, lng: 74.8428, name: "Mangaluru Central", zone: "SR" },
  UBL:  { lat: 15.3647, lng: 75.1240, name: "Hubballi Junction", zone: "SWR" },
  SBC:  { lat: 12.9767, lng: 77.5713, name: "KSR Bengaluru City", zone: "SWR" },
  YPR:  { lat: 13.0196, lng: 77.5536, name: "Yesvantpur Junction", zone: "SWR" },
  SL:   { lat: 13.3399, lng: 77.1064, name: "Tumkur", zone: "SWR" },
  MYS:  { lat: 12.3080, lng: 76.6456, name: "Mysuru Junction", zone: "SWR" },
  MAS:  { lat: 13.0836, lng: 80.2824, name: "Chennai Central", zone: "SR" },
  MS:   { lat: 13.0012, lng: 80.1798, name: "Chennai Egmore", zone: "SR" },
  MDU:  { lat: 9.9195, lng: 78.1197, name: "Madurai Junction", zone: "SR" },
  NCJ:  { lat: 10.7626, lng: 78.8098, name: "Tiruchchirappalli Jn", zone: "SR" },
  TEN:  { lat: 8.8963, lng: 77.4681, name: "Tirunelveli Junction", zone: "SR" },
  CBE:  { lat: 11.0017, lng: 76.9674, name: "Coimbatore Junction", zone: "SR" },
  SA:   { lat: 11.6646, lng: 78.1460, name: "Salem Junction", zone: "SR" },
  ED:   { lat: 11.3399, lng: 77.7172, name: "Erode Junction", zone: "SR" },
  VM:   { lat: 11.9401, lng: 79.3129, name: "Villupuram Junction", zone: "SR" },
  RU:   { lat: 12.9262, lng: 79.3214, name: "Ranipet", zone: "SR" },
  AJJ:  { lat: 13.0012, lng: 79.3523, name: "Arakkonam Junction", zone: "SR" },
  RMM:  { lat: 9.2884, lng: 79.3129, name: "Rameswaram", zone: "SR" },
  TUT:  { lat: 8.8042, lng: 78.1348, name: "Thoothukudi", zone: "SR" },
  OTP:  { lat: 13.3677, lng: 80.2026, name: "Otteri", zone: "SR" },
  PDY:  { lat: 11.9139, lng: 79.8145, name: "Puducherry", zone: "SR" },
  VSKP: { lat: 17.6868, lng: 83.2185, name: "Visakhapatnam", zone: "ECoR" },
  BZA:  { lat: 16.5193, lng: 80.6202, name: "Vijayawada Junction", zone: "SCR" },
  TPTY: { lat: 13.6288, lng: 79.4192, name: "Tirupati", zone: "SCR" },
  GNT:  { lat: 16.3167, lng: 80.4500, name: "Guntur Junction", zone: "SCR" },
  NLDA: { lat: 16.4484, lng: 79.2667, name: "Naalgonda", zone: "SCR" },
  GTL:  { lat: 15.1521, lng: 77.3573, name: "Guntakal Junction", zone: "SCR" },
  RU2:  { lat: 15.3536, lng: 75.5981, name: "Harihar", zone: "SWR" },
  HX:   { lat: 15.1711, lng: 76.9241, name: "Hospet Junction", zone: "SWR" },
  BAY:  { lat: 15.1446, lng: 76.9243, name: "Ballari Junction", zone: "SCR" },

  // ── RAJASTHAN / NWR ────────────────────────────────────────────────────────
  BKN:  { lat: 28.0229, lng: 73.3119, name: "Bikaner Junction", zone: "NWR" },
  JU:   { lat: 26.2706, lng: 73.0243, name: "Jodhpur Junction", zone: "NWR" },
  AII:  { lat: 26.4499, lng: 74.6244, name: "Ajmer Junction", zone: "NWR" },
  UDZ:  { lat: 24.5854, lng: 73.7125, name: "Udaipur City", zone: "NWR" },
  JSLM: { lat: 26.9157, lng: 70.9083, name: "Jaisalmer", zone: "NWR" },
  ABR:  { lat: 25.3473, lng: 72.6349, name: "Abu Road", zone: "NWR" },
  PNU:  { lat: 25.0000, lng: 73.5167, name: "Pindwara", zone: "NWR" },

  // ── MADHYA PRADESH / WCR ───────────────────────────────────────────────────
  BPL:  { lat: 23.2635, lng: 77.4126, name: "Bhopal Junction", zone: "WCR" },
  HBJ:  { lat: 23.2420, lng: 77.4090, name: "Habibganj / Rani Kamlapati", zone: "WCR" },
  ET:   { lat: 23.1800, lng: 77.0220, name: "Itarsi Junction", zone: "WCR" },
  JBP:  { lat: 23.1687, lng: 79.9341, name: "Jabalpur Junction", zone: "WCR" },
  STA:  { lat: 24.5868, lng: 80.8328, name: "Satna", zone: "WCR" },
  KTE:  { lat: 23.8278, lng: 80.3975, name: "Katni Junction", zone: "WCR" },
  BINA: { lat: 24.1727, lng: 78.1455, name: "Bina Junction", zone: "WCR" },
  UJN:  { lat: 23.1793, lng: 75.7849, name: "Ujjain Junction", zone: "WR" },
  NAD:  { lat: 23.3327, lng: 77.1113, name: "Narsinghpur", zone: "WCR" },

  // ── GUJARAT ─────────────────────────────────────────────────────────────────
  VG:   { lat: 21.1702, lng: 72.8311, name: "Surat Old", zone: "WR" },
  VRL:  { lat: 20.9042, lng: 70.3697, name: "Veraval", zone: "WR" },
  RJT:  { lat: 22.3059, lng: 70.8022, name: "Rajkot Junction", zone: "WR" },
  OKHA: { lat: 22.4653, lng: 69.0725, name: "Okha", zone: "WR" },
  PBR:  { lat: 21.6230, lng: 69.6097, name: "Porbandar", zone: "WR" },
  VDA:  { lat: 20.4283, lng: 72.9230, name: "Vapi", zone: "WR" },
  NDB:  { lat: 23.8880, lng: 72.8793, name: "Mahesana Junction", zone: "WR" },
  SBI:  { lat: 23.5880, lng: 72.3686, name: "Sabarmati Junction", zone: "WR" },
  CDG:  { lat: 23.0288, lng: 72.6000, name: "Chandlodiya", zone: "WR" },
  AMDI: { lat: 22.5724, lng: 72.9550, name: "Anand Junction", zone: "WR" },

  // ── UTTARAKHAND / HIMACHAL / J&K ─────────────────────────────────────────
  HW:   { lat: 29.9457, lng: 78.1642, name: "Haridwar Junction", zone: "NR" },
  DED:  { lat: 29.9538, lng: 78.0488, name: "Dehradun", zone: "NR" },
  SHM:  { lat: 29.6650, lng: 77.4580, name: "Shamli", zone: "NR" },
  SVDK: { lat: 32.9893, lng: 74.9436, name: "Shri Mata Vaishno Devi Katra", zone: "NR" },
  JAT:  { lat: 32.7266, lng: 74.8570, name: "Jammu Tawi", zone: "NR" },
  UHL:  { lat: 31.7673, lng: 76.5320, name: "Una Himachal", zone: "NR" },
  CDH:  { lat: 32.0998, lng: 76.3812, name: "Chandigarh", zone: "NR" },
  UMB:  { lat: 30.3752, lng: 76.9270, name: "Ambala Cantt", zone: "NR" },
  LDH:  { lat: 30.9000, lng: 75.8573, name: "Ludhiana Junction", zone: "NR" },
  ASR:  { lat: 31.6267, lng: 74.8723, name: "Amritsar Junction", zone: "NR" },
  FZR:  { lat: 30.9218, lng: 74.6180, name: "Firozpur Cantt", zone: "NR" },
  SLN:  { lat: 30.9087, lng: 75.1596, name: "Sultanpur", zone: "NR" },
  PTA:  { lat: 30.3406, lng: 76.3869, name: "Patiala", zone: "NR" },
  BTI:  { lat: 30.2066, lng: 74.9578, name: "Bathinda Junction", zone: "NR" },
  ABL:  { lat: 30.3749, lng: 76.7749, name: "Ambala City", zone: "NR" },
  SRE:  { lat: 29.3176, lng: 77.7121, name: "Saharanpur", zone: "NR" },
  MBZ:  { lat: 29.2206, lng: 78.7712, name: "Moradabad", zone: "NER" },
  BE:   { lat: 28.3670, lng: 79.4113, name: "Bareilly Junction", zone: "NER" },
  SHN:  { lat: 28.5533, lng: 80.0770, name: "Shahjahanpur", zone: "NER" },

  // ── ODISHA / EASTERN COAST ────────────────────────────────────────────────
  BBS:  { lat: 20.2961, lng: 85.8245, name: "Bhubaneswar", zone: "ECoR" },
  PURI: { lat: 19.8104, lng: 85.8313, name: "Puri", zone: "ECoR" },
  CTC:  { lat: 20.4625, lng: 85.8830, name: "Cuttack", zone: "ECoR" },
  VSKP2: { lat: 17.6868, lng: 83.2185, name: "Visakhapatnam", zone: "ECoR" },
  ROU:  { lat: 22.2550, lng: 84.8536, name: "Rourkela", zone: "SER" },
  SBP:  { lat: 21.4799, lng: 83.9757, name: "Sambalpur", zone: "ECoR" },
  BRGV: { lat: 20.7050, lng: 83.5867, name: "Bolangir", zone: "ECoR" },
  BAM:  { lat: 20.7050, lng: 86.5500, name: "Bhadrak", zone: "ECoR" },
  BAL:  { lat: 21.4800, lng: 86.9200, name: "Balasore", zone: "SER" },
  KGP:  { lat: 22.3458, lng: 87.3194, name: "Kharagpur Junction", zone: "SER" },

  // ── NORTHEAST ────────────────────────────────────────────────────────────
  LMG:  { lat: 26.1760, lng: 91.7746, name: "Lumding Junction", zone: "NFR" },
  AGTL: { lat: 23.8370, lng: 91.2797, name: "Agartala", zone: "NFR" },
  SHL:  { lat: 25.5788, lng: 91.8933, name: "Shillong Road", zone: "NFR" },

  // ── CHHATTISGARH / JHARKHAND ─────────────────────────────────────────────
  R:    { lat: 21.2514, lng: 81.6296, name: "Raipur Junction", zone: "SECR" },
  BSP:  { lat: 22.0961, lng: 82.1442, name: "Bilaspur Junction", zone: "SECR" },
  G:    { lat: 22.1922, lng: 82.0121, name: "Gevra Road", zone: "SECR" },
  KMZ:  { lat: 20.6922, lng: 83.4283, name: "Kantabanji", zone: "ECoR" },
  RIG:  { lat: 22.8956, lng: 83.3899, name: "Raigarh", zone: "SECR" },
  JSG:  { lat: 23.1631, lng: 83.1398, name: "Jashpur", zone: "SECR" },
};

/**
 * Get coordinates for a station code.
 * Returns null if not in cache (caller should interpolate from route).
 */
export function getStationGeo(code: string): StationGeo | null {
  return STATIONS_GEO[code.toUpperCase()] ?? null;
}

/**
 * Interpolate coordinates along a GeoJSON LineString at a given distance from origin.
 * @param coords  Array of [lng, lat] coordinate pairs
 * @param targetDistanceKm  Distance from origin in km
 * @param totalDistanceKm   Total route distance (used to scale)
 */
export function interpolateCoordAtDistance(
  coords: [number, number][],
  targetDistanceKm: number,
  totalDistanceKm: number
): { lat: number; lng: number } {
  if (coords.length === 0) return { lat: 20.5, lng: 78.9 };
  if (coords.length === 1) return { lat: coords[0][1], lng: coords[0][0] };

  // Clamp target to valid range
  const target = Math.min(Math.max(0, targetDistanceKm), totalDistanceKm > 0 ? totalDistanceKm : 1e9);

  // Walk the route segment by segment using real haversine distance.
  // This is the CORRECT approach — the previous index-ratio method was wrong
  // because GeoJSON coordinates are NOT evenly spaced along the track.
  let cumDist = 0;
  for (let i = 1; i < coords.length; i++) {
    const lng0 = coords[i - 1][0], lat0 = coords[i - 1][1];
    const lng1 = coords[i][0],     lat1 = coords[i][1];
    const segKm = haversineSegmentKm(lat0, lng0, lat1, lng1);

    if (cumDist + segKm >= target) {
      // Target lies within this segment — interpolate linearly
      const remaining = target - cumDist;
      const frac = segKm > 0 ? remaining / segKm : 0;
      return {
        lat: lat0 + (lat1 - lat0) * frac,
        lng: lng0 + (lng1 - lng0) * frac,
      };
    }
    cumDist += segKm;
  }

  // Target exceeds route — return last coordinate
  const last = coords[coords.length - 1];
  return { lat: last[1], lng: last[0] };
}

/** Fast haversine for a single segment in km */
function haversineSegmentKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute compass bearing (0-360°) from point A to point B.
 */
export function computeBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(lng2 - lng1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
