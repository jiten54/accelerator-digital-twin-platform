export type EquipmentType = 'magnet' | 'converter' | 'beamline' | 'cryo' | 'cooling';
export type EquipmentStatus = 'nominal' | 'warning' | 'critical' | 'maintenance';

export interface TelemetryReading {
  current: number;     // A
  voltage: number;     // V
  temperature: number; // K (for cryo/magnets) or °C
  pressure: number;    // bar or Pa
  efficiency: number;   // %
  power: number;       // kW
  timestamp: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  sector: string;
  status: EquipmentStatus;
  specs: Record<string, string | number>;
  healthScore: number;
  telemetry: TelemetryReading[];
  assignedEngineer: string;
  requirements: string[]; // requirement IDs
}

export interface Alarm {
  id: string;
  equipmentId: string;
  equipmentName: string;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  incidentId?: string;
  rootCause?: string;
  timeline: { time: string; event: string }[];
}

export interface Incident {
  id: string;
  alarmId: string;
  equipmentId: string;
  title: string;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  status: 'investigating' | 'mitigating' | 'resolved' | 'postmortem';
  assignedEngineer: string;
  createdTime: string;
  updatedTime: string;
  rootCause?: string;
  resolution?: string;
  postmortem?: string;
}

export interface Requirement {
  id: string;
  title: string;
  type: 'functional' | 'performance' | 'safety';
  status: 'draft' | 'baseline' | 'approved';
  description: string;
  subsystem: string;
  equipmentId: string;
  sprintTaskId?: string;
  releaseVersion?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  category: 'bug' | 'feature' | 'support';
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  author: string;
  description: string;
  slaHours: number;
  createdTime: string;
  resolution?: string;
}

export interface WikiPage {
  id: string;
  title: string;
  category: 'manual' | 'procedure' | 'runbook';
  content: string;
  lastUpdated: string;
  author: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'calibration';
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
  durationHours: number;
  technician: string;
  description: string;
  report?: string;
}

export interface SprintTask {
  id: string;
  title: string;
  points: number;
  column: 'backlog' | 'todo' | 'progress' | 'review' | 'done';
  assignee: string;
  description: string;
}

export interface ReleaseNode {
  id: string;
  version: string;
  releaseDate: string;
  status: 'staged' | 'deployed' | 'rolled_back';
  notes: string;
  commitsCount: number;
  approvalChain: { role: string; approved: boolean }[];
}

export interface DevOpsContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'paused' | 'stopped';
  cpu: number;
  memory: number;
  ports: string;
}

export interface DevOpsPod {
  name: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Terminating';
  restarts: number;
  cpuUsage: number; // m
  memoryUsage: number; // Mi
  ip: string;
  node: string;
  logs: string[];
}

export interface PipelineBuild {
  id: string;
  branch: string;
  commit: string;
  status: 'success' | 'failed' | 'running' | 'queued';
  durationSeconds: number;
  timestamp: string;
  steps: { name: string; status: 'success' | 'failed' | 'running' | 'queued'; duration: number }[];
}
