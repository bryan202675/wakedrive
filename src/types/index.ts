export type FilteredStatus = 'ERGUIDO' | 'INCLINADO';

export interface TelemetryPoint {
  time: number;
  raw: number; // 0 (active/tilt) or 1 (upright)
  filtered: FilteredStatus;
  isAlert: boolean;
}

export interface IncidentEvent {
  id: string;
  time: string;
  event: string;
  duration: string;
  action: string;
  severity: 'low' | 'warning' | 'critical';
}

export interface SystemMetrics {
  rawReading: number;
  filteredStatus: FilteredStatus;
  tiltStartTime: number | null;
  confirmationMs: number;
  isAlertActive: boolean;
  alertCount: number;
  sessionStartTime: number;
}
