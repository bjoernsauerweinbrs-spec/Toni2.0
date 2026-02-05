// toni/src/models/fitness-entry.model.ts

export interface FitnessEntry {
  datum: string; // ISO Datum
  puls?: number;
  spo2?: number;
  wasser?: number;
  kalorien?: number;
  schritte?: number;
  belastungsindex?: number;
  regenerationszeit?: number;
  schlaf?: number;
  notiz?: string;
}
