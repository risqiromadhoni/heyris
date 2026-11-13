import { describe, expect, it } from "vite-plus/test";

import { formatFullDate, formatMonth, formatMonthYear, formatWeekdayShort } from "./dates";

// Thursday. Midnight UTC is still Wednesday west of Greenwich, so this catches a dropped `timeZone`.
const NOTE_DATE = new Date("2026-11-12T00:00:00Z");
const MONTH_START = new Date("2026-10-01T00:00:00Z");

describe("date formatting", () => {
  it("writes the month and year", () => {
    expect(formatMonthYear(MONTH_START, "id")).toBe("Oktober 2026");
    expect(formatMonthYear(MONTH_START, "en")).toBe("October 2026");
  });

  it("writes the month alone", () => {
    expect(formatMonth(MONTH_START, "id")).toBe("Oktober");
    expect(formatMonth(MONTH_START, "en")).toBe("October");
  });

  it("writes the full date in each locale's order", () => {
    expect(formatFullDate(NOTE_DATE, "id")).toBe("12 November 2026");
    expect(formatFullDate(NOTE_DATE, "en")).toBe("November 12, 2026");
  });

  it("computes the weekday in UTC", () => {
    expect(formatWeekdayShort(NOTE_DATE, "id")).toBe("Kam");
    expect(formatWeekdayShort(NOTE_DATE, "en")).toBe("Thu");
  });
});
