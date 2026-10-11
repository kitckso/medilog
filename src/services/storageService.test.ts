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
  let alertSpy: ReturnType<typeof vi.fn>;
  let errorSpy: MockInstance;

  beforeEach(() => {
    storage = new LocalStorageMock();
    vi.stubGlobal("localStorage", storage);
    alertSpy = vi.fn();
    vi.stubGlobal("alert", alertSpy);
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
    it("serializes medicines into storage", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      saveMedicines(medicines);

      expect(storage.getItem(MEDICINES_KEY)).toBe(JSON.stringify(medicines));
    });

    it("does not throw when storage writes fail", () => {
      vi.stubGlobal("localStorage", {
        setItem: () => {
          throw new Error("quota exceeded");
        },
      });

      expect(() => saveMedicines([makeMedicine("a", "Aspirin")])).not.toThrow();
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
    it("serializes records into storage", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      saveIntakeRecords(records);

      expect(storage.getItem(INTAKE_RECORDS_KEY)).toBe(JSON.stringify(records));
    });
  });

  describe("addMedicineItem", () => {
    it("appends a trimmed medicine and persists the updated list", () => {
      const existing = [makeMedicine("a", "Aspirin")];

      const updated = addMedicineItem(existing, "  Vitamin B12  ");

      expect(updated).toHaveLength(2);
      expect(updated[1].name).toBe("Vitamin B12");
      expect(updated[1].id).toBeTruthy();
      expect(JSON.parse(storage.getItem(MEDICINES_KEY) as string)).toEqual(updated);
      expect(existing).toHaveLength(1); // original array is untouched
    });

    it("rejects an empty name and leaves the list unchanged", () => {
      const existing = [makeMedicine("a", "Aspirin")];

      const updated = addMedicineItem(existing, "   ");

      expect(updated).toBe(existing);
      expect(alertSpy).toHaveBeenCalledWith("Medicine name cannot be empty.");
      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
    });

    it("rejects duplicates regardless of case and surrounding whitespace", () => {
      const existing = [makeMedicine("a", "Aspirin")];

      const updated = addMedicineItem(existing, "  aSPIRIN ");

      expect(updated).toBe(existing);
      expect(alertSpy).toHaveBeenCalledWith("Medicine with this name already exists.");
      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
    });

    it("generates unique ids for successive additions", () => {
      const first = addMedicineItem([], "Alpha");
      const second = addMedicineItem(first, "Beta");

      expect(second[0].id).not.toBe(second[1].id);
    });
  });

  describe("deleteMedicineItem", () => {
    it("removes the medicine with the given id and persists the change", () => {
      const medicines = [makeMedicine("a", "Aspirin"), makeMedicine("b", "Ibuprofen")];

      const updated = deleteMedicineItem(medicines, "a");

      expect(updated).toEqual([makeMedicine("b", "Ibuprofen")]);
      expect(JSON.parse(storage.getItem(MEDICINES_KEY) as string)).toEqual(updated);
    });

    it("is a no-op when the id does not exist", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      expect(deleteMedicineItem(medicines, "missing")).toEqual(medicines);
    });
  });

  describe("restoreMedicineItem", () => {
    it("re-appends a previously deleted medicine and persists it", () => {
      const medicines = [makeMedicine("a", "Aspirin")];

      const restored = restoreMedicineItem(medicines, makeMedicine("b", "Ibuprofen"));

      expect(restored).toHaveLength(2);
      expect(restored[1]).toEqual(makeMedicine("b", "Ibuprofen"));
      expect(JSON.parse(storage.getItem(MEDICINES_KEY) as string)).toEqual(restored);
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
      expect(JSON.parse(storage.getItem(INTAKE_RECORDS_KEY) as string)).toEqual(updated);
    });

    it("omits the details property when none is supplied", () => {
      const updated = addIntakeRecordItem([], "a", "Aspirin", 1000);

      expect(updated[0]).not.toHaveProperty("details");
    });

    it("omits the details property when it is only whitespace", () => {
      const updated = addIntakeRecordItem([], "a", "Aspirin", 1000, "   ");

      expect(updated[0]).not.toHaveProperty("details");
    });

    it("creates a unique id for each record", () => {
      const first = addIntakeRecordItem([], "a", "Aspirin", 1000);
      const second = addIntakeRecordItem(first, "a", "Aspirin", 2000);

      expect(second[0].id).not.toBe(second[1].id);
    });
  });

  describe("deleteIntakeRecordItem", () => {
    it("removes the record with the given id and persists the change", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000), makeRecord("r2", "b", "Iron", 2000)];

      const updated = deleteIntakeRecordItem(records, "r1");

      expect(updated).toEqual([makeRecord("r2", "b", "Iron", 2000)]);
      expect(JSON.parse(storage.getItem(INTAKE_RECORDS_KEY) as string)).toEqual(updated);
    });

    it("is a no-op when the id does not exist", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      expect(deleteIntakeRecordItem(records, "missing")).toEqual(records);
    });
  });

  describe("restoreIntakeRecord", () => {
    it("re-appends a deleted record and persists it", () => {
      const records = [makeRecord("r1", "a", "Aspirin", 1000)];

      const restored = restoreIntakeRecord(records, makeRecord("r2", "b", "Iron", 2000));

      expect(restored).toEqual([...records, makeRecord("r2", "b", "Iron", 2000)]);
      expect(JSON.parse(storage.getItem(INTAKE_RECORDS_KEY) as string)).toEqual(restored);
    });
  });

  describe("clearAllData", () => {
    it("removes both the medicines and intake records keys", () => {
      saveMedicines([makeMedicine("a", "Aspirin")]);
      saveIntakeRecords([makeRecord("r1", "a", "Aspirin", 1000)]);

      clearAllData();

      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
      expect(storage.getItem(INTAKE_RECORDS_KEY)).toBeNull();
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

    it("imports valid data and persists it", async () => {
      stubFileReader();
      const data = {
        medicines: [makeMedicine("a", "Aspirin")],
        intakeRecords: [makeRecord("r1", "a", "Aspirin", 1000, "500mg")],
      };

      const result = await importData(jsonFile(JSON.stringify(data)));

      expect(result).toEqual({ success: true, ...data });
      expect(JSON.parse(storage.getItem(MEDICINES_KEY) as string)).toEqual(data.medicines);
      expect(JSON.parse(storage.getItem(INTAKE_RECORDS_KEY) as string)).toEqual(data.intakeRecords);
    });

    it("fails on malformed JSON", async () => {
      stubFileReader();

      const result = await importData(jsonFile("{not valid json"));

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(storage.getItem(MEDICINES_KEY)).toBeNull();
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
