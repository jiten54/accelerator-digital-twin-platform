import React, { useState } from "react";
import { Equipment, MaintenanceTask } from "../types";
import { Zap, Shield, Cpu, Wind, Thermometer, RefreshCw, Layers, Wrench, Settings } from "lucide-react";

interface EquipmentExplorerProps {
  equipmentList: Equipment[];
  selectedId: string;
  maintenanceTasks: MaintenanceTask[];
  onSelectEquipment: (id: string) => void;
  onScheduleMaintenance: (title: string, equipmentId: string, type: string, date: string, duration: number, technician: string, description: string) => void;
}

export default function EquipmentExplorer({ 
  equipmentList, 
  selectedId, 
  maintenanceTasks, 
  onSelectEquipment,
  onScheduleMaintenance 
}: EquipmentExplorerProps) {
  const [showMntForm, setShowMntForm] = useState(false);
  const [mntTitle, setMntTitle] = useState("");
  const [mntType, setMntType] = useState<"preventive" | "corrective" | "calibration">("preventive");
  const [mntTech, setMntTech] = useState("Jean-Pierre");
  const [mntDate, setMntDate] = useState("");
  const [mntDur, setMntDur] = useState(4);
  const [mntDesc, setMntDesc] = useState("");

  const activeEq = equipmentList.find(e => e.id === selectedId) || equipmentList[0];

  if (!activeEq) {
    return <div className="text-center text-slate-500 font-mono py-12">No equipment loaded in the system.</div>;
  }

  // Filter tasks for this equipment
  const eqTasks = maintenanceTasks.filter(t => t.equipmentId === activeEq.id);

  const getIcon = (type: string) => {
    switch (type) {
      case "magnet": return <Zap className="w-5 h-5 text-amber-400" />;
      case "converter": return <Cpu className="w-5 h-5 text-teal-400" />;
      case "beamline": return <Wind className="w-5 h-5 text-cyan-400" />;
      case "cryo": return <Thermometer className="w-5 h-5 text-blue-400" />;
      case "cooling": return <RefreshCw className="w-5 h-5 text-sky-400" />;
      default: return <Settings className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nominal": return "text-emerald-400 bg-emerald-950/40 border-emerald-900";
      case "warning": return "text-amber-400 bg-amber-950/40 border-amber-900 animate-pulse";
      case "critical": return "text-rose-400 bg-rose-950/40 border-rose-900 animate-bounce";
      default: return "text-blue-400 bg-blue-950/40 border-blue-900";
    }
  };

  const latestTelemetry = activeEq.telemetry[activeEq.telemetry.length - 1];

  const handleMntSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mntTitle.trim()) return;
    onScheduleMaintenance(
      mntTitle,
      activeEq.id,
      mntType,
      mntDate || new Date().toISOString().split('T')[0],
      mntDur,
      mntTech,
      mntDesc
    );
    setMntTitle("");
    setMntDesc("");
    setShowMntForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="equipment-explorer">
      
      {/* Sidebar Selector list */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-5 lg:col-span-1">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4.5">Equipment Inventory</h3>
        <div className="space-y-2.5 max-h-[350px] lg:max-h-[500px] overflow-y-auto custom-scrollbar">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              onClick={() => onSelectEquipment(eq.id)}
              className={`p-3.5 border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                selectedId === eq.id
                  ? 'bg-[#18181b] border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-black/30 border-[#18181b] hover:bg-[#18181b]/50'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="bg-black p-2 border border-[#18181b] flex-shrink-0">
                  {getIcon(eq.type)}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">{eq.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black mt-0.5 block">{eq.id} • {eq.sector}</span>
                </div>
              </div>

              <span className={`w-2.5 h-2.5 flex-shrink-0 ${
                eq.status === 'nominal' ? 'bg-emerald-500' :
                eq.status === 'warning' ? 'bg-amber-500 animate-pulse' :
                eq.status === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="lg:col-span-2 space-y-6 text-left">
        <div className="bg-[#0c0c0e] border border-[#18181b] p-6 space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18181b] pb-5">
            <div className="flex items-center gap-4">
              <div className="bg-black p-3.5 border border-[#18181b]">
                {getIcon(activeEq.type)}
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">{activeEq.id}</span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider mt-1">{activeEq.name}</h2>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-black border border-[#18181b] px-4 py-1.5 text-center">
                <span className="block text-[8px] text-slate-500 uppercase font-mono font-black tracking-widest">Health Index</span>
                <span className="text-sm font-black font-mono text-cyan-400">{activeEq.healthScore}%</span>
              </div>
              <div className={`px-4 py-1.5 border text-center font-mono ${getStatusColor(activeEq.status)}`}>
                <span className="block text-[8px] opacity-70 uppercase font-mono font-black tracking-widest">Ops Status</span>
                <span className="text-xs font-black uppercase tracking-widest">{activeEq.status}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Real-time Grid */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Live Telemetry Sensors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Current */}
              <div className="bg-black border border-[#18181b] p-4 text-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest">Output Current</span>
                <div className="text-lg font-black font-mono text-cyan-400 mt-2">
                  {latestTelemetry ? `${latestTelemetry.current.toLocaleString(undefined, { maximumFractionDigits: 0 })} A` : "0 A"}
                </div>
              </div>

              {/* Voltage */}
              <div className="bg-black border border-[#18181b] p-4 text-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest">Output Voltage</span>
                <div className="text-lg font-black font-mono text-teal-400 mt-2">
                  {latestTelemetry ? `${latestTelemetry.voltage.toFixed(1)} V` : "0.0 V"}
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-black border border-[#18181b] p-4 text-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest">Temperature</span>
                <div className="text-lg font-black font-mono text-rose-400 mt-2">
                  {latestTelemetry ? (activeEq.type === 'cryo' || activeEq.type === 'magnet' ? `${latestTelemetry.temperature.toFixed(2)} K` : `${latestTelemetry.temperature.toFixed(1)} °C`) : "N/A"}
                </div>
              </div>

              {/* Pressure */}
              <div className="bg-black border border-[#18181b] p-4 text-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest">Pressure</span>
                <div className="text-lg font-black font-mono text-indigo-400 mt-2">
                  {latestTelemetry ? (activeEq.type === 'beamline' ? `${latestTelemetry.pressure.toExponential(2)} mbar` : `${latestTelemetry.pressure.toFixed(2)} bar`) : "0.00 bar"}
                </div>
              </div>

            </div>
          </div>

          {/* Specifications Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Engineering Design Baseline</h3>
              <div className="bg-black/40 border border-[#18181b] overflow-hidden text-xs">
                {Object.entries(activeEq.specs).map(([key, val], idx) => (
                  <div key={idx} className="flex justify-between p-3 border-b border-[#18181b] hover:bg-black/40">
                    <span className="text-slate-400 uppercase font-black text-[9px] tracking-widest">{key}</span>
                    <span className="font-black text-slate-200 font-mono">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 hover:bg-black/40">
                  <span className="text-slate-400 uppercase font-black text-[9px] tracking-widest">Assigned Shift Lead</span>
                  <span className="font-black text-cyan-400 font-mono">{activeEq.assignedEngineer}</span>
                </div>
              </div>
            </div>

            {/* Maintenance task logs */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Maintenance Log</h3>
                <button
                  onClick={() => setShowMntForm(!showMntForm)}
                  className="text-[10px] font-black uppercase font-mono text-cyan-400 hover:underline cursor-pointer"
                >
                  Schedule New
                </button>
              </div>

              {showMntForm && (
                <form onSubmit={handleMntSubmit} className="bg-black border border-[#18181b] p-4.5 space-y-3.5 mb-4 text-xs font-mono">
                  <div className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">Schedule Task</div>
                  <input
                    type="text"
                    required
                    value={mntTitle}
                    onChange={(e) => setMntTitle(e.target.value)}
                    placeholder="Task name, e.g. Inspect Cryostat Seal"
                    className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={mntType}
                      onChange={(e: any) => setMntType(e.target.value)}
                      className="w-full bg-[#0c0c0e] border border-[#18181b] px-2 py-2 text-slate-200 text-xs uppercase font-black"
                    >
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="calibration">Calibration</option>
                    </select>
                    <input
                      type="date"
                      value={mntDate}
                      onChange={(e) => setMntDate(e.target.value)}
                      className="w-full bg-[#0c0c0e] border border-[#18181b] px-2 py-2 text-slate-200 text-xs"
                    />
                  </div>
                  <textarea
                    value={mntDesc}
                    onChange={(e) => setMntDesc(e.target.value)}
                    placeholder="Short description of task..."
                    rows={2}
                    className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end gap-2.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setShowMntForm(false)}
                      className="text-slate-400 px-3 py-1.5 bg-[#18181b] uppercase font-black tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-white px-4 py-1.5 bg-cyan-600 font-black uppercase tracking-widest"
                    >
                      Schedule
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                {eqTasks.map((t) => (
                  <div key={t.id} className="bg-black/30 border border-[#18181b] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-white flex items-center gap-1.5 uppercase tracking-wide text-xs">
                        <Wrench className="w-3.5 h-3.5 text-slate-500" />
                        {t.title}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] uppercase font-black tracking-widest border ${
                        t.status === 'completed' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/20' : 'bg-blue-950/20 text-blue-400 border-blue-900/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-bold">{t.description}</p>
                    <div className="text-[9px] text-slate-500 font-mono mt-2 flex justify-between uppercase font-black tracking-wider">
                      <span>Tech: {t.technician} • {t.durationHours} hrs</span>
                      <span>Date: {t.date}</span>
                    </div>
                  </div>
                ))}
                {eqTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-xs font-mono uppercase font-black tracking-widest">
                    No scheduled inspections mapped.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
