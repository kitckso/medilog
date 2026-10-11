import type { IntakeRecord } from "../types";

/**
 * Filters intake records by a free-text query matched (case-insensitively)
 * against the medicine name and the optional details. An empty/blank query
 * returns every record unchanged. Pure and reusable.
 */
export const filterRecordsByQuery = (records: IntakeRecord[], query: string): IntakeRecord[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return records;

  return records.filter(
    (record) =>
      record.medicineName.toLowerCase().includes(needle) ||
      (record.details?.toLowerCase().includes(needle) ?? false),
  );
};
