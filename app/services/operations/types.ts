export interface OperationRequest {
  cicloFacturable?: string;
  periodo?: string;
  cicloId?: string;
  periodoId?: string;
}

export interface OperationResult {
  success: boolean;
  procesoId?: string;
  estado?: string;
  mensaje?: string;
}

export interface ParallelDataLoad {
  timestamp: Date;
  requestsCount: number;
  duration: number; // en ms
}
