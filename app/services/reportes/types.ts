export interface ReportRequest {
  contratoId?: number;
  periodo?: string;
  emId?: number;
}

export interface ReportResult<T> {
  data: T;
  timestamp: Date;
}
