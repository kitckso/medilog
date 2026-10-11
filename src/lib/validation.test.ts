import { describe, expect, it } from "vite-plus/test";
import type { MedicineItem } from "../types";
import { validateMedicineName } from "./validation";

const makeMedicine = (id: string, name: string): MedicineItem => ({ id, name });

describe("validateMedicineName", () => {
  const medicines = [makeMedicine("a", "Aspirin")];

  it("rejects an empty name", () => {
    expect(validateMedicineName(medicines, "")).toBe("Medicine name cannot be empty.");
  });

  it("rejects a whitespace-only name", () => {
    expect(validateMedicineName(medicines, "   ")).toBe("Medicine name cannot be empty.");
  });

  it("rejects a duplicate name", () => {
    expect(validateMedicineName(medicines, "Aspirin")).toBe(
      "Medicine with this name already exists.",
    );
  });

  it("rejects a duplicate regardless of case and surrounding whitespace", () => {
    expect(validateMedicineName(medicines, "  aSPIRIN ")).toBe(
      "Medicine with this name already exists.",
    );
  });

  it("accepts a new, unique name", () => {
    expect(validateMedicineName(medicines, "Ibuprofen")).toBeNull();
  });

  it("accepts any name when the list is empty", () => {
    expect(validateMedicineName([], "Anything")).toBeNull();
  });
});
