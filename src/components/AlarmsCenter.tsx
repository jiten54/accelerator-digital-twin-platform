import React, { useState } from "react";
import { Alarm, Incident } from "../types";
import { ShieldAlert, AlertTriangle, CheckCircle, FileText, Send, User, ChevronRight, Loader2 } from "lucide-react";

interface AlarmsCenterProps {
  alarms: Alarm[];
  incidents: Incident[];
  onAcknowledge: (id: string, note: string) => void;
  onEscalate: (id: string, note: string) => void;
  onResolve: (id: string, note: string) => void;
  onGeneratePostmortem: (id: string, rootCause: string, resolution: string, notes: string) => void;
}

export default function AlarmsCenter({ alarms, incidents, onAcknowledge, onEscalate, onResolve, onGeneratePostmortem }: AlarmsCenterProps) {
  const [selectedAlarmId, setSelectedAlarmId] = useState<string>(alarms[0]?.id || "");
  const [actionNote, setActionNote] = useState("");
  const [isGeneratingPm, setIsGeneratingPm] = useState(false);

  // Postmortem Form fields
  const [rc, setRc] = useState("");
  const [resol, setResol] = useState("");
  const [pmNotes, setPmNotes] = useState("");

  const activeAlarm = alarms.find(a => a.id === selectedAlarmId) || alarms[0];
  const linkedIncident = activeAlarm ? incidents.find(i => i.alarmId === activeAlarm.id) : null;

  const handleAction = (action: 'acknowledge' | 'escalate' | 'resolve') => {
    if (!activeAlarm) return;
    if (action === 'acknowledge') {
      onAcknowledge(activeAlarm.id, actionNote);
    } else if (action === 'escalate') {
      onEscalate(activeAlarm.id, actionNote);
    } else if (action === 'resolve') {
      onResolve(activeAlarm.id, actionNote);
    }
    setActionNote("");
  };

  const handlePostmortem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedIncident) return;
    setIsGeneratingPm(true);
    await onGeneratePostmortem(linkedIncident.id, rc, resol, pmNotes);
    setIsGeneratingPm(false);
    setRc("");
    setResol("");
    setPmNotes("");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <span className="bg-red-950/50 border border-red-800 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL</span>;
      case "major":
        return <span className="bg-amber-950/50 border border-amber-800 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> MAJOR</span>;
      case "minor":
        return <span className="bg-yellow-950/30 border border-yellow-900/50 text-yellow-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">MINOR</span>;
      default:
        return <span className="bg-blue-950/30 border border-blue-900/50 text-blue-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1">WARNING</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="alarms-workspace">
      
      {/* Alarms Left Panel List */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-4 lg:col-span-1 flex flex-col gap-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Active Faults Log</h3>
        
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] lg:max-h-[500px] custom-scrollbar">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              onClick={() => setSelectedAlarmId(alarm.id)}
              className={`p-3.5 border text-left cursor-pointer transition-all ${
                selectedAlarmId === alarm.id
                  ? 'bg-[#18181b] border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-[#0c0c0e]/40 border-[#18181b] hover:bg-[#18181b]/50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider">
                <span>{alarm.id}</span>
                <span>{new Date(alarm.timestamp).toLocaleTimeString()}</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mt-2.5 truncate">{alarm.equipmentName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5 line-clamp-1">{alarm.message}</p>
              
              <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#18181b]">
                <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border ${
                  alarm.status === "active" ? "bg-rose-950/20 text-rose-400 border-rose-800/30" :
                  alarm.status === "acknowledged" ? "bg-amber-950/20 text-amber-400 border-amber-800/30" :
                  "bg-emerald-950/20 text-emerald-400 border-emerald-800/30"
                }`}>
                  {alarm.status}
                </span>
                
                <span className="text-[9px] text-slate-500 font-black font-mono uppercase tracking-widest">
                  {alarm.severity}
                </span>
              </div>
            </div>
          ))}
          {alarms.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs font-black font-mono uppercase tracking-widest">
              🟢 No active alarm faults detected.
            </div>
          )}
        </div>
      </div>

      {/* Alarms Detail and Incident Response Workspace */}
      <div className="lg:col-span-2 space-y-6">
        
        {activeAlarm ? (
          <div className="bg-[#0c0c0e] border border-[#18181b] p-6 space-y-6 text-left">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18181b] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest">{activeAlarm.id}</span>
                  {getSeverityBadge(activeAlarm.severity)}
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mt-2.5">{activeAlarm.equipmentName}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1.5">{activeAlarm.message}</p>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-black font-mono tracking-widest text-slate-500">Incident Registry Link</span>
                <div className="text-xs font-black font-mono text-cyan-500 uppercase tracking-widest mt-1">
                  {activeAlarm.incidentId || "N/A"}
                </div>
              </div>
            </div>

            {/* Quick Actions (Acknowledge, Escalate, Resolve) */}
            {activeAlarm.status !== "resolved" && (
              <div className="bg-black/40 border border-[#18181b] p-4 space-y-3">
                <div className="text-[9px] font-black font-mono text-slate-500 uppercase tracking-widest">Control Operator Decision Interventions</div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Enter dispatch notes or inspection reports..."
                    className="flex-1 bg-[#09090b] border border-[#18181b] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 uppercase tracking-wider font-bold"
                  />
                  
                  <div className="flex gap-2 justify-end">
                    {activeAlarm.status === "active" && (
                      <button
                        onClick={() => handleAction("acknowledge")}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {activeAlarm.severity !== "critical" && (
                      <button
                        onClick={() => handleAction("escalate")}
                        className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                      >
                        Escalate
                      </button>
                    )}
                    <button
                      onClick={() => handleAction("resolve")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                    >
                      Resolve Fault
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Incident timeline and postmortem tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sequence Event Timeline</h4>
                <div className="border-l border-[#18181b] pl-4 space-y-4 py-1.5">
                  {activeAlarm.timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#09090b] border-2 border-slate-500" />
                      <div className="text-[9px] font-black font-mono text-slate-500 uppercase tracking-wider">{new Date(evt.time).toLocaleTimeString()}</div>
                      <div className="text-xs text-slate-300 font-bold mt-1 uppercase tracking-wide">{evt.event}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Incident Postmortem */}
              {linkedIncident && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">CERN Incident Report</h4>
                    <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-widest border ${
                      linkedIncident.status === 'postmortem' ? 'bg-indigo-950/20 text-indigo-400 border-indigo-900/30' : 'bg-black/40 text-slate-500 border-[#18181b]'
                    }`}>
                      {linkedIncident.status}
                    </span>
                  </div>

                  {linkedIncident.postmortem ? (
                    /* Display Generated Postmortem */
                    <div className="bg-black/40 border border-[#18181b] p-4 max-h-[220px] overflow-y-auto custom-scrollbar text-[11px] font-black font-mono text-slate-300 uppercase tracking-widest space-y-2 leading-relaxed text-left select-text">
                      {linkedIncident.postmortem.split('\n').map((line, idx) => {
                        if (line.startsWith('#')) {
                          return <div key={idx} className="text-cyan-500 font-black border-b border-[#18181b] pb-1.5 mb-2 mt-1">{line.replace(/#/g, '').trim()}</div>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <div key={idx} className="text-white font-black">{line.replace(/\*\*/g, '')}</div>;
                        }
                        return <div key={idx} className="text-slate-400">{line}</div>;
                      })}
                    </div>
                  ) : (
                    /* Form to generate postmortem */
                    linkedIncident.status === 'resolved' ? (
                      <form onSubmit={handlePostmortem} className="bg-black/40 border border-[#18181b] p-4 space-y-3">
                        <div className="text-[9px] font-black font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          Generate Formal AI Postmortem Report
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[8px] text-slate-500 font-black font-mono mb-1 uppercase tracking-widest">IDENTIFIED ROOT CAUSE</label>
                            <input
                              type="text"
                              required
                              value={rc}
                              onChange={(e) => setRc(e.target.value)}
                              placeholder="e.g. Helium cold-compressor friction lockup"
                              className="w-full bg-[#09090b] border border-[#18181b] px-2.5 py-1 text-[11px] text-white focus:outline-none uppercase tracking-wider font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-slate-500 font-black font-mono mb-1 uppercase tracking-widest">RESOLUTION RESOLVING ACTIONS</label>
                            <input
                              type="text"
                              required
                              value={resol}
                              onChange={(e) => setResol(e.target.value)}
                              placeholder="e.g. Cleared filter screens and re-coupled rotors"
                              className="w-full bg-[#09090b] border border-[#18181b] px-2.5 py-1 text-[11px] text-white focus:outline-none uppercase tracking-wider font-bold"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isGeneratingPm}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2 uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {isGeneratingPm ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Analyzing via Gemini...
                              </>
                            ) : (
                              "Draft Report with Gemini AI"
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-black/20 border border-[#18181b] p-4 text-center text-[10px] text-slate-500 font-black font-mono uppercase tracking-widest py-8">
                        *Postmortem report can only be drafted once the fault is marked as Resolved.
                      </div>
                    )
                  )}
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="bg-[#0c0c0e] border border-[#18181b] p-12 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
            Select an active or historical alarm from the log panel to inspect operations.
          </div>
        )}

      </div>

    </div>
  );
}
