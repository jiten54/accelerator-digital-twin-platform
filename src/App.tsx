import React, { useState, useEffect } from "react";
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
} from "./types";
import TopologyMap from "./components/TopologyMap";
import AICopilot from "./components/AICopilot";
import AnalyticsView from "./components/AnalyticsView";
import WikiEditor from "./components/WikiEditor";
import SprintBoard from "./components/SprintBoard";
import DevOpsDashboard from "./components/DevOpsDashboard";
import AlarmsCenter from "./components/AlarmsCenter";
import EquipmentExplorer from "./components/EquipmentExplorer";
import RequirementsList from "./components/RequirementsList";
import { 
  Bot, 
  LayoutDashboard, 
  Layers, 
  Wrench, 
  ShieldAlert, 
  GitBranch, 
  BookOpen, 
  BarChart3, 
  HelpCircle, 
  Activity, 
  Terminal, 
  Zap, 
  Settings, 
  Clock, 
  Play, 
  User, 
  Check, 
  AlertCircle,
  Plus,
  ChevronRight 
} from "lucide-react";

export default function App() {
  // NAVIGATION TABS
  const [activeTab, setActiveTab] = useState<'twin' | 'equipment' | 'alarms' | 'requirements' | 'sprint' | 'devops' | 'wiki' | 'support' | 'releases' | 'analytics'>('twin');
  
  // LIVE POLLED STATE
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedEqId, setSelectedEqId] = useState<string>("EQ-CRY-A1");

  // SEPARATE REGISTRIES
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([]);
  const [sprintTasks, setSprintTasks] = useState<SprintTask[]>([]);
  const [releaseNodes, setReleaseNodes] = useState<ReleaseNode[]>([]);
  
  // DEVOPS STATE
  const [containers, setContainers] = useState<DevOpsContainer[]>([]);
  const [pods, setPods] = useState<DevOpsPod[]>([]);
  const [builds, setBuilds] = useState<PipelineBuild[]>([]);

  // COMMAND PALETTE STATE
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  // SIDEBAR COPILOT TOGGLE
  const [showCopilot, setShowCopilot] = useState(true);

  // UTC CLOCK STATE
  const [utcTime, setUtcTime] = useState("");

  // Support desk form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketCategory, setTicketCategory] = useState<'bug' | 'feature' | 'support'>('bug');
  const [ticketPriority, setTicketPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [ticketDesc, setTicketDesc] = useState("");

  // Connection/Loading state
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load all initial state & establish polling
  useEffect(() => {
    let active = true;
    let retryTimeoutId: any = null;

    const fetchData = async () => {
      try {
        const telRes = await fetch("/api/telemetry");
        if (!telRes.ok) throw new Error(`Telemetry API returned ${telRes.status}`);
        const telData = await telRes.json();

        const reqRes = await fetch("/api/requirements");
        if (!reqRes.ok) throw new Error(`Requirements API returned ${reqRes.status}`);
        const reqData = await reqRes.json();

        const tckRes = await fetch("/api/tickets");
        if (!tckRes.ok) throw new Error(`Tickets API returned ${tckRes.status}`);
        const tckData = await tckRes.json();

        const wkiRes = await fetch("/api/wiki");
        if (!wkiRes.ok) throw new Error(`Wiki API returned ${wkiRes.status}`);
        const wkiData = await wkiRes.json();

        const mntRes = await fetch("/api/maintenance");
        if (!mntRes.ok) throw new Error(`Maintenance API returned ${mntRes.status}`);
        const mntData = await mntRes.json();

        const sprRes = await fetch("/api/sprint");
        if (!sprRes.ok) throw new Error(`Sprint API returned ${sprRes.status}`);
        const sprData = await sprRes.json();

        const relRes = await fetch("/api/releases");
        if (!relRes.ok) throw new Error(`Releases API returned ${relRes.status}`);
        const relData = await relRes.json();

        const devRes = await fetch("/api/devops");
        if (!devRes.ok) throw new Error(`DevOps API returned ${devRes.status}`);
        const devData = await devRes.json();

        if (!active) return;

        setEquipment(telData.equipment);
        setAlarms(telData.alarms);
        setIncidents(telData.incidents);
        setRequirements(reqData);
        setTickets(tckData);
        setWikiPages(wkiData);
        setMaintenance(mntData);
        setSprintTasks(sprData);
        setReleaseNodes(relData);
        setContainers(devData.containers);
        setPods(devData.pods);
        setBuilds(devData.builds);

        setIsLoaded(true);
        setLoadError(null);
      } catch (err: any) {
        if (!active) return;
        console.warn("Failed to load initial server state, retrying in 2 seconds...", err);
        setLoadError(err.message || "Failed to fetch");
        retryTimeoutId = setTimeout(fetchData, 2000);
      }
    };

    fetchData();

    // Poll Telemetry and DevOps every 3 seconds
    const interval = setInterval(async () => {
      try {
        const telRes = await fetch("/api/telemetry");
        if (telRes.ok) {
          const telData = await telRes.json();
          setEquipment(telData.equipment);
          setAlarms(telData.alarms);
          setIncidents(telData.incidents);
        }

        const devRes = await fetch("/api/devops");
        if (devRes.ok) {
          const devData = await devRes.json();
          setContainers(devData.containers);
          setPods(devData.pods);
          setBuilds(devData.builds);
        }
      } catch (err) {
        console.error("Failed to poll server updates:", err);
      }
    }, 3000);

    return () => {
      active = false;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      clearInterval(interval);
    };
  }, []);

  // Update UTC clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts (Ctrl+K or Cmd+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger Outage simulation
  const triggerSimulation = async (type: 'cryo' | 'converter' | 'none') => {
    try {
      await fetch("/api/telemetry/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      // immediately refetch
      const telRes = await fetch("/api/telemetry");
      const telData = await telRes.json();
      setEquipment(telData.equipment);
      setAlarms(telData.alarms);
      setIncidents(telData.incidents);
    } catch (err) {
      console.error(err);
    }
  };

  // Alarm actions dispatch
  const handleAlarmAction = async (id: string, action: 'acknowledge' | 'escalate' | 'resolve', note?: string) => {
    try {
      const res = await fetch(`/api/alarms/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note })
      });
      const data = await res.json();
      if (data.success) {
        setAlarms(data.alarm ? alarms.map(a => a.id === id ? data.alarm : a) : alarms);
        // poll telemetry to update statuses
        const telRes = await fetch("/api/telemetry");
        const telData = await telRes.json();
        setEquipment(telData.equipment);
        setAlarms(telData.alarms);
        setIncidents(telData.incidents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Incident Postmortem trigger
  const handleGeneratePostmortem = async (incidentId: string, rootCause: string, resolution: string, notes: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/postmortem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rootCause, resolution, notes })
      });
      const data = await res.json();
      if (data.success) {
        setIncidents(incidents.map(i => i.id === incidentId ? data.incident : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Requirements add
  const handleAddRequirement = async (title: string, type: 'functional' | 'performance' | 'safety', subsystem: string, equipmentId: string, description: string) => {
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, subsystem, equipmentId, description })
      });
      const data = await res.json();
      if (data.success) {
        setRequirements([data.requirement, ...requirements]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ticket add
  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ticketTitle, category: ticketCategory, priority: ticketPriority, description: ticketDesc })
      });
      const data = await res.json();
      if (data.success) {
        setTickets([data.ticket, ...tickets]);
        setTicketTitle("");
        setTicketDesc("");
        setShowTicketForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async (id: string, resolution: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(tickets.map(t => t.id === id ? data.ticket : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wiki page save & create
  const handleSaveWikiPage = async (id: string, title: string, category: string, content: string) => {
    try {
      const res = await fetch(`/api/wiki/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content })
      });
      const data = await res.json();
      if (data.success) {
        setWikiPages(wikiPages.map(p => p.id === id ? data.page : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWikiPage = async (title: string, category: string, content: string) => {
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content })
      });
      const data = await res.json();
      if (data.success) {
        setWikiPages([data.page, ...wikiPages]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule maintenance
  const handleScheduleMaintenance = async (title: string, equipmentId: string, type: string, date: string, duration: number, technician: string, description: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, equipmentId, type, date, durationHours: duration, technician, description })
      });
      const data = await res.json();
      if (data.success) {
        setMaintenance([data.task, ...maintenance]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sprint backlog task additions & columns move
  const handleAddSprintTask = async (title: string, points: number, description: string, assignee: string) => {
    try {
      const res = await fetch("/api/sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, points, description, assignee })
      });
      const data = await res.json();
      if (data.success) {
        setSprintTasks([data.task, ...sprintTasks]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSprintTask = async (id: string, column: 'backlog' | 'todo' | 'progress' | 'review' | 'done') => {
    try {
      const res = await fetch(`/api/sprint/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column })
      });
      const data = await res.json();
      if (data.success) {
        setSprintTasks(sprintTasks.map(t => t.id === id ? data.task : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deploy Stage release
  const handleDeployRelease = async (id: string) => {
    try {
      const res = await fetch(`/api/releases/deploy/${id}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setReleaseNodes(releaseNodes.map(r => r.id === id ? data.release : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle container service
  const handleToggleContainer = async (id: string) => {
    try {
      const res = await fetch("/api/devops/container/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setContainers(containers.map(c => c.id === id ? data.container : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger background build
  const handleTriggerBuild = async () => {
    try {
      const res = await fetch("/api/devops/build/trigger", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBuilds([data.build, ...builds]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Selection from digital twin map jumps to equipment tab
  const handleMapSelect = (id: string) => {
    setSelectedEqId(id);
    setActiveTab('equipment');
  };

  // FILTERED COMMAND PALETTE ITEMS
  const commandPaletteItems = [
    { label: "Digital Twin Map Overview", action: () => { setActiveTab('twin'); setShowPalette(false); } },
    { label: "Superconducting Equipment Explorer", action: () => { setActiveTab('equipment'); setShowPalette(false); } },
    { label: "Active Alarm Fault Center", action: () => { setActiveTab('alarms'); setShowPalette(false); } },
    { label: "Requirements Specification Baseline", action: () => { setActiveTab('requirements'); setShowPalette(false); } },
    { label: "High-Luminosity Sprint Backlog", action: () => { setActiveTab('sprint'); setShowPalette(false); } },
    { label: "GKE Kubernetes & Docker Pods", action: () => { setActiveTab('devops'); setShowPalette(false); } },
    { label: "CERN Operating Wiki manuals", action: () => { setActiveTab('wiki'); setShowPalette(false); } },
    { label: "Incident Support Desk Tickets", action: () => { setActiveTab('support'); setShowPalette(false); } },
    { label: "Release Deployment Center", action: () => { setActiveTab('releases'); setShowPalette(false); } },
    { label: "Engineering Reliability Analytics", action: () => { setActiveTab('analytics'); setShowPalette(false); } },
    { label: "🚨 Simulate Cryo Cooldown Failure (CDU-A1)", action: () => { triggerSimulation('cryo'); setShowPalette(false); } },
    { label: "🚨 Simulate Power Converter Thermal Fluctuation (RPC-A1)", action: () => { triggerSimulation('converter'); setShowPalette(false); } },
    { label: "✅ Reset Outage Simulations to Nominal", action: () => { triggerSimulation('none'); setShowPalette(false); } },
  ];

  const filteredPaletteItems = commandPaletteItems.filter(item => 
    item.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  const activeAlarmsCount = alarms.filter(a => a.status !== 'resolved').length;
  const selectedEquipmentObject = equipment.find(e => e.id === selectedEqId) || null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-300 flex flex-col items-center justify-center font-sans antialiased p-6 border-4 border-[#18181b]">
        <div className="max-w-md w-full bg-[#0c0c0e] border border-[#18181b] p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-cyan-500/10 p-4 rounded border border-cyan-500/20 text-cyan-400">
              <Activity className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-black tracking-widest text-white uppercase">CERN Sector-04-B Digital Twin</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Telemetry Integration Bridge</p>
          </div>
          <div className="space-y-2 font-mono text-[11px] text-left bg-black border border-[#18181b] p-4 text-slate-400 leading-relaxed uppercase font-black tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 inline-block animate-ping"></span>
              <span>Status: Synchronizing telemetry...</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Bridge target: http://0.0.0.0:3000</span>
            </div>
            {loadError && (
              <div className="mt-2 text-rose-500/80 text-[10px] lowercase font-semibold truncate">
                error: {loadError}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
            Retrying connection dynamically. Please wait while the scientific server boots up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 border-4 border-[#18181b]">
      
      {/* CERN HEADER BAR */}
      <header className="bg-[#0c0c0e] border-b border-[#18181b] px-8 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg shadow-black/30">
        
        {/* Logo and Name */}
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500/10 p-2.5 rounded border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter text-white uppercase flex items-center gap-2">
              DIGITAL TWIN / <span className="text-cyan-500">SECTOR-04-B</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-black border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest ml-2">
                Status: Operational
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">CERN Scientific Infrastructure • Sector A</p>
          </div>
        </div>

        {/* Global Control Center stats */}
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          
          {/* Active Outage buttons */}
          <div className="flex items-center gap-2 bg-[#0c0c0e] px-3 py-1.5 border border-[#18181b]">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em]">Simulate Outage:</span>
            <button 
              onClick={() => triggerSimulation('cryo')} 
              className="text-rose-500 hover:text-rose-400 font-black tracking-widest cursor-pointer hover:underline"
            >
              [Cryo Spike]
            </button>
            <button 
              onClick={() => triggerSimulation('converter')} 
              className="text-amber-500 hover:text-amber-400 font-black tracking-widest cursor-pointer hover:underline"
            >
              [Thyristor Heat]
            </button>
            <button 
              onClick={() => triggerSimulation('none')} 
              className="text-emerald-500 hover:text-emerald-400 font-black tracking-widest cursor-pointer hover:underline"
            >
              [Nominal]
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#0c0c0e] px-3.5 py-1.5 border border-[#18181b]">
            <span className="text-slate-500 font-black tracking-widest">UTC:</span>
            <span className="text-slate-200 font-black font-mono">{utcTime || "SYNCHRONIZING..."}</span>
          </div>

          {/* Active Alarms Indicator */}
          <div 
            onClick={() => setActiveTab('alarms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 border cursor-pointer transition-all ${
              activeAlarmsCount > 0 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' 
                : 'bg-[#0c0c0e] border-[#18181b] text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Alarms: {activeAlarmsCount}</span>
          </div>

          {/* Command Palette Indicator */}
          <button 
            onClick={() => setShowPalette(true)}
            className="bg-[#18181b] px-3 py-1.5 flex items-center space-x-2 border border-slate-700/50 text-xs text-slate-400 font-black cursor-pointer transition-all"
          >
            <span className="text-[10px] tracking-widest uppercase">SEARCH CMD...</span>
            <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono">⌘K</span>
          </button>
        </div>

      </header>

      {/* CORE SPLIT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT WORKSPACE PANEL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* NAVIGATION BAR LEFT (VERTICAL) */}
          <nav className="w-full md:w-60 bg-[#0c0c0e] border-b md:border-b-0 md:border-r border-[#18181b] p-4 space-y-1 overflow-y-auto shrink-0">
            <div className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.2em]">Operational Systems</div>
            
            <button
              onClick={() => setActiveTab('twin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'twin'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Digital Twin Map
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'equipment'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Equipment Explorer
            </button>

            <button
              onClick={() => setActiveTab('alarms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'alarms'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Alarms & Incidents
              {activeAlarmsCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                  {activeAlarmsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'requirements'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              Requirements
            </button>

            <div className="h-[1px] bg-[#18181b] my-4" />
            <div className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.2em]">Engineering Delivery</div>

            <button
              onClick={() => setActiveTab('sprint')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'sprint'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Sprint Workspace
            </button>

            <button
              onClick={() => setActiveTab('devops')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'devops'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              DevOps Automation
            </button>

            <button
              onClick={() => setActiveTab('releases')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'releases'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Release Center
            </button>

            <div className="h-[1px] bg-[#18181b] my-4" />
            <div className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.2em]">Support & Reference</div>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'support'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Support Desk
            </button>

            <button
              onClick={() => setActiveTab('wiki')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'wiki'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Operating Wiki
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reliability Stats
            </button>

            {/* AI Toggle on sidebar footer */}
            <div className="pt-6">
              <button
                onClick={() => setShowCopilot(!showCopilot)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-black uppercase tracking-widest border transition-all ${
                  showCopilot 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-transparent border-[#18181b] text-slate-500 hover:text-slate-300'
                }`}
              >
                <Bot className="w-4 h-4" />
                AI Copilot
                <span className="ml-auto text-[8px] bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 rounded font-black">
                  {showCopilot ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

          </nav>

          {/* MAIN TAB CONTENT WORKSPACE SCREEN */}
          <main className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar relative">
            
            {activeTab === 'twin' && (
              <div className="space-y-6">
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col justify-center">
                    <span className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-1 block">Magnetic Ring Status</span>
                    <span className="text-3xl font-black text-white leading-none block">8.33<span className="text-lg opacity-30 ml-1">Tesla</span></span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">Operating dipole current 11,850A</p>
                  </div>
                  <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col justify-center">
                    <span className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em] mb-1 block">Vacuum Vessel</span>
                    <span className="text-3xl font-black text-white leading-none block">1.22<span className="text-lg opacity-30 ml-1">e-11 mbar</span></span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">Baseline collision chamber clean</p>
                  </div>
                  <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col justify-center">
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1 block">Supercritical Cryo</span>
                    <span className="text-3xl font-black text-white leading-none block">1.82<span className="text-lg opacity-30 ml-1">Kelvin</span></span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">Helium superfluid density nominal</p>
                  </div>
                  <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col justify-center">
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-1 block">Sys Efficiency</span>
                    <span className="text-3xl font-black text-white leading-none block">99.78<span className="text-lg opacity-30 ml-1">%</span></span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">System availability index nominal</p>
                  </div>
                </div>

                {/* Digital Twin Map component */}
                <TopologyMap 
                  equipment={equipment} 
                  selectedId={selectedEqId} 
                  onSelectEquipment={handleMapSelect} 
                />

                {/* CERN Control room summary layout */}
                <div className="bg-[#0c0c0e] border border-[#18181b] p-6 text-left flex flex-col space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">CERN Control Room Overview Shift Logs</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-bold">
                    Shift Crew: <strong className="text-white">Dr. Elena Rostova</strong> (Dipole magnet protection lead), <strong className="text-white">Claude Dubois</strong> (Cryogenics Plant Supervisor). 
                    All superconducting vectors are nominal. External substation filters are activated to cancel harmonic current ripple drifts. 
                    Vacuum pump CDU-A1 has finished standard helium vaporization purge sequences. Scheduled IR busbar scans remain slated for 28th June.
                  </p>
                </div>

              </div>
            )}

            {activeTab === 'equipment' && (
              <EquipmentExplorer 
                equipmentList={equipment} 
                selectedId={selectedEqId} 
                maintenanceTasks={maintenance} 
                onSelectEquipment={setSelectedEqId} 
                onScheduleMaintenance={handleScheduleMaintenance} 
              />
            )}

            {activeTab === 'alarms' && (
              <AlarmsCenter 
                alarms={alarms} 
                incidents={incidents} 
                onAcknowledge={handleAlarmAction} 
                onEscalate={handleAlarmAction} 
                onResolve={handleAlarmAction} 
                onGeneratePostmortem={handleGeneratePostmortem} 
              />
            )}

            {activeTab === 'requirements' && (
              <RequirementsList 
                requirements={requirements} 
                equipmentList={equipment} 
                onAddRequirement={handleAddRequirement} 
              />
            )}

            {activeTab === 'sprint' && (
              <SprintBoard 
                tasks={sprintTasks} 
                onAddTask={handleAddSprintTask} 
                onMoveTask={handleMoveSprintTask} 
              />
            )}

            {activeTab === 'devops' && (
              <DevOpsDashboard 
                containers={containers} 
                pods={pods} 
                builds={builds} 
                onToggleContainer={handleToggleContainer} 
                onTriggerBuild={handleTriggerBuild} 
              />
            )}

            {activeTab === 'wiki' && (
              <WikiEditor 
                pages={wikiPages} 
                onSavePage={handleSaveWikiPage} 
                onCreatePage={handleCreateWikiPage} 
              />
            )}

            {activeTab === 'support' && (
              <div className="space-y-6" id="support-desk">
                
                {/* Header */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between items-center">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Scientific Systems Help Desk</span>
                    <h3 className="text-base font-semibold text-slate-100 mt-1">Operations Application Support Portal</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Report bugs, request features, track SLA resolution progress.</p>
                  </div>

                  <button
                    onClick={() => setShowTicketForm(!showTicketForm)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Submit Ticket
                  </button>
                </div>

                {/* Ticket Form collapse */}
                {showTicketForm && (
                  <form onSubmit={handleAddTicket} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-fade-in text-left">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Support Ticket</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">TICKET TITLE</label>
                        <input
                          type="text"
                          required
                          value={ticketTitle}
                          onChange={(e) => setTicketTitle(e.target.value)}
                          placeholder="e.g. Purge pressure readout mismatch"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">CATEGORY</label>
                        <select
                          value={ticketCategory}
                          onChange={(e: any) => setTicketCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="bug">Hardware Bug/Glitch</option>
                          <option value="feature">Feature Request</option>
                          <option value="support">Shift Support Request</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">PRIORITY</label>
                        <select
                          value={ticketPriority}
                          onChange={(e: any) => setTicketPriority(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="high">High (SLA 24h)</option>
                          <option value="medium">Medium (SLA 72h)</option>
                          <option value="low">Low (SLA 168h)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">FULL COMPONENT FAILURE DESCRIPTION</label>
                      <textarea
                        required
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        placeholder="Please elaborate on the observed telemetry oscillations or hardware faults..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowTicketForm(false)}
                        className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg font-semibold"
                      >
                        File Ticket
                      </button>
                    </div>
                  </form>
                )}

                {/* Ticket inventory grid list */}
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-left">
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-950 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                            t.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/30' :
                            t.priority === 'medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                            'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                          }`}>
                            {t.priority} priority
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-900/30 px-1.5 py-0.5 rounded capitalize">
                            {t.category}
                          </span>
                        </div>

                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          t.status === 'open' ? 'bg-red-950/30 text-red-400' :
                          t.status === 'in_progress' ? 'bg-amber-950/30 text-amber-400 animate-pulse' :
                          'bg-emerald-950/30 text-emerald-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 mt-3">{t.title}</h4>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{t.description}</p>
                      
                      <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-slate-950/80 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Author: {t.author} • Filed: {new Date(t.createdTime).toLocaleTimeString()}
                        </span>
                        <span>SLA Limit: {t.slaHours} hours</span>
                      </div>

                      {/* Ticket resolution action block */}
                      {t.status !== 'resolved' ? (
                        <div className="mt-4 pt-3 border-t border-slate-950/80 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter resolution notes to close this ticket..."
                            id={`res-${t.id}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleResolveTicket(t.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(`res-${t.id}`) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleResolveTicket(t.id, input.value);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-950/80 text-xs text-slate-400 bg-emerald-950/10 border border-emerald-950/30 rounded p-2.5">
                          <strong>Closed Resolution Notes</strong>: {t.resolution}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            )}

            {activeTab === 'releases' && (
              <div className="space-y-6" id="release-notes-center">
                
                {/* Header */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between items-center">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Scientific Software releases</span>
                    <h3 className="text-base font-semibold text-slate-100 mt-1">CERN Release & Version Deployment Center</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control pipeline staging and manage multi-officer approval chains.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {releaseNodes.map((rel) => (
                    <div key={rel.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-3 border-b border-slate-950 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">{rel.id}</span>
                            <h4 className="text-sm font-bold text-slate-100 mt-1">{rel.version}</h4>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            rel.status === 'deployed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-400'
                          }`}>
                            {rel.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-3 leading-relaxed">{rel.notes}</p>
                      </div>

                      <div className="space-y-3.5">
                        {/* Approval status check list */}
                        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-3 text-[11px] space-y-1.5">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Verification Sign-offs</div>
                          {rel.approvalChain.map((chain, cIdx) => (
                            <div key={cIdx} className="flex items-center justify-between">
                              <span className="text-slate-400">{chain.role}</span>
                              <div className="flex items-center gap-1.5">
                                {chain.approved ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> APPROVED</span>
                                ) : (
                                  <span className="text-slate-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> STAGED</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Deploy button if staged */}
                        {rel.status === "staged" && (
                          <button
                            onClick={() => handleDeployRelease(rel.id)}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            Execute GKE Production Deployment Rollout
                          </button>
                        )}
                        {rel.status === "deployed" && (
                          <div className="text-center text-[10px] font-mono text-slate-500">
                            Deployed: {rel.releaseDate} • Commits: {rel.commitsCount} verified
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView />
            )}

          </main>
        </div>

        {/* RIGHT DOCKED PANEL (Engineering Copilot chat box) */}
        {showCopilot && (
          <div className="hidden lg:block w-96 flex-shrink-0 border-l border-slate-900 bg-slate-950/40 p-4 overflow-hidden relative">
            <AICopilot 
              selectedEquipment={selectedEquipmentObject} 
              activeAlarms={alarms} 
              activeIncidents={incidents} 
            />
          </div>
        )}

      </div>

      {/* FLOATING COMMAND PALETTE DIALOG MODAL */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-slate-900 bg-slate-900/30 relative flex items-center">
              <Terminal className="w-4 h-4 text-cyan-400 absolute left-4" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Search command actions or tab triggers..."
                className="w-full bg-transparent pl-7 text-xs md:text-sm text-slate-200 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-slate-500">[ESC] to exit</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-left">
              {filteredPaletteItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={item.action}
                  className="p-3.5 hover:bg-slate-900/70 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-400 cursor-pointer flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              ))}
              {filteredPaletteItems.length === 0 && (
                <div className="text-center text-xs text-slate-600 font-mono py-8">
                  No actions found matching "{paletteQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
