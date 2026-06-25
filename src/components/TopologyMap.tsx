import { useState, useEffect } from "react";
import { Equipment } from "../types";
import { Zap, ShieldAlert, Cpu, Thermometer, Wind, RefreshCw } from "lucide-react";

interface TopologyMapProps {
  equipment: Equipment[];
  selectedId: string;
  onSelectEquipment: (id: string) => void;
}

export default function TopologyMap({ equipment, selectedId, onSelectEquipment }: TopologyMapProps) {
  const [beamVelocity, setBeamVelocity] = useState(1);
  const [beamActive, setBeamActive] = useState(true);

  // Determine global status based on equipment status
  const isAnyCritical = equipment.some(e => e.status === "critical");
  const isAnyWarning = equipment.some(e => e.status === "warning");

  useEffect(() => {
    if (isAnyCritical) {
      setBeamVelocity(0); // Beam is dumped!
      setBeamActive(false);
    } else if (isAnyWarning) {
      setBeamVelocity(0.4); // Beam degraded
      setBeamActive(true);
    } else {
      setBeamVelocity(1.5); // Nominal velocity
      setBeamActive(true);
    }
  }, [isAnyCritical, isAnyWarning]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nominal": return "#10b981"; // green-500
      case "warning": return "#f59e0b"; // amber-500
      case "critical": return "#ef4444"; // red-500
      case "maintenance": return "#3b82f6"; // blue-500
      default: return "#6b7280";
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case "nominal": return "shadow-[0_0_15px_rgba(16,185,129,0.4)] border-[#10b981]";
      case "warning": return "shadow-[0_0_15px_rgba(245,158,11,0.4)] border-[#f59e0b] animate-pulse";
      case "critical": return "shadow-[0_0_25px_rgba(239,68,68,0.7)] border-[#ef4444] animate-ping-slow";
      case "maintenance": return "shadow-[0_0_15px_rgba(59,130,246,0.4)] border-[#3b82f6]";
      default: return "border-gray-700";
    }
  };

  return (
    <div className="bg-[#0c0c0e] border border-[#18181b] p-6 relative overflow-hidden" id="digital-twin-map">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${beamActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${beamActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            Sector A - Beamline Digital Twin Map
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Click any component below to view telemetry in the Operations Control Panel</p>
        </div>

        <div className="flex items-center gap-4 bg-[#09090b] border border-[#18181b] px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Beam State:</span>
            <span className={`font-mono font-black ${beamActive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {beamActive ? "Circulating (Steady)" : "DUMPED / INTERLOCKED"}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-[#18181b]" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Beam Intensity:</span>
            <span className="font-mono text-cyan-500">
              {beamActive ? `${(3.2e14 * (beamVelocity > 0.5 ? 1 : 0.6)).toExponential(2)} p` : "0.00e00 p"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Digital Twin */}
      <div className="w-full relative min-h-[300px] flex items-center justify-center bg-black/40 rounded-xl p-6 border border-[#18181b]">
        
        {/* SVG Layout */}
        <svg viewBox="0 0 800 240" className="w-full max-w-4xl h-auto" id="svg-accelerator-ring">
          <defs>
            {/* Gradients */}
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
            </linearGradient>
            
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND STRUCTURE LINES */}
          <line x1="50" y1="120" x2="750" y2="120" stroke="#18181b" strokeWidth="16" strokeLinecap="round" />
          <line x1="50" y1="120" x2="750" y2="120" stroke="#09090b" strokeWidth="6" strokeLinecap="round" />

          {/* ACTIVE BEAM PATH (Circulating protons) */}
          {beamActive && (
            <>
              <line 
                x1="50" y1="120" x2="750" y2="120" 
                stroke="url(#beamGradient)" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="opacity-70"
              />
              {/* Moving proton particles */}
              <circle r="4" fill="#67e8f9" filter="url(#glowGreen)">
                <animateMotion 
                  path="M 50,120 L 750,120" 
                  dur={`${4 / beamVelocity}s`} 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle r="3.5" fill="#38bdf8">
                <animateMotion 
                  path="M 50,120 L 750,120" 
                  dur={`${4.2 / beamVelocity}s`} 
                  begin="1s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle r="3.5" fill="#a5f3fc">
                <animateMotion 
                  path="M 50,120 L 750,120" 
                  dur={`${3.8 / beamVelocity}s`} 
                  begin="2.2s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </>
          )}

          {/* DUMP INDICATOR */}
          {!beamActive && (
            <text x="400" y="80" fill="#f43f5e" textAnchor="middle" className="text-[10px] font-mono font-black uppercase tracking-widest animate-pulse">
              ⚠️ BEAM DUMP ACTION TRIGGERED BY SAFETY INTERLOCK (50ms ACTUATOR TIME)
            </text>
          )}

          {/* CRYOGENIC HELIUM DISTRIBUTION LINE (Top side) */}
          <path d="M 120,40 L 680,40" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="5,5" fill="none" opacity="0.8" />
          <text x="400" y="30" fill="#0ea5e9" textAnchor="middle" className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">
            Cryogenic Superfluid Helium transfer line (1.8K)
          </text>

          {/* EQUIPMENT COMPONENT CLUSTER PLACEMENTS */}

          {/* EQ-MAG-A1 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-MAG-A1")}
          >
            <rect 
              x="100" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-MAG-A1" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-MAG-A1")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-MAG-A1" ? 3 : 1.5}
            />
            <circle cx="140" cy="120" r="15" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            <text x="140" y="123" textAnchor="middle" fill="#22d3ee" className="text-[10px] font-black font-mono">DPL</text>
            <text x="140" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">MAG-A1</text>
            {equipment.find(e => e.id === "EQ-MAG-A1")?.status !== "nominal" && (
              <circle cx="170" cy="100" r="6" fill="#ef4444" className="animate-ping" />
            )}
          </g>

          {/* EQ-CON-A1 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-CON-A1")}
          >
            <rect 
              x="220" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-CON-A1" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-CON-A1")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-CON-A1" ? 3 : 1.5}
            />
            <rect x="235" y="110" width="50" height="20" fill="#09090b" rx="1" stroke="#18181b" strokeWidth="2" />
            <path d="M245 120 H275" stroke="#f43f5e" strokeWidth="2" />
            <path d="M255 115 L265 125" stroke="#f43f5e" strokeWidth="2" />
            <text x="260" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">RPC-A1</text>
            {equipment.find(e => e.id === "EQ-CON-A1")?.status !== "nominal" && (
              <circle cx="290" cy="100" r="6" fill="#f59e0b" className="animate-pulse" />
            )}
          </g>

          {/* EQ-MAG-A2 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-MAG-A2")}
          >
            <rect 
              x="340" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-MAG-A2" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-MAG-A2")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-MAG-A2" ? 3 : 1.5}
            />
            <circle cx="380" cy="120" r="15" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            <text x="380" y="123" textAnchor="middle" fill="#22d3ee" className="text-[10px] font-black font-mono">QPD</text>
            <text x="380" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">MAG-A2</text>
          </g>

          {/* EQ-BEA-A1 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-BEA-A1")}
          >
            <rect 
              x="460" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-BEA-A1" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-BEA-A1")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-BEA-A1" ? 3 : 1.5}
            />
            <line x1="470" y1="120" x2="530" y2="120" stroke="#22d3ee" strokeWidth="2.5" />
            <circle cx="500" cy="120" r="8" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            <text x="500" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">BEA-A1</text>
          </g>

          {/* EQ-CRY-A1 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-CRY-A1")}
          >
            {/* Cryogenic cooling connection pipe */}
            <path d="M 620,40 L 620,90" stroke="#0ea5e9" strokeWidth="3" fill="none" opacity="0.6" />
            
            <rect 
              x="580" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-CRY-A1" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-CRY-A1")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-CRY-A1" ? 3 : 1.5}
            />
            <ellipse cx="620" cy="120" rx="14" ry="10" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            <text x="620" y="123" textAnchor="middle" fill="#0284c7" className="text-[10px] font-black font-mono">CRYO</text>
            <text x="620" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">CDU-A1</text>
            {equipment.find(e => e.id === "EQ-CRY-A1")?.status !== "nominal" && (
              <circle cx="650" cy="100" r="7" fill="#ef4444" className="animate-ping" />
            )}
          </g>

          {/* EQ-COO-A1 */}
          <g 
            className="cursor-pointer group" 
            onClick={() => onSelectEquipment("EQ-COO-A1")}
          >
            <rect 
              x="680" y="90" width="80" height="60" rx="2" 
              fill={selectedId === "EQ-COO-A1" ? "#18181b" : "#0c0c0e"}
              stroke={getStatusColor(equipment.find(e => e.id === "EQ-COO-A1")?.status || "nominal")}
              strokeWidth={selectedId === "EQ-COO-A1" ? 3 : 1.5}
            />
            <circle cx="720" cy="120" r="12" fill="#09090b" stroke="#18181b" strokeWidth="2" />
            <path d="M714 114 L726 126 M726 114 L714 126" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="720" y="172" textAnchor="middle" fill="#cbd5e1" className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-500 transition-colors">COO-A1</text>
          </g>

        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-6 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Nominal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping-slow"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Equipment quick highlights */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
        {equipment.map((eq) => (
          <div
            key={eq.id}
            onClick={() => onSelectEquipment(eq.id)}
            className={`p-3 border text-left cursor-pointer transition-all ${
              selectedId === eq.id 
                ? 'bg-[#18181b] border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]' 
                : 'bg-[#0c0c0e]/40 border-[#18181b] hover:bg-[#0c0c0e]/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black font-mono text-slate-500">{eq.id}</span>
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStatusColor(eq.status) }} 
              />
            </div>
            <div className="text-xs font-black uppercase tracking-wide text-white mt-2 truncate">{eq.name.split(' ')[0]} {eq.name.split(' ')[1] || ""}</div>
            <div className="text-[10px] font-black font-mono text-cyan-500 mt-2 flex items-center gap-1 uppercase tracking-wider">
              {eq.type === 'magnet' && <Zap className="w-3 h-3 text-amber-500" />}
              {eq.type === 'converter' && <Cpu className="w-3 h-3 text-teal-400" />}
              {eq.type === 'beamline' && <Wind className="w-3 h-3 text-cyan-500" />}
              {eq.type === 'cryo' && <Thermometer className="w-3 h-3 text-blue-500" />}
              {eq.type === 'cooling' && <RefreshCw className="w-3 h-3 text-sky-500" />}
              <span>
                {eq.type === 'cryo' 
                  ? `${eq.telemetry[eq.telemetry.length - 1]?.temperature?.toFixed(2) || 1.82}K` 
                  : eq.type === 'converter'
                  ? `${eq.telemetry[eq.telemetry.length - 1]?.current?.toFixed(0) || 11850}A`
                  : eq.type === 'magnet'
                  ? `${eq.telemetry[eq.telemetry.length - 1]?.temperature?.toFixed(2) || 1.84}K`
                  : `${eq.healthScore}%`
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
