import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  Equipment, 
  Alarm, 
  Incident, 
  Requirement, 
  SupportTicket, 
  WikiPage, 
  MaintenanceTask, 
  SprintTask, 
  ReleaseNode, 
  DevOpsContainer, 
  DevOpsPod,
  PipelineBuild 
} from "./src/types";

dotenv.config();

// Lazy initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured in environment variables. AI Copilot operations will fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY DATABASE STATE
let equipmentList: Equipment[] = [
  {
    id: "EQ-MAG-A1",
    name: "Dipole Magnet Sector A1",
    type: "magnet",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Magnetic Field": "8.33 Tesla",
      "Operating Current": "11,850 A",
      "Superconducting Temp": "1.9 Kelvin",
      "Aperture Diameter": "56 mm",
      "Inductance": "98.7 mH",
      "Stored Energy": "6.93 MJ"
    },
    healthScore: 98,
    telemetry: [],
    assignedEngineer: "Dr. Elena Rostova",
    requirements: ["REQ-001"]
  },
  {
    id: "EQ-MAG-A2",
    name: "Quadrupole Magnet Sector A2",
    type: "magnet",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Field Gradient": "223 Tesla/meter",
      "Operating Current": "12,100 A",
      "Superconducting Temp": "1.9 Kelvin",
      "Aperture Diameter": "56 mm",
      "Effective Length": "3.1 meters",
      "Weight": "16.4 tonnes"
    },
    healthScore: 99,
    telemetry: [],
    assignedEngineer: "Dr. Elena Rostova",
    requirements: []
  },
  {
    id: "EQ-CON-A1",
    name: "Power Converter RPC-A1",
    type: "converter",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Max Power Output": "2.4 Megawatt",
      "Output Voltage Range": "0-190 Volts",
      "Precision Current Stability": "2 parts per million (ppm)",
      "Cooling Medium": "Chilled Water @ 12°C",
      "Cooling Flow Rate": "120 Liters/min"
    },
    healthScore: 96,
    telemetry: [],
    assignedEngineer: "Dr. Elena Rostova",
    requirements: ["REQ-002"]
  },
  {
    id: "EQ-BEA-A1",
    name: "Vacuum Beamline Chamber",
    type: "beamline",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Vacuum Pressure": "1.2e-11 mbar",
      "Chamber Diameter": "63 mm",
      "Bakeout Temp": "150 °C",
      "Beam Intensity Limit": "3.2e14 protons",
      "Beam Energy Limit": "6.5 TeV"
    },
    healthScore: 97,
    telemetry: [],
    assignedEngineer: "Dr. Hans Mueller",
    requirements: []
  },
  {
    id: "EQ-CRY-A1",
    name: "Cryogenic Distribution CDU-A1",
    type: "cryo",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Helium Inventory": "12,500 Liters (Liquid)",
      "Cooling Capacity": "144 kW @ 4.5K",
      "Normal Operating Temp": "1.8 Kelvin",
      "Pumping Speed": "12,000 m³/h Helium Gas",
      "Compressor Power": "450 kW"
    },
    healthScore: 95,
    telemetry: [],
    assignedEngineer: "Claude Dubois",
    requirements: ["REQ-003"]
  },
  {
    id: "EQ-COO-A1",
    name: "Chilled Water Cooling Station",
    type: "cooling",
    sector: "Sector A",
    status: "nominal",
    specs: {
      "Cooling Water Flow Rate": "350 m³/h",
      "Inlet Water Temp": "12.5 °C",
      "Outlet Water Temp": "24.2 °C",
      "Primary Pump Pressure": "6.2 bar",
      "Heat Exchanger Area": "180 m²"
    },
    healthScore: 97,
    telemetry: [],
    assignedEngineer: "Claude Dubois",
    requirements: []
  }
];

// Initialize telemetry historical data (last 20 readings, spaced by 3s)
const baseTime = Date.now();
equipmentList.forEach((eq) => {
  const readings: any[] = [];
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(baseTime - i * 3000).toISOString();
    let r: any = {};
    if (eq.type === 'magnet') {
      r = {
        current: 11800 + Math.random() * 80,
        voltage: 120 + Math.random() * 3,
        temperature: 1.84 + Math.random() * 0.05,
        pressure: 1.2 + Math.random() * 0.05,
        efficiency: 99.8 - Math.random() * 0.2,
        power: 1416 + Math.random() * 10,
        timestamp
      };
    } else if (eq.type === 'converter') {
      r = {
        current: 11850 + Math.random() * 4,
        voltage: 118 + Math.random() * 2,
        temperature: 42.5 + Math.random() * 2,
        pressure: 3.1 + Math.random() * 0.2,
        efficiency: 98.4 + Math.random() * 0.3,
        power: 1398 + Math.random() * 15,
        timestamp
      };
    } else if (eq.type === 'beamline') {
      r = {
        current: 0,
        voltage: 0,
        temperature: 22.1 + Math.random() * 0.5,
        pressure: 1.2e-11 + Math.random() * 0.3e-11,
        efficiency: 100,
        power: 12.5 + Math.random() * 0.5,
        timestamp
      };
    } else if (eq.type === 'cryo') {
      r = {
        current: 0,
        voltage: 0,
        temperature: 1.81 + Math.random() * 0.03,
        pressure: 1.15 + Math.random() * 0.03,
        efficiency: 95.4 + Math.random() * 0.4,
        power: 420 + Math.random() * 5,
        timestamp
      };
    } else if (eq.type === 'cooling') {
      r = {
        current: 85 + Math.random() * 2,
        voltage: 400 + Math.random() * 5,
        temperature: 12.4 + Math.random() * 0.2,
        pressure: 6.15 + Math.random() * 0.08,
        efficiency: 92.5 + Math.random() * 0.5,
        power: 58 + Math.random() * 2,
        timestamp
      };
    }
    readings.push(r);
  }
  eq.telemetry = readings;
});

// Outage active simulations state
let simSpikeType: 'none' | 'cryo' | 'converter' = 'none';

let alarms: Alarm[] = [
  {
    id: "ALM-101",
    equipmentId: "EQ-CON-A1",
    equipmentName: "Power Converter RPC-A1",
    severity: "warning",
    message: "Precision current ripple fluctuation outside 2ppm tolerance limit (measured 4.1ppm)",
    status: "resolved",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    rootCause: "Harmonic feedback from Sector B substation",
    timeline: [
      { time: new Date(Date.now() - 3600000 * 2).toISOString(), event: "Current stability tolerance exceeded limit (measured 4.1ppm)" },
      { time: new Date(Date.now() - 3600000 * 1.8).toISOString(), event: "Acknowledged by Dr. Elena Rostova" },
      { time: new Date(Date.now() - 3600000 * 1.5).toISOString(), event: "Substation filtering engaged" },
      { time: new Date(Date.now() - 3600000 * 1.2).toISOString(), event: "Ripple returned to 1.8ppm. Resolved." }
    ]
  }
];

let incidents: Incident[] = [
  {
    id: "INC-101",
    alarmId: "ALM-101",
    equipmentId: "EQ-CON-A1",
    title: "Precision current stabilization drift",
    severity: "warning",
    status: "postmortem",
    assignedEngineer: "Dr. Elena Rostova",
    createdTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedTime: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    rootCause: "Substation voltage fluctuation introduced harmonic noise into RPC-A1 precision regulation loops.",
    resolution: "Adjusted active noise-cancellation parameters on power converter control boards and scheduled inspection of Substation B active harmonizers.",
    postmortem: "# Incident Postmortem INC-101\n\n**Owner**: Dr. Elena Rostova  \n**Severity**: WARNING  \n**Availability Impact**: 0% (Beam kept running on degraded mode)\n\n### Summary\nOn 24th June 2026, the Power Converter RPC-A1 reported current stability oscillations reaching 4.1ppm, violating the baseline performance requirement (REQ-002: <2ppm limit).\n\n### Root Cause\nThe investigation revealed external 150Hz harmonic feedback on the main power lines. The active converter feedback loop was slightly under-damped for this frequency, leading to the resonance amplification.\n\n### Action Items\n- Re-tune RPC-A1 regulator loop damping ratios.\n- Install active band-reject filters on the main converter inlet feeds."
  }
];

let requirements: Requirement[] = [
  {
    id: "REQ-001",
    title: "Superconducting Magnet Safety Interlock System",
    type: "safety",
    status: "approved",
    description: "The interlock system must automatically trigger a beam dump and fire the quench protection heaters within 50 milliseconds upon detection of a resistive transition zone in any dipole magnet.",
    subsystem: "Magnet Protection",
    equipmentId: "EQ-MAG-A1",
    sprintTaskId: "SPR-301",
    releaseVersion: "v1.2.0-beta"
  },
  {
    id: "REQ-002",
    title: "Precision Current Control for Dipole Magnets",
    type: "performance",
    status: "baseline",
    description: "The power converter output current must maintain a steady-state ripple of less than 2 parts per million (ppm) at the maximum design current of 12,000A to ensure beam focusing stability.",
    subsystem: "Power Conversion",
    equipmentId: "EQ-CON-A1",
    sprintTaskId: "SPR-304"
  },
  {
    id: "REQ-003",
    title: "Cryogenic Distribution Thermal Monitoring",
    type: "functional",
    status: "draft",
    description: "The cryogenic control loop must log temperatures from 16 dual-channel carbon resistor sensors every 1.0 seconds with a temperature measurement resolution of 1mK at temperatures below 2.0 K.",
    subsystem: "Cryogenics",
    equipmentId: "EQ-CRY-A1",
    sprintTaskId: "SPR-301"
  }
];

let tickets: SupportTicket[] = [
  {
    id: "TCK-101",
    title: "Vacuum pressure reading oscillation in Sector A",
    category: "bug",
    priority: "high",
    status: "in_progress",
    author: "Dr. Hans Mueller",
    description: "The vacuum sensor EQ-BEA-A1 is reporting oscillations between 1e-11 and 5e-11 mbar every 15 minutes. It might be a thermal cycling issue or sensor calibration offset. Requesting vacuum team assistance.",
    slaHours: 24,
    createdTime: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "TCK-102",
    title: "Request for telemetry export API in CSV format",
    category: "feature",
    priority: "medium",
    status: "open",
    author: "Sarah Jenkins (Operations)",
    description: "For offline analysis of beam runs, we need an endpoint or dashboard button to download a CSV of the telemetry logs over any selected 24-hour window.",
    slaHours: 72,
    createdTime: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

let wikiPages: WikiPage[] = [
  {
    id: "WKI-001",
    title: "Magnet Quench Protection Runbook",
    category: "runbook",
    content: `# Magnet Quench Protection (MQP) Runbook

This procedure defines the emergency and operational tasks to manage magnet quenches in Sector A.

## Immediate Response Steps
1. **Verify Beam Dump**: Confirm that the automatic Beam Interlock System (BIS) has dumped the beam.
2. **Superconducting Check**: Inspect Cryogenic Helium inventory. Confirm that the helium boil-off valves have opened to dump gas safely.
3. **Power Interlock Verification**: Ensure the main power converter has tripped and its current is discharging through the energy extraction dump resistors.

## Post-Quench Recovery
- Wait for the helium temperature to stabilize below 2.0 K (this usually takes 4-6 hours of cryo plant pumping).
- Run high-voltage insulation tests before repowering.
- Analyze the quench timeline using the Transient Recorder API.`,
    lastUpdated: new Date(Date.now() - 3600000 * 10).toISOString(),
    author: "Dr. Elena Rostova"
  },
  {
    id: "WKI-002",
    title: "Cryogenic System Startup Operating Procedures",
    category: "procedure",
    content: `# Cryogenic System Startup Operating Procedures

These guidelines apply to the initial cooldown of the helium distribution network in Sector A from 300K (ambient) down to 1.8K.

## Step 1: Pre-Cooling to 80K
- Purge with high-purity Helium gas (residual moisture < 2ppm).
- Start liquid nitrogen pre-cool heat exchangers.
- Keep cooling rate below 10 K/hour to avoid mechanical stresses in the transfer line.

## Step 2: Cooldown to 4.5K
- Start the main turbine-compressor group.
- Establish helium liquefaction at 4.5 K.

## Step 3: Pumping to 1.8K
- Start the sub-atmospheric warm compressors.
- Lower pressure in the cryostat vacuum vessel to 16 mbar to achieve superfluid helium at 1.8 K.`,
    lastUpdated: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    author: "Claude Dubois"
  }
];

let maintenanceTasks: MaintenanceTask[] = [
  {
    id: "MNT-201",
    title: "Annual Calibration of Cryo Carbon Resistors",
    equipmentId: "EQ-CRY-A1",
    type: "calibration",
    status: "completed",
    date: "2026-06-15",
    durationHours: 6,
    technician: "Marc Dupont",
    description: "Recalibrated resistance sensors against the standard helium vapor pressure scale. All deviation is within 0.5mK.",
    report: "All sensors aligned. Phase balance checked successfully. No drift observed in cryogenic control loop feeds."
  },
  {
    id: "MNT-202",
    title: "Dipole Magnet Connection Busbar Inspection",
    equipmentId: "EQ-MAG-A1",
    type: "preventive",
    status: "scheduled",
    date: "2026-06-28",
    durationHours: 4,
    technician: "Jean-Pierre",
    description: "Infrared thermal scan of high-current superconducting splices during standard 12kA excitation run.",
    report: ""
  }
];

let sprintTasks: SprintTask[] = [
  {
    id: "SPR-301",
    title: "Implement Quench Detector Signal Filter",
    points: 5,
    column: "progress",
    assignee: "Dr. Elena Rostova",
    description: "Filter high-frequency noise from the magnet voltage tap ADC signals to prevent false quench triggers."
  },
  {
    id: "SPR-302",
    title: "Dockerize Accelerator DevOps CI Pipeline",
    points: 3,
    column: "todo",
    assignee: "DevOps Specialist",
    description: "Migrate the build and compilation environments of the safety interlock firmware to a standardized Docker container."
  },
  {
    id: "SPR-303",
    title: "Database Schema Optimization",
    points: 8,
    column: "done",
    assignee: "DB Admin",
    description: "Tune indexes on telemetry historical tables to optimize query speeds for interactive digital twin displays."
  },
  {
    id: "SPR-304",
    title: "Add CSV Telemetry Exporter API",
    points: 5,
    column: "backlog",
    assignee: "Fullstack Dev",
    description: "Fulfill Feature Request TCK-102. Expose secure CSV stream."
  }
];

let releaseNodes: ReleaseNode[] = [
  {
    id: "REL-401",
    version: "v1.2.0-beta - Magnet Safety Update",
    releaseDate: "2026-06-20",
    status: "deployed",
    notes: "Included upgraded quench detection filter algorithms, optimized SQLite vacuum state telemetry reads, and patched a memory leak in the WebSocket telemetry bridge.",
    commitsCount: 14,
    approvalChain: [
      { role: "Safety Officer", approved: true },
      { role: "Operations Lead", approved: true }
    ]
  },
  {
    id: "REL-402",
    version: "v1.3.0 - Superfluid Cryo Integration",
    releaseDate: "2026-07-05",
    status: "staged",
    notes: "Feature update to add precision superfluid cryo telemetry logs. Pre-computes cooling gradients. Pending final safety inspection approval.",
    commitsCount: 22,
    approvalChain: [
      { role: "Safety Officer", approved: false },
      { role: "Operations Lead", approved: true }
    ]
  }
];

let devopsContainers: DevOpsContainer[] = [
  { id: "con-telemetry", name: "Telemetry Intake Agent", image: "gcr.io/cern-twin/telemetry-agent:v1.2.0", status: "running", cpu: 1.2, memory: 128, ports: "3010/tcp" },
  { id: "con-interlock", name: "Safety Interlock Engine", image: "gcr.io/cern-twin/interlock-engine:v1.2.0", status: "running", cpu: 0.5, memory: 64, ports: "3020/udp" },
  { id: "con-copilot-api", name: "Engineering AI Copilot Service", image: "gcr.io/cern-twin/copilot-api:v2.5.0", status: "running", cpu: 2.4, memory: 512, ports: "3030/tcp" }
];

let devopsPods: DevOpsPod[] = [
  {
    name: "pod-telemetry-twin-84f9bc-x7l91",
    status: "Running",
    restarts: 0,
    cpuUsage: 12,
    memoryUsage: 112,
    ip: "10.244.1.22",
    node: "gke-node-pool-1-a7fc",
    logs: [
      "[08:00:00] Initializing telemetry intake broker...",
      "[08:00:02] Connected to Sector A sensor bus (Modbus-TCP)",
      "[08:00:05] Flow streaming at 500 records/sec.",
      "[16:35:00] Connected telemetry stream to digital twin database"
    ]
  },
  {
    name: "pod-interlock-daemon-7bc89d-qprst",
    status: "Running",
    restarts: 0,
    cpuUsage: 4,
    memoryUsage: 48,
    ip: "10.244.1.23",
    node: "gke-node-pool-1-a7fc",
    logs: [
      "[08:00:00] Safety daemon active",
      "[08:00:01] Interlock heartbeat online: magnets 1-16 ok",
      "[16:30:22] Warning: EQ-CON-A1 voltage fluctuation observed but within limits",
      "[16:35:00] Heartbeat status: NOMINAL"
    ]
  },
  {
    name: "pod-copilot-brain-5db77f-zmx7c",
    status: "Running",
    restarts: 1,
    cpuUsage: 45,
    memoryUsage: 412,
    ip: "10.244.2.14",
    node: "gke-node-pool-2-b9ed",
    logs: [
      "[08:00:00] AI Copilot backend initialized with Gemini API",
      "[08:05:12] Pre-loaded CERN documentation corpus (520 manual pages)",
      "[16:38:00] Copilot query processed for alarm event 'Cryo Over-temp'"
    ]
  }
];

let pipelineBuilds: PipelineBuild[] = [
  {
    id: "BUILD-701",
    branch: "main",
    commit: "e1a9c3f",
    status: "success",
    durationSeconds: 145,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    steps: [
      { name: "Lint Check", status: "success", duration: 15 },
      { name: "Unit Tests", status: "success", duration: 35 },
      { name: "Docker Build", status: "success", duration: 55 },
      { name: "K8s Dryrun Deploy", status: "success", duration: 40 }
    ]
  },
  {
    id: "BUILD-702",
    branch: "feature-cryo-calib",
    commit: "8b9f0d1",
    status: "failed",
    durationSeconds: 65,
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    steps: [
      { name: "Lint Check", status: "success", duration: 12 },
      { name: "Unit Tests", status: "failed", duration: 53 },
      { name: "Docker Build", status: "queued", duration: 0 },
      { name: "K8s Dryrun Deploy", status: "queued", duration: 0 }
    ]
  }
];

// LIVE UPDATE TELEMETRY LOOP
// Runs on a timer to mutate the database in-memory telemetry, adding new readings and maintaining max 30 readings
setInterval(() => {
  const timestamp = new Date().toISOString();
  
  equipmentList.forEach((eq) => {
    let last = eq.telemetry[eq.telemetry.length - 1];
    if (!last) return;

    let nextReading: any = { ...last, timestamp };

    // Standard noise
    const noise = () => (Math.random() - 0.5);

    if (eq.id === "EQ-CRY-A1") {
      if (simSpikeType === "cryo") {
        // Temperature starts spiking up to 4.5 K!
        nextReading.temperature = Math.min(4.5, nextReading.temperature + 0.15 + Math.random() * 0.05);
        nextReading.pressure = Math.min(4.0, nextReading.pressure + 0.12 + Math.random() * 0.04);
        nextReading.efficiency = Math.max(70, nextReading.efficiency - 1.5);
        nextReading.power = Math.min(600, nextReading.power + 8);
        eq.status = "critical";
        eq.healthScore = Math.max(10, eq.healthScore - 4);
        
        // Auto-create alarm if not already active
        const hasActiveCryoAlarm = alarms.some(a => a.equipmentId === eq.id && a.status === "active");
        if (!hasActiveCryoAlarm) {
          const alarmId = `ALM-${Date.now().toString().slice(-4)}`;
          const incidentId = `INC-${Date.now().toString().slice(-4)}`;
          
          alarms.unshift({
            id: alarmId,
            equipmentId: eq.id,
            equipmentName: eq.name,
            severity: "critical",
            message: `Cryogenic Temperature Exceeds Superconducting Threshold: ${nextReading.temperature.toFixed(2)}K > 1.90K`,
            status: "active",
            timestamp,
            incidentId,
            timeline: [
              { time: timestamp, event: `Helium thermal sensor reported temperature breach: ${nextReading.temperature.toFixed(2)}K` },
              { time: timestamp, event: `Beam Interlock safety dump triggered (Automatic safety reaction)` }
            ]
          });

          incidents.unshift({
            id: incidentId,
            alarmId,
            equipmentId: eq.id,
            title: "Supercritical Cryogenic Cooldown Loss",
            severity: "critical",
            status: "investigating",
            assignedEngineer: "Claude Dubois",
            createdTime: timestamp,
            updatedTime: timestamp
          });
        }
      } else {
        // Return to normal or maintain normal
        if (nextReading.temperature > 1.9) {
          nextReading.temperature = Math.max(1.82, nextReading.temperature - 0.12);
          nextReading.pressure = Math.max(1.15, nextReading.pressure - 0.1);
          nextReading.efficiency = Math.min(95.4, nextReading.efficiency + 1);
          nextReading.power = Math.max(420, nextReading.power - 5);
          eq.healthScore = Math.min(95, eq.healthScore + 2);
          if (nextReading.temperature <= 1.9) eq.status = "nominal";
        } else {
          nextReading.temperature = 1.82 + noise() * 0.02;
          nextReading.pressure = 1.15 + noise() * 0.02;
          nextReading.efficiency = 95.4 + noise() * 0.2;
          nextReading.power = 420 + noise() * 2;
          eq.status = "nominal";
        }
      }
    } else if (eq.id === "EQ-CON-A1") {
      if (simSpikeType === "converter") {
        // High current ripple simulation!
        nextReading.current = 11850 + noise() * 15;
        nextReading.voltage = 145 + Math.random() * 10;
        nextReading.temperature = Math.min(85, nextReading.temperature + 1.8);
        nextReading.power = Math.min(1800, nextReading.power + 25);
        nextReading.efficiency = Math.max(88, nextReading.efficiency - 0.5);
        eq.status = "warning";
        eq.healthScore = Math.max(40, eq.healthScore - 2);

        const hasActiveConAlarm = alarms.some(a => a.equipmentId === eq.id && a.status === "active");
        if (!hasActiveConAlarm) {
          const alarmId = `ALM-${Date.now().toString().slice(-4)}`;
          const incidentId = `INC-${Date.now().toString().slice(-4)}`;
          
          alarms.unshift({
            id: alarmId,
            equipmentId: eq.id,
            equipmentName: eq.name,
            severity: "major",
            message: `Power Converter RPC-A1 thermal limits warning: temperature at ${nextReading.temperature.toFixed(1)}°C`,
            status: "active",
            timestamp,
            incidentId,
            timeline: [
              { time: timestamp, event: `Main thyristor gate driver thermistor triggered warning threshold (>65°C)` }
            ]
          });

          incidents.unshift({
            id: incidentId,
            alarmId,
            equipmentId: eq.id,
            title: "RPC-A1 Thyristor Overheating Warning",
            severity: "major",
            status: "investigating",
            assignedEngineer: "Dr. Elena Rostova",
            createdTime: timestamp,
            updatedTime: timestamp
          });
        }
      } else {
        if (nextReading.temperature > 45) {
          nextReading.temperature = Math.max(42.5, nextReading.temperature - 1.5);
          nextReading.voltage = Math.max(118, nextReading.voltage - 1);
          nextReading.power = Math.max(1398, nextReading.power - 10);
          eq.healthScore = Math.min(96, eq.healthScore + 1);
          if (nextReading.temperature <= 45) eq.status = "nominal";
        } else {
          nextReading.current = 11850 + noise() * 2;
          nextReading.voltage = 118 + noise() * 0.5;
          nextReading.temperature = 42.5 + noise() * 0.3;
          nextReading.power = 1398 + noise() * 2;
          eq.status = "nominal";
        }
      }
    } else if (eq.id === "EQ-MAG-A1" || eq.id === "EQ-MAG-A2") {
      // Dipole Magnets react slightly if Cryo is bad
      const cryoUnit = equipmentList.find(e => e.id === "EQ-CRY-A1");
      const cryoTemp = cryoUnit?.telemetry[cryoUnit.telemetry.length - 1]?.temperature || 1.82;
      
      if (cryoTemp > 1.95) {
        nextReading.temperature = cryoTemp - 0.05 + noise() * 0.02;
        nextReading.current = Math.max(0, nextReading.current - 800); // beam dump extraction discharges current
        nextReading.power = Math.max(0, nextReading.power - 100);
        eq.status = "critical";
        eq.healthScore = Math.max(30, eq.healthScore - 3);
      } else {
        nextReading.temperature = 1.84 + noise() * 0.01;
        // if discharged, ramp back up slowly
        if (nextReading.current < 11800) {
          nextReading.current = Math.min(11850, nextReading.current + 200);
          nextReading.power = Math.min(1416, nextReading.power + 25);
        } else {
          nextReading.current = 11820 + noise() * 5;
          nextReading.power = 1416 + noise() * 2;
        }
        eq.status = "nominal";
        eq.healthScore = Math.min(98, eq.healthScore + 0.5);
      }
    } else if (eq.id === "EQ-BEA-A1") {
      nextReading.temperature = 22.1 + noise() * 0.1;
      nextReading.pressure = 1.2e-11 + noise() * 0.05e-11;
      eq.status = "nominal";
    } else if (eq.id === "EQ-COO-A1") {
      nextReading.temperature = 12.4 + noise() * 0.05;
      nextReading.pressure = 6.15 + noise() * 0.02;
      nextReading.power = 58 + noise() * 0.5;
      eq.status = "nominal";
    }

    eq.telemetry.push(nextReading);
    if (eq.telemetry.length > 30) {
      eq.telemetry.shift();
    }
  });
}, 3000);

// API ROUTES

// Telemetry state endpoint
app.get("/api/telemetry", (req, res) => {
  res.json({
    equipment: equipmentList,
    alarms: alarms,
    incidents: incidents
  });
});

// Trigger a simulation outage
app.post("/api/telemetry/simulate", (req, res) => {
  const { type } = req.body; // 'cryo' | 'converter' | 'none'
  if (type === 'cryo' || type === 'converter' || type === 'none') {
    simSpikeType = type;
    res.json({ success: true, status: `Simulation updated to ${type}` });
  } else {
    res.status(400).json({ error: "Invalid simulation type" });
  }
});

// Alarm actions
app.post("/api/alarms/:id/action", (req, res) => {
  const { id } = req.params;
  const { action, note } = req.body; // 'acknowledge' | 'escalate' | 'resolve'
  
  const alarm = alarms.find(a => a.id === id);
  if (!alarm) {
    return res.status(404).json({ error: "Alarm not found" });
  }

  const timestamp = new Date().toISOString();

  if (action === "acknowledge") {
    alarm.status = "acknowledged";
    alarm.timeline.push({ time: timestamp, event: `Acknowledged: ${note || "Operations engineer investigating standard procedures."}` });
    
    // update incident
    const inc = incidents.find(i => i.alarmId === id);
    if (inc) {
      inc.status = "mitigating";
      inc.updatedTime = timestamp;
    }
  } else if (action === "escalate") {
    alarm.severity = "critical";
    alarm.timeline.push({ time: timestamp, event: `Escalated: ${note || "Escalated to Division Group Leader."}` });
    
    const inc = incidents.find(i => i.alarmId === id);
    if (inc) {
      inc.severity = "critical";
      inc.status = "mitigating";
      inc.updatedTime = timestamp;
    }
  } else if (action === "resolve") {
    alarm.status = "resolved";
    alarm.timeline.push({ time: timestamp, event: `Resolved: ${note || "System restored to Nominal limits. Quench vectors cleared."}` });
    
    // Reset simulation
    simSpikeType = "none";

    const inc = incidents.find(i => i.alarmId === id);
    if (inc) {
      inc.status = "resolved";
      inc.updatedTime = timestamp;
      inc.resolution = note || "Hardware inspected and system reset to nominal setpoints.";
    }

    // also restore equipment status
    const eq = equipmentList.find(e => e.id === alarm.equipmentId);
    if (eq) {
      eq.status = "nominal";
      eq.healthScore = 95;
    }
  }

  res.json({ success: true, alarm, incidents });
});

// Incidents routes
app.post("/api/incidents/:id/postmortem", async (req, res) => {
  const { id } = req.params;
  const { rootCause, resolution, notes } = req.body;
  
  const inc = incidents.find(i => i.id === id);
  if (!inc) {
    return res.status(404).json({ error: "Incident not found" });
  }

  inc.status = "postmortem";
  inc.rootCause = rootCause || "Component wear combined with unexpected voltage transients.";
  inc.resolution = resolution || "Replaced thermistor assemblies and updated safety interlock thresholds.";
  
  // Call Gemini to generate a high-quality runbook postmortem markdown!
  try {
    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Draft an official CERN scientific equipment incident postmortem report. 
Incident ID: ${inc.id}
Equipment: ${inc.equipmentId}
Alarm ID: ${inc.alarmId}
Incident Title: ${inc.title}
Root Cause: ${inc.rootCause}
Resolution: ${inc.resolution}
Additional Notes: ${notes || "None"}

Please write an enterprise-ready postmortem with sections:
1. Executive Summary
2. Telemetry and Event Timeline
3. Detailed Root Cause Analysis
4. Immediate Corrective Actions
5. Long-term Preventative Measures

Format the output strictly as Markdown. Do not include self-praise. Keep the tone rigorous and engineering-focused.`,
      config: {
        systemInstruction: "You are the CERN Digital Twin Operations Lead and Senior Instrumentation Engineer."
      }
    });

    inc.postmortem = response.text;
  } catch (err: any) {
    console.error("Gemini Postmortem generation error:", err);
    inc.postmortem = `# Incident Postmortem ${inc.id} (Fallback Summary)\n\n**Owner**: Operations Control Room\n\n### Summary\nIncident triggered for ${inc.equipmentId} due to critical signal deviation.\n\n### Root Cause\n${inc.rootCause}\n\n### Resolution\n${inc.resolution}`;
  }

  res.json({ success: true, incident: inc });
});

// Requirements API
app.get("/api/requirements", (req, res) => {
  res.json(requirements);
});

app.post("/api/requirements", (req, res) => {
  const { title, type, subsystem, equipmentId, description } = req.body;
  
  const newReq: Requirement = {
    id: `REQ-${String(requirements.length + 1).padStart(3, "0")}`,
    title: title || "New Equipment Baseline",
    type: type || "functional",
    status: "draft",
    description: description || "Specification is being formulated.",
    subsystem: subsystem || "General",
    equipmentId: equipmentId || "EQ-MAG-A1"
  };

  requirements.unshift(newReq);
  res.json({ success: true, requirement: newReq });
});

// Support tickets
app.get("/api/tickets", (req, res) => {
  res.json(tickets);
});

app.post("/api/tickets", (req, res) => {
  const { title, category, priority, description, author } = req.body;
  const newTicket: SupportTicket = {
    id: `TCK-${tickets.length + 101}`,
    title: title || "Equipment Issue Report",
    category: category || "bug",
    priority: priority || "medium",
    status: "open",
    author: author || " jitenmoni8@gmail.com",
    description: description || "Detailed ticket description.",
    slaHours: priority === "high" ? 24 : priority === "medium" ? 72 : 168,
    createdTime: new Date().toISOString()
  };
  tickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

app.post("/api/tickets/:id/resolve", (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;
  const ticket = tickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = "resolved";
    ticket.resolution = resolution || "Verified by hardware technician and resolved.";
    res.json({ success: true, ticket });
  } else {
    res.status(404).json({ error: "Ticket not found" });
  }
});

// Engineering Wikis
app.get("/api/wiki", (req, res) => {
  res.json(wikiPages);
});

app.post("/api/wiki", (req, res) => {
  const { title, category, content, author } = req.body;
  const newPage: WikiPage = {
    id: `WKI-${String(wikiPages.length + 1).padStart(3, "0")}`,
    title: title || "New Procedure",
    category: category || "manual",
    content: content || "# Untitled Entry\n\nAdd documentation here.",
    lastUpdated: new Date().toISOString(),
    author: author || " jitenmoni8@gmail.com"
  };
  wikiPages.unshift(newPage);
  res.json({ success: true, page: newPage });
});

app.put("/api/wiki/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const page = wikiPages.find(p => p.id === id);
  if (page) {
    if (title) page.title = title;
    if (content) page.content = content;
    if (category) page.category = category;
    page.lastUpdated = new Date().toISOString();
    res.json({ success: true, page });
  } else {
    res.status(404).json({ error: "Page not found" });
  }
});

// Maintenance tasks
app.get("/api/maintenance", (req, res) => {
  res.json(maintenanceTasks);
});

app.post("/api/maintenance", (req, res) => {
  const { title, equipmentId, type, date, durationHours, technician, description } = req.body;
  const newTask: MaintenanceTask = {
    id: `MNT-${maintenanceTasks.length + 201}`,
    title: title || "Scheduled Inspection",
    equipmentId: equipmentId || "EQ-MAG-A1",
    type: type || "preventive",
    status: "scheduled",
    date: date || new Date().toISOString().split('T')[0],
    durationHours: Number(durationHours) || 4,
    technician: technician || "Jean-Pierre",
    description: description || "Preventive calibration of cryogenic controls."
  };
  maintenanceTasks.unshift(newTask);
  res.json({ success: true, task: newTask });
});

// Sprint Workspace
app.get("/api/sprint", (req, res) => {
  res.json(sprintTasks);
});

app.post("/api/sprint", (req, res) => {
  const { title, points, description, assignee } = req.body;
  const newTask: SprintTask = {
    id: `SPR-${sprintTasks.length + 301}`,
    title: title || "Engineering backlog item",
    points: Number(points) || 3,
    column: "backlog",
    assignee: assignee || "Elena Rostova",
    description: description || "No description provided."
  };
  sprintTasks.unshift(newTask);
  res.json({ success: true, task: newTask });
});

app.put("/api/sprint/:id", (req, res) => {
  const { id } = req.params;
  const { column } = req.body;
  const task = sprintTasks.find(t => t.id === id);
  if (task) {
    task.column = column;
    res.json({ success: true, task });
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Release notes
app.get("/api/releases", (req, res) => {
  res.json(releaseNodes);
});

app.post("/api/releases/deploy/:id", (req, res) => {
  const { id } = req.params;
  const rel = releaseNodes.find(r => r.id === id);
  if (rel) {
    rel.status = "deployed";
    rel.releaseDate = new Date().toISOString().split('T')[0];
    rel.approvalChain.forEach(c => c.approved = true);
    res.json({ success: true, release: rel });
  } else {
    res.status(404).json({ error: "Release not found" });
  }
});

// DevOps status endpoint
app.get("/api/devops", (req, res) => {
  res.json({
    containers: devopsContainers,
    pods: devopsPods,
    builds: pipelineBuilds
  });
});

app.post("/api/devops/container/toggle", (req, res) => {
  const { id } = req.body;
  const con = devopsContainers.find(c => c.id === id);
  if (con) {
    con.status = con.status === "running" ? "stopped" : "running";
    con.cpu = con.status === "running" ? (con.id === 'con-telemetry' ? 1.2 : con.id === 'con-interlock' ? 0.5 : 2.4) : 0;
    con.memory = con.status === "running" ? (con.id === 'con-telemetry' ? 128 : con.id === 'con-interlock' ? 64 : 512) : 0;
    res.json({ success: true, container: con });
  } else {
    res.status(404).json({ error: "Container not found" });
  }
});

app.post("/api/devops/build/trigger", (req, res) => {
  const newBuild: PipelineBuild = {
    id: `BUILD-${pipelineBuilds.length + 701}`,
    branch: "main",
    commit: Math.random().toString(16).substring(2, 9),
    status: "running",
    durationSeconds: 0,
    timestamp: new Date().toISOString(),
    steps: [
      { name: "Lint Check", status: "running", duration: 0 },
      { name: "Unit Tests", status: "queued", duration: 0 },
      { name: "Docker Build", status: "queued", duration: 0 },
      { name: "K8s Dryrun Deploy", status: "queued", duration: 0 }
    ]
  };
  pipelineBuilds.unshift(newBuild);

  // Simulate pipeline running
  let currentStepIndex = 0;
  const interval = setInterval(() => {
    const build = pipelineBuilds.find(b => b.id === newBuild.id);
    if (!build) {
      clearInterval(interval);
      return;
    }

    if (currentStepIndex < build.steps.length) {
      build.steps[currentStepIndex].status = "success";
      build.steps[currentStepIndex].duration = 10 + Math.floor(Math.random() * 20);
      build.durationSeconds += build.steps[currentStepIndex].duration;
      currentStepIndex++;

      if (currentStepIndex < build.steps.length) {
        build.steps[currentStepIndex].status = "running";
      } else {
        build.status = "success";
        clearInterval(interval);
      }
    }
  }, 4000);

  res.json({ success: true, build: newBuild });
});

// AI COPILOT ENDPOINT
app.post("/api/ai/copilot", async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const ai = getGemini();
    
    // Enrich prompt with relevant database context if requested
    let contextString = "";
    if (context) {
      contextString = `Here is the current digital twin status context for your engineering diagnosis:\n` + JSON.stringify(context, null, 2);
    }

    const systemInstruction = `You are the CERN Digital Twin AI Engineering Copilot. 
You are a top-tier instrumentation, scientific computing, cryogenic, and beam safety engineer at CERN.
Your role is to help operators analyze real-time alarms, diagnose cryogenic and superconducting magnet failures, auto-generate requirements, suggest corrective runbooks, and explain telemetry anomalies.
Speak clearly, with objective engineering precision. Always use precise, professional CERN terminologies. 
Do not include self-praise. Provide answers in markdown format with clear headings, bullet points, logs, and diagnostic checklists.`;

    const userMessage = `${contextString}\n\nUser Query: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userMessage,
      config: {
        systemInstruction
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Copilot error:", err);
    res.status(500).json({ 
      error: "AI Copilot failed to process the request",
      details: err.message,
      text: `### AI Diagnosis Offline (Local Diagnostic Engine Fallback)\n\nI was unable to contact the cloud Gemini model, but based on the local telemetry signatures, here is my deterministic engineering analysis:\n\n- **Diagnostic Pattern**: High thermal variance in cryogenic refrigeration unit CDU-A1.\n- **Recommended Checklist**:\n  1. Inspect the cold compressor pump speeds.\n  2. Check the superfluid helium level indicators.\n  3. Verify that the beam dump safety valves have tripped cleanly.\n\n*Please ensure your GEMINI_API_KEY is configured in the AI Studio Secrets panel to restore fully cognitive AI intelligence.*`
    });
  }
});


// Serve static Vite bundle in production, otherwise pass through Vite middlewares
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Accelerator Digital Twin Platform server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
