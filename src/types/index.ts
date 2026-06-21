export type UserRole = 'observer' | 'forecaster' | 'director';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  faceId: string;
  token: string;
  loginAt: number;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  target: string;
  detail: string;
  ip: string;
  timestamp: number;
}

export interface WeatherStation {
  id: string;
  name: string;
  district: string;
  position: [number, number, number];
  color: string;
}

export interface RealtimeWeather {
  stationId: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
}

export interface HourlyData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
}

export interface HistoryExtreme {
  type: 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'visibility';
  max: number;
  maxDate: string;
  min: number;
  minDate: string;
}

export interface RadarStation {
  id: string;
  name: string;
  position: [number, number, number];
  rotationSpeed: number;
}

export interface ForecastSlot {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  rainArea: { x: number; z: number; radius: number } | null;
}

export interface Forecast3H {
  generatedAt: number;
  slots: ForecastSlot[];
  accuracy: number;
}

export type AlertLevel = 'normal' | 'warning' | 'danger';
export type AlertType = 'wind' | 'visibility' | 'both';
export type WorkOrderStatus = 'pending_observer' | 'pending_forecaster' | 'pending_director' | 'approved' | 'rejected';

export interface WeatherAlert {
  id: string;
  stationId: string;
  type: AlertType;
  level: AlertLevel;
  message: string;
  windSpeed?: number;
  visibility?: number;
  triggeredAt: number;
  areaPosition: [number, number, number];
  areaRadius: number;
}

export interface ApprovalRecord {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  action: 'approve' | 'reject';
  opinion: string;
  timestamp: number;
}

export interface WorkOrder {
  id: string;
  alertId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  currentStep: number;
  alerts: WeatherAlert[];
  approvals: ApprovalRecord[];
  createdAt: number;
  closedAt?: number;
}

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface WeatherBriefing {
  id: string;
  generatedAt: number;
  period: string;
  summary: string;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  maxWindSpeed: number;
  minVisibility: number;
  stationData: {
    stationId: string;
    stationName: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
  }[];
  activeAlerts: number;
}

export interface DailyReport {
  date: string;
  stations: {
    stationId: string;
    stationName: string;
    maxTemp: number;
    minTemp: number;
    maxHumidity: number;
    minHumidity: number;
    maxWind: number;
    minVisibility: number;
  }[];
  alertCount: number;
  alertDetails: {
    time: string;
    station: string;
    type: string;
    level: string;
  }[];
  forecastAccuracy: number;
}
