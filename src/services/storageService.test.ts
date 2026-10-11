import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vite-plus/test";
import type { IntakeRecord, MedicineItem } from "../types";
import {
  addIntakeRecordItem,
  addMedicineItem,
  clearAllData,
  deleteIntakeRecordItem,
  deleteMedicineItem,
  exportData,
  getIntakeRecords,
  getMedicines,
  importData,
  restoreIntakeRecord,
  restoreMedicineItem,
  saveIntakeRecords,
  saveMedicines,
  updateIntakeRecordItem,
} from "./storageService";

// Keys used by the storage service (kept in sync with the implementation).
const MEDICINES_KEY = "mediLog_medicines";
const INTAKE_RECORDS_KEY = "mediLog_intakeRecords";

class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const makeMedicine = (id: string, name: string): MedicineItem => ({ id, name });

const makeRecord = (
  id: string,
  medicineId: string,
  medicineName: string,
  timestamp: number,
  details?: string,
): IntakeRecord => ({
  id,
  medicineId,
  medicineName,
  timestamp,
  ...(details !== undefined ? { details } : {}),
});

describe("storageService", () => {
  let storage: LocalStorageMock;
  let errorSpy: MockInstance;

  beforeEach(() => {
    storage = new LocalStorageMock();
    vi.stubGlobal("localStorage", storage);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("getMedicines", () => {
    it("returns the seeded default medicines and persists them when storage is empty", () => {
      const medicines = getMedicines();

      expect(medicines).toEqual([
        { id: "default-1", name: "Vitamin C" },
        { id: "default-2", name: "Vitamin D" },
      ]);
      expect(JSON.parse(storage.getItem(MEDICINES_KEY) as string)).toEqual(medicines);
    });

    it("parses and returns medicines already stored", () => {
      const stored = [makeMedicine("a", "Aspirin")];
      storage.setItem(MEDICINES_KEY, JSON.stringify(stored));

      expect(getMedicines()).toEqual(stored);
    });

    it("does not re-seed defaults once the list has been explicitly cleared", () => {
      storage.setItem(MEDICINES_KEY, "[]");

      expect(getMedicines()).toEqual([]);
    });

    it("falls back to defaults when the stored JSON is corrupted", () => {
      storage.setItem(MEDICINES_KEY, "{not-json");

      const medicines = getMedicines();

      expect(medicines).toHaveLength(2);
      expect(errorSpy).toHaveBeenCalled();
    });

    it("returns defaults when reading storage throws", () => {
      vi.stubGlobal("localStorage", {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      });

      expect(getMedicines()).toHaveLength(2);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("saveMedicines", () => {
    it("serializes medicines into storage and reports success", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      expect(saveMedicines(medicines)).toBe(true);
      expect(storage.getItem(MEDICINES_KEY)).toBe(JSON.stringify(medicines));
    });

    it("returns false instead of throwing when a write fails", () => {
      vi.stubGlobal("localStorage", {
        setItem: () => {
          throw new Error("quota exceeded");
        },
      });

      expect(saveMedicines([makeMedicine("a", "Aspirin")])).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("getIntakeRecords", () => {
    it("returns an empty array when nothing is stored", () => {
      expect(getIntakeRecords()).toEqual([]);
    });

    it("parses and returns stored records", () => {
      const stored = [makeRecord("r1", "a", "Aspirin", 1000)];
      storage.setItem(INTAKE_RECORDS_KEY, JSON.stringify(stored));

      expect(getIntakeRecords()).toEqual(stored);
    });

    it("returns an empty array when the stored JSON is corrupted", () => {
      storage.setItem(INTAKE_RECORDS_KEY, "oops");

      expect(getIntakeRecords()).toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("saveIntakeRecords", () => {
    it("serializes records into storage and reports success", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      expect(saveIntakeRecords(records)).toBe(true);
      expect(storage.getItem(INTAKE_RECORDS_KEY)).toBe(JSON.stringify(records));
    });

    it("returns false instead of throwing when a write fails", () => {
      vi.stubGlobal("localStorage", {
        setItem: () => {
          throw new Error("quota exceeded");
        },
      });

      expect(saveIntakeRecords([makeRecord("r1", "a", "Aspirin", 1000)])).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // The CRUD helpers below are pure: they return a new list and never touch
  // storage (the app persists separately), so they are safe in state updaters.
  describe("addMedicineItem", () => {
    it("appends a trimmed medicine with a generated id", () => {
      const existing = [makeMedicine("a", "Aspirin")];

      const updated = addMedicineItem(existing, "  Vitamin B12  ");

      expect(updated).toHaveLength(2);
      expect(updated[1].name).toBe("Vitamin B12");
      expect(updated[1].id).toBeTruthy();
      expect(existing).toHaveLength(1); // original array is untouched
    });

    it("does not persist or touch storage", () => {
      addMedicineItem([], "Aspirin");

      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
    });

    it("generates unique ids for successive additions", () => {
      const first = addMedicineItem([], "Alpha");
      const second = addMedicineItem(first, "Beta");

      expect(second[0].id).not.toBe(second[1].id);
    });
  });

  describe("deleteMedicineItem", () => {
    it("removes the medicine with the given id", () => {
      const medicines = [makeMedicine("a", "Aspirin"), makeMedicine("b", "Ibuprofen")];

      expect(deleteMedicineItem(medicines, "a")).toEqual([makeMedicine("b", "Ibuprofen")]);
    });

    it("is a no-op when the id does not exist", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      expect(deleteMedicineItem(medicines, "missing")).toEqual(medicines);
    });
  });

  describe("restoreMedicineItem", () => {
    it("re-appends a previously deleted medicine", () => {
      const restored = restoreMedicineItem(
        [makeMedicine("a", "Aspirin")],
        makeMedicine("b", "Ibuprofen"),
      );

      expect(restored).toHaveLength(2);
      expect(restored[1]).toEqual(makeMedicine("b", "Ibuprofen"));
    });

    it("does not add a duplicate when the id already exists", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      expect(restoreMedicineItem(medicines, makeMedicine("a", "Aspirin"))).toBe(medicines);
    });
  });

  describe("addIntakeRecordItem", () => {
    it("adds a record using the provided timestamp and details", () => {
      const updated = addIntakeRecordItem([], "a", "Aspirin", 1_700_000_000_000, " 500mg ");

      expect(updated).toHaveLength(1);
      expect(updated[0]).toMatchObject({
        medicineId: "a",
        medicineName: "Aspirin",
        timestamp: 1_700_000_000_000,
        details: "500mg",
      });
    });

    it("omits the details property when none is supplied", () => {
      expect(addIntakeRecordItem([], "a", "Aspirin", 1000)[0]).not.toHaveProperty("details");
    });

    it("omits the details property when it is only whitespace", () => {
      expect(addIntakeRecordItem([], "a", "Aspirin", 1000, "   ")[0]).not.toHaveProperty("details");
    });

    it("does not persist or touch storage", () => {
      addIntakeRecordItem([], "a", "Aspirin", 1000);

      expect(storage.getItem(INTAKE_RECORDS_KEY)).toBeNull();
    });

    it("creates a unique id for each record", () => {
      const first = addIntakeRecordItem([], "a", "Aspirin", 1000);
      const second = addIntakeRecordItem(first, "a", "Aspirin", 2000);

      expect(second[0].id).not.toBe(second[1].id);
    });
  });

  describe("deleteIntakeRecordItem", () => {
    it("removes the record with the given id", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000), makeRecord("r2", "b", "Iron", 2000)];

      expect(deleteIntakeRecordItem(records, "r1")).toEqual([makeRecord("r2", "b", "Iron", 2000)]);
    });

    it("is a no-op when the id does not exist", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      expect(deleteIntakeRecordItem(records, "missing")).toEqual(records);
    });
  });

  describe("restoreIntakeRecord", () => {
    it("re-appends a deleted record", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];
      const restored = restoreIntakeRecord(records, makeRecord("r2", "b", "Iron", 2000));

      expect(restored).toEqual([...records, makeRecord("r2", "b", "Iron", 2000)]);
    });

    it("does not add a duplicate when the id already exists", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      expect(restoreIntakeRecord(records, makeRecord("r1", "a", "Aspirin", 1000))).toBe(records);
    });
  });

  describe("updateIntakeRecordItem", () => {
    it("updates the timestamp of the matching record", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      const updated = updateIntakeRecordItem(records, "r1", { timestamp: 5000 });

      expect(updated[0]).toEqual(makeRecord("r1", "a", "Aspirin", 5000));
    });

    it("sets trimmed details", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      const updated = updateIntakeRecordItem(records, "r1", { timestamp: 1000, details: " 5mg " });

      expect(updated[0].details).toBe("5mg");
    });

    it("removes details when the new value is blank", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000, "500mg")];

      const updated = updateIntakeRecordItem(records, "r1", { timestamp: 1000, details: "   " });

      expect(updated[0]).not.toHaveProperty("details");
    });

    it("leaves other records untouched", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000), makeRecord("r2", "b", "Iron", 2000)];

      const updated = updateIntakeRecordItem(records, "r1", { timestamp: 5000 });

      expect(updated[1]).toEqual(makeRecord("r2", "b", "Iron", 2000));
    });

    it("returns an equal list when the id does not exist", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      expect(updateIntakeRecordItem(records, "missing", { timestamp: 5000 })).toEqual(records);
    });
  });

  describe("clearAllData", () => {
    it("clears both lists and keeps them cleared instead of re-seeding defaults", () => {
      saveMedicines([makeMedicine("a", "Aspirin")]);
      saveIntakeRecords([makeRecord("r1", "a", "Aspirin", 1000)]);

      expect(clearAllData()).toBe(true);
      expect(getMedicines()).toEqual([]);
      expect(getIntakeRecords()).toEqual([]);
    });

    it("reports failure when storage writes fail", () => {
      vi.stubGlobal("localStorage", {
        setItem: () => {
          throw new Error("quota exceeded");
        },
      });

      expect(clearAllData()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("exportData", () => {
    it("downloads the current data as a JSON file", async () => {
      const medicines = [makeMedicine("a", "Aspirin")];
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];
      saveMedicines(medicines);
      saveIntakeRecords(records);

      const anchor = { href: "", download: "", click: vi.fn() };
      const appendChild = vi.fn();
      const removeChild = vi.fn();
      vi.stubGlobal("document", {
        createElement: vi.fn(() => anchor),
        body: { appendChild, removeChild },
      });
      const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:mock");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

      exportData();

      expect(anchor.download).toBe("medilog_data.json");
      expect(anchor.click).toHaveBeenCalledTimes(1);
      expect(appendChild).toHaveBeenCalledWith(anchor);
      expect(removeChild).toHaveBeenCalledWith(anchor);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

      const blob = createObjectURL.mock.calls[0][0];
      expect(JSON.parse(await blob.text())).toEqual({ medicines, intakeRecords: records });
    });
  });

  describe("importData", () => {
    const stubFileReader = () => {
      class MockFileReader {
        onload: ((event: { target: { result: string } }) => void) | null = null;
        onerror: ((error: unknown) => void) | null = null;
        result: string | null = null;

        readAsText(file: File): void {
          file.text().then(
            (text) => {
              this.result = text;
              this.onload?.({ target: { result: text } });
            },
            (error: unknown) => this.onerror?.(error),
          );
        }
      }
      vi.stubGlobal("FileReader", MockFileReader);
    };

    const jsonFile = (content: string) =>
      new File([content], "medilog_data.json", { type: "application/json" });

    it("parses valid data and returns it without persisting", async () => {
      stubFileReader();
      const data = {
        medicines: [makeMedicine("a", "Aspirin")],
        intakeRecords: [makeRecord("r1", "a", "Aspirin", 1000, "500mg")],
      };

      const result = await importData(jsonFile(JSON.stringify(data)));

      expect(result).toEqual({ success: true, ...data });
      // Persistence is the caller's responsibility now.
      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
      expect(storage.getItem(INTAKE_RECORDS_KEY)).toBeNull();
    });

    it("fails on malformed JSON", async () => {
      stubFileReader();

      const result = await importData(jsonFile("{not valid json"));

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("fails when the payload is not a JSON object", async () => {
      stubFileReader();

      const result = await importData(jsonFile(JSON.stringify("just a string")));

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not a JSON object");
    });

    it("fails when medicines or intakeRecords are missing/not arrays", async () => {
      stubFileReader();

      const result = await importData(
        jsonFile(JSON.stringify({ medicines: [], intakeRecords: {} })),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("not arrays");
    });

    it("fails when a medicine item is malformed", async () => {
      stubFileReader();

      const result = await importData(
        jsonFile(JSON.stringify({ medicines: [{ id: 1, name: "Aspirin" }], intakeRecords: [] })),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("medicines are malformed");
    });

    it("fails when an intake record is malformed", async () => {
      stubFileReader();

      const result = await importData(
        jsonFile(
          JSON.stringify({
            medicines: [],
            intakeRecords: [{ id: "r1", medicineId: "a", medicineName: "Aspirin" }],
          }),
        ),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("intake records are malformed");
    });

    it("reports an error when the file cannot be read", async () => {
      class FailingFileReader {
        onload: unknown = null;
        onerror: ((error: unknown) => void) | null = null;
        readAsText(): void {
          queueMicrotask(() => this.onerror?.(new Error("read failure")));
        }
      }
      vi.stubGlobal("FileReader", FailingFileReader);

      const result = await importData(jsonFile("{}"));

      expect(result).toEqual({ success: false, error: "Failed to read the file." });
    });
  });
});
