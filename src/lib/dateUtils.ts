/**
 * Pure date/time helpers shared across views.
 *
 * Everything here operates on the **local** timezone, matching how the app
 * records and displays intakes. Keeping these helpers free of React and DOM
 * dependencies makes them straightforward to unit test.
 */

export const pad2 = (value: number): string => value.toString().padStart(2, "0");

/** Formats a Date as a local `YYYY-MM-DD` key. */
export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** True when both dates fall on the same local calendar day (time is ignored). */
export const isSameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Formats a Date as a local `HH:mm` value for an `<input type="time">`. */
export const formatTimeForInput = (date: Date): string =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

/**
 * Combines local date (`YYYY-MM-DD`) and time (`HH:mm`) strings into a
 * timestamp. Returns `NaN` when the input cannot be parsed.
 */
export const parseLocalDateTime = (dateStr: string, timeStr: string): number => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).getTime();
};

/** Human-friendly "Today" / "Yesterday" / long-date label for a timestamp. */
export const formatDateHeader = (timestamp: number, reference: Date = new Date()): string => {
  const date = new Date(timestamp);
  const yesterday = new Date(reference);
  yesterday.setDate(reference.getDate() - 1);

  if (isSameLocalDay(date, reference)) return "Today";
  if (isSameLocalDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** Localized time of day, e.g. `9:05 AM`. */
export const formatTimeOfDay = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/** Localized long date, e.g. `October 11, 2026`. */
export const formatLongDate = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** Returns a copy of the records sorted newest first (input is not mutated). */
export const sortRecordsByTimestampDesc = <T extends { timestamp: number }>(records: T[]): T[] =>
  [...records].sort((a, b) => b.timestamp - a.timestamp);

/** Returns the records that fall on the same local day as `date`. */
export const filterRecordsByLocalDay = <T extends { timestamp: number }>(
  records: T[],
  date: Date,
): T[] => records.filter((record) => isSameLocalDay(new Date(record.timestamp), date));

/**
 * Returns the records that fall on the current local day. The implicit clock
 * read lives here so callers stay free of render-time `new Date()` calls.
 */
export const filterRecordsByToday = <T extends { timestamp: number }>(records: T[]): T[] =>
  filterRecordsByLocalDay(records, new Date());

/** Set of local `YYYY-MM-DD` keys that have at least one record. */
export const getRecordDateKeys = <T extends { timestamp: number }>(records: T[]): Set<string> => {
  const keys = new Set<string>();
  records.forEach((record) => keys.add(toLocalDateKey(new Date(record.timestamp))));
  return keys;
};

/**
 * Consecutive days ending today (or, when today has no record yet, yesterday)
 * with at least one record. A gap anywhere before that ends the streak.
 */
export const getStreakDays = <T extends { timestamp: number }>(records: T[]): number => {
  if (records.length === 0) return 0;
  // Noon anchors each probe to an unambiguous calendar day across DST shifts.
  const serial = (ts: number) => {
    const d = new Date(ts);
    return d.getFullYear() * 10_000 + (d.getMonth() + 1) * 100 + d.getDate();
  };
  const days = new Set(records.map((r) => serial(r.timestamp)));
  const probe = new Date();
  probe.setHours(12, 0, 0, 0);
  if (!days.has(serial(probe.getTime()))) probe.setDate(probe.getDate() - 1);
  let count = 0;
  while (days.has(serial(probe.getTime()))) {
    count += 1;
    probe.setDate(probe.getDate() - 1);
  }
  return count;
};
