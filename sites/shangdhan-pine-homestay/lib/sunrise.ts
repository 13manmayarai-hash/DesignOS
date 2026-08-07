// Approximate sunrise time for the property, computed locally from the
// public-domain sunrise equation (as published by the US Naval Observatory
// and NOAA's Solar Calculator). This is real astronomical math, not a fake
// "live" reading -- there is no weather API and no claim of real-time sky
// conditions, per the build brief.
//
// Coordinates approximate Lower Kaffer via the Kalimpong town reference
// point (precise village-level coordinates were not available); error from
// this is on the order of a minute or two of sunrise time, which is why
// the UI always labels the result "approximate."
export const PROPERTY_LOCATION = {
  latitude: 27.0605,
  longitude: 88.4707,
  utcOffsetHours: 5.5, // IST
};

const SUNRISE_ZENITH = 90.833; // includes standard atmospheric refraction + solar radius

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86_400_000) + 1;
}

/**
 * Returns the approximate local sunrise time for the given date, or `null`
 * if the sun does not rise/set that day (not expected at this latitude).
 */
export function approximateSunrise(
  date: Date,
  location: { latitude: number; longitude: number; utcOffsetHours: number } = PROPERTY_LOCATION
): { hours: number; minutes: number } | null {
  const { latitude, longitude, utcOffsetHours } = location;
  const n = dayOfYear(date);
  const lngHour = longitude / 15;
  const t = n + (6 - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L =
    M +
    1.916 * Math.sin(toRadians(M)) +
    0.02 * Math.sin(2 * toRadians(M)) +
    282.634;
  L = normalizeDegrees(L);

  let RA = toDegrees(Math.atan(0.91764 * Math.tan(toRadians(L))));
  RA = normalizeDegrees(RA);
  const lQuadrant = Math.floor(L / 90) * 90;
  const raQuadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (lQuadrant - raQuadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(toRadians(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(toRadians(SUNRISE_ZENITH)) - sinDec * Math.sin(toRadians(latitude))) /
    (cosDec * Math.cos(toRadians(latitude)));

  if (cosH > 1 || cosH < -1) return null; // no sunrise/sunset at this latitude/date

  const H = (360 - toDegrees(Math.acos(cosH))) / 15;

  const T = H + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  const local = ((UT + utcOffsetHours) % 24 + 24) % 24;
  const hours = Math.floor(local);
  const minutes = Math.round((local - hours) * 60);
  return minutes === 60 ? { hours: (hours + 1) % 24, minutes: 0 } : { hours, minutes };
}

export function formatSunriseTime(time: { hours: number; minutes: number }): string {
  const period = time.hours < 12 ? "AM" : "PM";
  const displayHours = time.hours % 12 === 0 ? 12 : time.hours % 12;
  const displayMinutes = time.minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

// Static seasonal calendar -- honest in place of a live "clear today" claim
// we have no data source for. Feb-Mar is the clearest window per the brief.
export const SEASONAL_NOTES: Record<number, { inWindow: boolean; note: string }> = {
  0: { inWindow: false, note: "misty mornings through the pines -- a quieter, slower start to the day" },
  1: { inWindow: true, note: "the clearest window of the year -- Kanchenjunga turning gold most mornings" },
  2: { inWindow: true, note: "still within the clearest window -- excellent sunrise odds" },
  3: { inWindow: false, note: "warming spring air, occasional haze -- sunrise still visible on clear mornings" },
  4: { inWindow: false, note: "pre-monsoon haze builds -- mornings are hit or miss" },
  5: { inWindow: false, note: "monsoon cloud cover -- the valley keeps its own quieter mood" },
  6: { inWindow: false, note: "deep monsoon -- mist and rain over mountain views" },
  7: { inWindow: false, note: "monsoon continues -- lush, green, low visibility" },
  8: { inWindow: false, note: "monsoon tapering -- skies begin clearing late in the month" },
  9: { inWindow: false, note: "post-monsoon clarity returning -- good odds by late October" },
  10: { inWindow: false, note: "crisp autumn air -- strong sunrise odds, just outside the peak window" },
  11: { inWindow: false, note: "clear winter mornings, cold -- reliable views, quieter season" },
};

export function seasonalNoteForDate(date: Date) {
  return SEASONAL_NOTES[date.getMonth()];
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
