import React, { useState } from "react";
import { Requirement, Equipment } from "../types";
import { Plus, Shield, ShieldCheck, HelpCircle, Layers, Link2 } from "lucide-react";

interface RequirementsListProps {
  requirements: Requirement[];
  equipmentList: Equipment[];
  onAddRequirement: (title: string, type: 'functional' | 'performance' | 'safety', subsystem: string, equipmentId: string, description: string) => void;
}

export default function RequirementsList({ requirements, equipmentList, onAddRequirement }: RequirementsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'functional' | 'performance' | 'safety'>("functional");
  const [subsystem, setSubsystem] = useState("Magnet Protection");
  const [equipmentId, setEquipmentId] = useState(equipmentList[0]?.id || "EQ-MAG-A1");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddRequirement(title, type, subsystem, equipmentId, description);
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "safety":
        return <span className="bg-rose-950/20 border border-rose-900/30 text-rose-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Safety</span>;
      case "performance":
        return <span className="bg-cyan-950/20 border border-cyan-900/30 text-cyan-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Performance</span>;
      default:
        return <span className="bg-[#18181b] border border-[#27272a] text-slate-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Functional</span>;
    }
  };

  return (
    <div className="space-y-6" id="requirements-panel">
      
      {/* Traceability Header */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="text-center md:text-left">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">System Engineering Traceability</span>
          <h3 className="text-base font-black text-white uppercase tracking-wider mt-1.5">CERN Accelerator Requirements Baselines</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">Formal verification trace linking: Requirement → Subsystem → Equipment → Release.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Draft Requirement Specification
        </button>
      </div>

      {/* Form collapse */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-black border border-[#18181b] p-5 space-y-4 font-mono text-left">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Draft New Requirement</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">SPECIFICATION TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Helium reservoir temperature gauge sensitivity limit"
                required
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">SPECIFICATION TYPE</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none uppercase font-black"
              >
                <option value="functional">Functional</option>
                <option value="performance">Performance</option>
                <option value="safety">Safety (Critical)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">TARGET SUBSYSTEM</label>
              <input
                type="text"
                value={subsystem}
                onChange={(e) => setSubsystem(e.target.value)}
                placeholder="Cryogenics Control"
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">LINKED EQUIPMENT TARGET</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none uppercase font-black"
              >
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.id} ({eq.name.split(' ')[0]})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">TECHNICAL SPECIFICATION DESCRIPTION</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed technical bounds, limits, and interlock timings..."
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-[#18181b] text-slate-300 px-3.5 py-2 uppercase font-black tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-cyan-600 text-white px-4 py-2 font-black uppercase tracking-widest"
            >
              Baseline Requirement
            </button>
          </div>
        </form>
      )}

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((req) => {
          const linkedEquipment = equipmentList.find(e => e.id === req.equipmentId);
          return (
            <div key={req.id} className="bg-[#0c0c0e]/60 border border-[#18181b] p-5 text-left flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-[#18181b] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest">{req.id}</span>
                    <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 uppercase tracking-widest">
                      {req.subsystem}
                    </span>
                  </div>
                  {getTypeBadge(req.type)}
                </div>

                <h4 className="text-xs font-black text-white mt-3 uppercase tracking-wide">{req.title}</h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-bold uppercase tracking-wide">{req.description}</p>
              </div>

              {/* Traceability chain map */}
              <div className="bg-black border border-[#18181b] p-3 text-[10px] text-slate-500 space-y-1.5 font-mono uppercase font-black tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subsystem:</span>
                  <span className="text-slate-300">{req.subsystem}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Equipment:</span>
                  <span className="text-cyan-400">{req.equipmentId} ({linkedEquipment?.name.split(' ')[0]})</span>
                </div>
                {req.sprintTaskId && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 inline-block"></span>
                    <span>Sprint:</span>
                    <span className="text-emerald-400">{req.sprintTaskId}</span>
                  </div>
                )}
                {req.releaseVersion && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 inline-block"></span>
                    <span>Release:</span>
                    <span className="text-blue-400">{req.releaseVersion}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
