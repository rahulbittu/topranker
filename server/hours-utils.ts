/**
 * Sprint 447: Hours-based utilities
 * Computes real-time open/closed status from Google Places openingHours format.
 */

interface Period {
  open: { day: number; time: string }; // day: 0=Sun, time: "0900"
  close?: { day: number; time: string };
}

interface OpeningHours {
  weekday_text?: string[];
  periods?: Period[];
}

interface OpenStatus {
  isOpen: boolean;
  closingTime: string | null;  // "21:00" format
  nextOpenTime: string | null; // "09:00" format
  todayHours: string | null;   // "11:00 AM – 10:00 PM"
}

/**
 * Compute real-time open/closed status from openingHours JSON.
 * Uses Central Time (America/Chicago) for Dallas businesses.
 */
export function computeOpenStatus(hours: OpeningHours | null | undefined, now?: Date): OpenStatus {
  const fallback: OpenStatus = { isOpen: false, closingTime: null, nextOpenTime: null, todayHours: null };
  if (!hours || !hours.periods || hours.periods.length === 0) return fallback;

  const d = now || new Date();
  // Convert to Central Time
  const ct = new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const dayOfWeek = ct.getDay(); // 0=Sun
  const currentTime = ct.getHours() * 100 + ct.getMinutes(); // e.g. 1430

  // Check if 24-hour (single period with no close)
  if (hours.periods.length === 1 && !hours.periods[0].close) {
    return { isOpen: true, closingTime: null, nextOpenTime: null, todayHours: "Open 24 hours" };
  }

  // Find today's hours text
  const todayHours = hours.weekday_text
    ? hours.weekday_text[dayOfWeek === 0 ? 6 : dayOfWeek - 1] || null // weekday_text is Mon-Sun
    : null;

  // Check if currently open
  for (const period of hours.periods) {
    if (!period.close) continue;
    const openDay = period.open.day;
    const closeDay = period.close.day;
    const openTime = parseInt(period.open.time, 10);
    const closeTime = parseInt(period.close.time, 10);

    // Same-day period
    if (openDay === dayOfWeek && closeDay === dayOfWeek) {
      if (currentTime >= openTime && currentTime < closeTime) {
        return {
          isOpen: true,
          closingTime: formatTime(period.close.time),
          nextOpenTime: null,
          todayHours,
        };
      }
    }

    // Overnight period (e.g. open Fri at 1700, close Sat at 0200)
    if (openDay === dayOfWeek && closeDay !== dayOfWeek && currentTime >= openTime) {
      return {
        isOpen: true,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours,
      };
    }
    // Check if we're in the overnight close window
    const prevDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (openDay === prevDay && closeDay === dayOfWeek && currentTime < closeTime) {
      return {
        isOpen: true,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours,
      };
    }
  }

  // Not open — find next open time
  let nextOpen: string | null = null;
  for (const period of hours.periods) {
    if (period.open.day === dayOfWeek && parseInt(period.open.time, 10) > currentTime) {
      nextOpen = formatTime(period.open.time);
      break;
    }
  }
  if (!nextOpen) {
    // Check next days
    for (let offset = 1; offset <= 7; offset++) {
      const checkDay = (dayOfWeek + offset) % 7;
      const nextPeriod = hours.periods.find(p => p.open.day === checkDay);
      if (nextPeriod) {
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][checkDay];
        nextOpen = `${dayName} ${formatTime(nextPeriod.open.time)}`;
        break;
      }
    }
  }

  return { isOpen: false, closingTime: null, nextOpenTime: nextOpen, todayHours };
}

function formatTime(time: string): string {
  const h = parseInt(time.slice(0, 2), 10);
  const m = time.slice(2);
  return `${h.toString().padStart(2, "0")}:${m}`;
}

/**
 * Check if a business is open late (has closing time at or after 22:00 / 10 PM).
 */
export function isOpenLate(hours: OpeningHours | null | undefined): boolean {
  if (!hours || !hours.periods) return false;
  return hours.periods.some(p => {
    if (!p.close) return true; // 24-hour
    const closeTime = parseInt(p.close.time, 10);
    return closeTime >= 2200 || closeTime <= 200; // closes at/after 10pm or after midnight
  });
}

/**
 * Check if a business is open on weekends (has Saturday or Sunday periods).
 */
export function isOpenWeekends(hours: OpeningHours | null | undefined): boolean {
  if (!hours || !hours.periods) return false;
  return hours.periods.some(p => p.open.day === 0 || p.open.day === 6); // Sun=0, Sat=6
}
