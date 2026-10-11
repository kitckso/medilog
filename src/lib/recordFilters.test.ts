import { describe, expect, it } from "vite-plus/test";
import type { IntakeRecord } from "../types";
import { filterRecordsByQuery } from "./recordFilters";

const makeRecord = (id: string, medicineName: string, details?: string): IntakeRecord => ({
  id,
  medicineId: `m-${id}`,
  medicineName,
  timestamp: 1000,
  ...(details !== undefined ? { details } : {}),
});

describe("filterRecordsByQuery", () => {
  const records = [
    makeRecord("r1", "Aspirin", "500mg"),
    makeRecord("r2", "Ibuprofen"),
    makeRecord("r3", "Vitamin D", "2000 IU"),
  ];

  it("returns every record for an empty query", () => {
    expect(filterRecordsByQuery(records, "")).toEqual(records);
  });

  it("returns every record for a whitespace-only query", () => {
    expect(filterRecordsByQuery(records, "   ")).toEqual(records);
  });

  it("matches the medicine name case-insensitively", () => {
    expect(filterRecordsByQuery(records, "aspirin").map((r) => r.id)).toEqual(["r1"]);
  });

  it("matches on details", () => {
    expect(filterRecordsByQuery(records, "2000 iu").map((r) => r.id)).toEqual(["r3"]);
  });

  it("matches a partial substring across multiple records", () => {
    expect(filterRecordsByQuery(records, "pro").map((r) => r.id)).toEqual(["r2"]);
  });

  it("trims the query before matching", () => {
    expect(filterRecordsByQuery(records, "  vitamin  ").map((r) => r.id)).toEqual(["r3"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterRecordsByQuery(records, "paracetamol")).toEqual([]);
  });
});
