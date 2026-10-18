import { describe, expect, it } from "vite-plus/test";
import {
  filterRecordsByLocalDay,
  filterRecordsByToday,
  formatDateHeader,
  formatLongDate,
  formatTimeForInput,
  formatTimeOfDay,
  getRecordDateKeys,
  getStreakDays,
  isSameLocalDay,
  pad2,
  parseLocalDateTime,
  sortRecordsByTimestampDesc,
  toLocalDateKey,
} from "./dateUtils";

describe("dateUtils", () => {
  describe("pad2", () => {
    it("pads single-digit numbers with a leading zero", () => {
      expect(pad2(9)).toBe("09");
      expect(pad2(0)).toBe("00");
    });

    it("leaves two-digit numbers unchanged", () => {
      expect(pad2(12)).toBe("12");
      expect(pad2(31)).toBe("31");
    });
  });

  describe("toLocalDateKey", () => {
    it("formats a date as a padded YYYY-MM-DD key", () => {
      expect(toLocalDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
      expect(toLocalDateKey(new Date(2026, 10, 23))).toBe("2026-11-23");
    });

    it("uses local calendar components (late evening stays the same day)", () => {
      expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
      expect(toLocalDateKey(new Date(2026, 0, 5, 0, 0))).toBe("2026-01-05");
    });
  });

  describe("isSameLocalDay", () => {
    it("ignores the time of day", () => {
      expect(isSameLocalDay(new Date(2026, 9, 11, 0, 0), new Date(2026, 9, 11, 23, 59))).toBe(true);
    });

    it("is false for adjacent days across midnight", () => {
      expect(isSameLocalDay(new Date(2026, 9, 11, 23, 59), new Date(2026, 9, 12, 0, 0))).toBe(
        false,
      );
    });

    it("is false for the same day-of-month in a different month", () => {
      expect(isSameLocalDay(new Date(2026, 9, 11), new Date(2026, 8, 11))).toBe(false);
    });

    it("is false for the same day and month in a different year", () => {
      expect(isSameLocalDay(new Date(2026, 9, 11), new Date(2025, 9, 11))).toBe(false);
    });
  });

  describe("formatTimeForInput", () => {
    it("formats a time as padded HH:mm", () => {
      expect(formatTimeForInput(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
      expect(formatTimeForInput(new Date(2026, 0, 1, 23, 59))).toBe("23:59");
    });

    it("formats midnight and noon correctly", () => {
      expect(formatTimeForInput(new Date(2026, 0, 1, 0, 0))).toBe("00:00");
      expect(formatTimeForInput(new Date(2026, 0, 1, 12, 0))).toBe("12:00");
    });
  });

  describe("parseLocalDateTime", () => {
    it("round-trips local date/time strings into a timestamp", () => {
      expect(parseLocalDateTime("2026-04-15", "14:30")).toBe(
        new Date(2026, 3, 15, 14, 30).getTime(),
      );
    });

    it("handles single-digit components", () => {
      expect(parseLocalDateTime("2026-01-05", "09:05")).toBe(new Date(2026, 0, 5, 9, 5).getTime());
    });

    it("is the inverse of the input formatters", () => {
      const date = new Date(2026, 6, 4, 8, 7);
      expect(parseLocalDateTime(toLocalDateKey(date), formatTimeForInput(date))).toBe(
        new Date(2026, 6, 4, 8, 7).getTime(),
      );
    });

    it("returns NaN for unparseable input", () => {
      expect(parseLocalDateTime("not-a-date", "not-a-time")).toBeNaN();
    });
  });

  describe("formatDateHeader", () => {
    const reference = new Date(2026, 9, 11, 12, 0);

    it("labels the reference day as Today regardless of time", () => {
      expect(formatDateHeader(new Date(2026, 9, 11, 0, 1).getTime(), reference)).toBe("Today");
      expect(formatDateHeader(new Date(2026, 9, 11, 23, 59).getTime(), reference)).toBe("Today");
    });

    it("labels the previous day as Yesterday", () => {
      expect(formatDateHeader(new Date(2026, 9, 10, 23, 59).getTime(), reference)).toBe(
        "Yesterday",
      );
      expect(formatDateHeader(new Date(2026, 9, 10, 0, 0).getTime(), reference)).toBe("Yesterday");
    });

    it("falls back to a long localized date for older days", () => {
      expect(formatDateHeader(new Date(2026, 9, 9, 10, 0).getTime(), reference)).toBe(
        "Friday, October 9, 2026",
      );
    });

    it("never labels a future date as Today or Yesterday", () => {
      const label = formatDateHeader(new Date(2026, 9, 20, 10, 0).getTime(), reference);
      expect(label).not.toBe("Today");
      expect(label).not.toBe("Yesterday");
      expect(label).toContain("2026");
    });
  });

  describe("formatTimeOfDay", () => {
    it("formats a 12-hour localized time", () => {
      expect(formatTimeOfDay(new Date(2026, 0, 1, 9, 5).getTime())).toBe("9:05 AM");
      expect(formatTimeOfDay(new Date(2026, 0, 1, 13, 0).getTime())).toBe("1:00 PM");
    });

    it("formats midnight as 12:00 AM", () => {
      expect(formatTimeOfDay(new Date(2026, 0, 1, 0, 0).getTime())).toBe("12:00 AM");
    });
  });

  describe("formatLongDate", () => {
    it("formats a long localized date", () => {
      expect(formatLongDate(new Date(2026, 9, 11))).toBe("October 11, 2026");
      expect(formatLongDate(new Date(2026, 0, 5))).toBe("January 5, 2026");
    });
  });

  describe("sortRecordsByTimestampDesc", () => {
    const records = [
      { id: "a", timestamp: 1000 },
      { id: "b", timestamp: 3000 },
      { id: "c", timestamp: 2000 },
    ];

    it("sorts newest first", () => {
      expect(sortRecordsByTimestampDesc(records).map((r) => r.id)).toEqual(["b", "c", "a"]);
    });

    it("does not mutate the input array", () => {
      const input = [...records];
      sortRecordsByTimestampDesc(input);
      expect(input).toEqual(records);
    });

    it("handles an empty array", () => {
      expect(sortRecordsByTimestampDesc([])).toEqual([]);
    });
  });

  describe("filterRecordsByLocalDay", () => {
    const day1 = new Date(2026, 9, 11, 10, 0).getTime();
    const day1Late = new Date(2026, 9, 11, 22, 0).getTime();
    const day2 = new Date(2026, 9, 12, 8, 0).getTime();
    const records = [
      { id: "a", timestamp: day1 },
      { id: "b", timestamp: day2 },
      { id: "c", timestamp: day1Late },
    ];

    it("keeps only records on the given local day", () => {
      expect(filterRecordsByLocalDay(records, new Date(2026, 9, 11)).map((r) => r.id)).toEqual([
        "a",
        "c",
      ]);
    });

    it("preserves the original order", () => {
      expect(filterRecordsByLocalDay(records, new Date(2026, 9, 12)).map((r) => r.id)).toEqual([
        "b",
      ]);
    });

    it("returns an empty array when no record matches", () => {
      expect(filterRecordsByLocalDay(records, new Date(2026, 9, 20))).toEqual([]);
    });
  });

  describe("getRecordDateKeys", () => {
    it("returns one local date key per day, collapsing duplicates", () => {
      const records = [
        { timestamp: new Date(2026, 9, 11, 9, 0).getTime() },
        { timestamp: new Date(2026, 9, 11, 21, 0).getTime() },
        { timestamp: new Date(2026, 9, 12, 8, 0).getTime() },
      ];

      expect(getRecordDateKeys(records)).toEqual(new Set(["2026-10-11", "2026-10-12"]));
    });

    it("returns an empty set when there are no records", () => {
      expect(getRecordDateKeys([])).toEqual(new Set());
    });
  });

  describe("filterRecordsByToday", () => {
    const todayMorning = new Date();
    todayMorning.setHours(8, 0);
    const todayEvening = new Date();
    todayEvening.setHours(22, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const records = [
      { id: "a", timestamp: todayMorning.getTime() },
      { id: "b", timestamp: yesterday.getTime() },
      { id: "c", timestamp: todayEvening.getTime() },
    ];

    it("keeps only records on the current local day", () => {
      expect(filterRecordsByToday(records).map((r) => r.id)).toEqual(["a", "c"]);
    });

    it("returns an empty array with no records", () => {
      expect(filterRecordsByToday([])).toEqual([]);
    });
  });

  describe("getStreakDays", () => {
    const daysAgo = (n: number): number => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.getTime();
    };

    it("returns 0 with no records", () => {
      expect(getStreakDays([])).toBe(0);
    });

    it("counts today alone as a 1-day streak", () => {
      expect(getStreakDays([{ timestamp: daysAgo(0) }])).toBe(1);
    });

    it("counts consecutive days back from today", () => {
      const records = [
        { timestamp: daysAgo(0) },
        { timestamp: daysAgo(1) },
        { timestamp: daysAgo(2) },
      ];
      expect(getStreakDays(records)).toBe(3);
    });

    it("collapses multiple records on the same day", () => {
      const morning = new Date();
      morning.setHours(9, 0);
      const evening = new Date();
      evening.setHours(21, 0);
      expect(
        getStreakDays([{ timestamp: morning.getTime() }, { timestamp: evening.getTime() }]),
      ).toBe(1);
    });

    it("survives a missing today - a streak ending yesterday is still alive", () => {
      expect(getStreakDays([{ timestamp: daysAgo(1) }])).toBe(1);
    });

    it("survives a missing today across several live days", () => {
      expect(getStreakDays([{ timestamp: daysAgo(1) }, { timestamp: daysAgo(2) }])).toBe(2);
    });

    it("breaks on the first gap behind the streak", () => {
      const records = [
        { timestamp: daysAgo(0) },
        { timestamp: daysAgo(1) },
        { timestamp: daysAgo(3) },
      ];
      expect(getStreakDays(records)).toBe(2);
    });

    it("does not count a streak that ended two days ago", () => {
      expect(getStreakDays([{ timestamp: daysAgo(2) }])).toBe(0);
    });
  });
});
