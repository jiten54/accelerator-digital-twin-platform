import { useState } from "react";
import { DevOpsContainer, DevOpsPod, PipelineBuild } from "../types";
import { Terminal, Cpu, HardDrive, RefreshCw, Layers, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react";

interface DevOpsDashboardProps {
  containers: DevOpsContainer[];
  pods: DevOpsPod[];
  builds: PipelineBuild[];
  onToggleContainer: (id: string) => void;
  onTriggerBuild: () => void;
}

export default function DevOpsDashboard({ containers, pods, builds, onToggleContainer, onTriggerBuild }: DevOpsDashboardProps) {
  const [selectedPodName, setSelectedPodName] = useState<string>(pods[0]?.name || "");

  const selectedPod = pods.find(p => p.name === selectedPodName);

  return (
    <div className="space-y-6" id="devops-infrastructure-panel">
      
      {/* Build and Pipeline Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CI/CD Build Triggers */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 lg:col-span-1 flex flex-col justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">CI/CD Pipeline Automation</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mt-1.5">CERN GitHub Runner Instance</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-2">Build on push triggers dryrun GKE deployment manifests.</p>
          </div>

          <button
            onClick={onTriggerBuild}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2.5 text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Trigger Integration Pipeline Build
          </button>
        </div>

        {/* Build History logs list */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 lg:col-span-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5">CI/CD Active Build Logs</h3>
          <div className="space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar">
            {builds.map((b) => (
              <div key={b.id} className="bg-black/40 border border-[#18181b] p-3 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  {b.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {b.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                  {b.status === 'running' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {b.status === 'queued' && <AlertCircle className="w-4 h-4 text-slate-500 animate-pulse" />}
                  <div>
                    <div className="text-white font-black">{b.id} ({b.branch})</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">Commit: {b.commit} • {new Date(b.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="text-[10px] text-slate-400 font-bold">
                    Duration: <span className="text-white font-black">{b.durationSeconds}s</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-widest border ${
                    b.status === 'success' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-850/30' :
                    b.status === 'failed' ? 'bg-rose-950/20 text-rose-400 border-rose-850/30' :
                    'bg-cyan-950/20 text-cyan-400 border-cyan-850/30'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Container and GKE Cluster Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Docker Containers (Services) */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Core Docker Services (Sector A Gateway)</h3>
          <div className="space-y-3">
            {containers.map((c) => (
              <div key={c.id} className="bg-black/40 border border-[#18181b] p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{c.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">{c.image.split('/').pop()}</span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-400 mt-2.5 font-mono uppercase font-black tracking-wider">
                    <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-500" /> CPU: {c.cpu}%</span>
                    <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-indigo-500" /> RAM: {c.memory}MB</span>
                    <span className="text-slate-500">Port: {c.ports}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${
                    c.status === "running" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {c.status}
                  </span>
                  
                  {/* Toggle Button */}
                  <button
                    onClick={() => onToggleContainer(c.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer border transition-colors duration-200 focus:outline-none ${
                      c.status === "running" ? "bg-cyan-600 border-cyan-500" : "bg-[#18181b] border-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform bg-white shadow-lg transition duration-200 ${
                        c.status === "running" ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kubernetes Cluster Pod Logs */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">GKE Kubernetes Cluster Pods</h3>
            <div className="flex gap-1.5 items-center uppercase tracking-widest font-black text-[9px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span className="font-mono text-slate-500">GKE-Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pods.map((p) => (
              <div
                key={p.name}
                onClick={() => setSelectedPodName(p.name)}
                className={`p-3 border text-left cursor-pointer transition-all ${
                  selectedPodName === p.name 
                    ? 'bg-[#18181b] border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]' 
                    : 'bg-[#0c0c0e]/40 border-[#18181b] hover:bg-[#18181b]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{p.name.slice(0, 15)}...</span>
                  <span className="text-[8px] font-mono font-black uppercase tracking-wider text-emerald-400">Running</span>
                </div>
                <div className="text-[10px] font-black text-white uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{p.name.split('-')[1]} pod</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-2 font-mono uppercase font-black">
                  CPU: {p.cpuUsage}m • RAM: {p.memoryUsage}Mi
                </div>
              </div>
            ))}
          </div>

          {/* Pod Logs Terminal screen */}
          {selectedPod && (
            <div className="flex-1 flex flex-col gap-2 bg-black/40 border border-[#18181b] p-4 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-[#18181b] pb-2.5 uppercase font-black tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                  Live logs: {selectedPod.name}
                </span>
                <span>Node: {selectedPod.node}</span>
              </div>
              <div className="flex-1 max-h-[140px] overflow-y-auto custom-scrollbar space-y-1 text-[11px] leading-relaxed text-cyan-400 select-text text-left">
                {selectedPod.logs.map((log, idx) => (
                  <div key={idx} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
