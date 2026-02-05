// toni/src/models/training-rating.model.ts

export interface TrainingRating {
  datum: string;
  bewertung: 'gut' | 'mittel' | 'schlecht';
  notiz?: string;
}
