export interface MeterValidationRequest {
  meterId: number;
  currentReading: number;
  previousReading: number;
  rate: string;
}

export interface ConsumptionValidationRequest {
  currentReading: number;
  previousReading: number;
  previousMonthConsumption?: number | null;
  meterCapacity?: number;
}

export interface InsertionBatchRequest {
  readings: {
    meterId: number;
    currentReading: number;
    consumption: number;
    keyId: string;
  }[];
  period?: string;
}

export interface InsertionStatistics {
  totalMeters: number;
  autoInsertableCount: number;
  manualReviewCount: number;
  successRate: number;
  estimatedTime: number; // en segundos
}
