import { Zap, HeartPulse, ShieldCheck, Activity } from "lucide-react";

export default function AnalyticsView() {
  // Mock analytics data for rendering elegant SVG displays
  const mttrData = [
    { month: "Jan", val: 5.2 },
    { month: "Feb", val: 4.8 },
    { month: "Mar", val: 4.1 },
    { month: "Apr", val: 3.5 },
    { month: "May", val: 2.8 },
    { month: "Jun", val: 1.4 } // MTTR decreasing is good!
  ];

  const mtbfData = [
    { month: "Jan", val: 240 },
    { month: "Feb", val: 265 },
    { month: "Mar", val: 310 },
    { month: "Apr", val: 380 },
    { month: "May", val: 420 },
    { month: "Jun", val: 495 } // MTBF increasing is good!
  ];

  const availabilityData = [
    { name: "Superconducting Magnets", val: 99.88, color: "#10b981" },
    { name: "Power Converters (RPC)", val: 99.45, color: "#22d3ee" },
    { name: "Vacuum Beamline Systems", val: 99.92, color: "#3b82f6" },
    { name: "Cryogenic CDU Plants", val: 98.90, color: "#f59e0b" },
    { name: "Chilled Water Cooling", val: 99.78, color: "#a855f7" }
  ];

  const incidentTrends = [
    { week: "W21", critical: 2, warning: 5 },
    { week: "W22", critical: 1, warning: 4 },
    { week: "W23", critical: 0, warning: 6 },
    { week: "W24", critical: 1, warning: 3 },
    { week: "W25", critical: 0, warning: 2 }
  ];

  return (
    <div className="space-y-6" id="engineering-analytics-panel">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Availability */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Core Availability</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-2">99.786%</div>
            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1 uppercase font-black tracking-wider">
              <span className="text-emerald-500">▲ +0.04%</span> vs previous month
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* MTTR */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Mean Time To Repair</span>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-2">1.42 hrs</div>
            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1 uppercase font-black tracking-wider">
              <span className="text-cyan-500">▼ -42%</span> from Q1 peak
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* MTBF */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Mean Time Between Failures</span>
            <div className="text-2xl font-black font-mono text-indigo-400 mt-2">495.2 hrs</div>
            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1 uppercase font-black tracking-wider">
              <span className="text-indigo-500">▲ +18%</span> reliability index
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        {/* Active Grid Load */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Sector Power Load</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-2">3.12 MW</div>
            <p className="text-[9px] text-slate-500 mt-1.5 flex items-center gap-1 uppercase font-black tracking-wider">
              <span>Nominal ring cryogenic run</span>
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Graphical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Subsystem Availability Bar Chart */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Availability by Subsystem Sector A</h3>
          <div className="space-y-4">
            {availabilityData.map((sub, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-[10px] mb-1.5 uppercase font-black tracking-widest">
                  <span className="text-slate-400">{sub.name}</span>
                  <span className="font-mono text-white">{sub.val}%</span>
                </div>
                <div className="w-full bg-black h-3 border border-[#18181b] overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${(sub.val - 95) * 20}%`, // amplify visual range above 95%
                      backgroundColor: sub.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-mono text-slate-500 uppercase mt-5">
            *Visual scale amplified to demonstrate fine performance variance from 95% to 100%.
          </p>
        </div>

        {/* Incident Weekly Trends (SVG Double Line) */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Weekly Incident Trends</h3>
          <div className="w-full h-48 relative">
            <svg viewBox="0 0 400 160" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="40" y1="130" x2="380" y2="130" stroke="#18181b" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="30" y="24" fill="#4b5563" textAnchor="end" className="text-[9px] font-black font-mono">6</text>
              <text x="30" y="64" fill="#4b5563" textAnchor="end" className="text-[9px] font-black font-mono">4</text>
              <text x="30" y="104" fill="#4b5563" textAnchor="end" className="text-[9px] font-black font-mono">2</text>
              <text x="30" y="134" fill="#4b5563" textAnchor="end" className="text-[9px] font-black font-mono">0</text>

              {/* X Axis Columns */}
              {incidentTrends.map((t, idx) => {
                const x = 50 + idx * 75;
                return (
                  <text key={idx} x={x} y="150" fill="#4b5563" textAnchor="middle" className="text-[9px] font-black font-mono uppercase">
                    {t.week}
                  </text>
                );
              })}

              {/* LINE 1: Warnings (amber-500) */}
              <path 
                d="M 50,60 L 125,75 L 200,50 L 275,85 L 350,100" 
                fill="none" 
                stroke="#d97706" 
                strokeWidth="3" 
                strokeLinecap="square"
              />
              {/* Dots line 1 */}
              <rect x="46.5" y="56.5" width="7" height="7" fill="#d97706" />
              <rect x="121.5" y="71.5" width="7" height="7" fill="#d97706" />
              <rect x="196.5" y="46.5" width="7" height="7" fill="#d97706" />
              <rect x="271.5" y="81.5" width="7" height="7" fill="#d97706" />
              <rect x="346.5" y="96.5" width="7" height="7" fill="#d97706" />

              {/* LINE 2: Critical Alarms (rose-500) */}
              <path 
                d="M 50,100 L 125,115 L 200,130 L 275,115 L 350,130" 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="3" 
                strokeLinecap="square"
              />
              {/* Dots line 2 */}
              <rect x="46.5" y="96.5" width="7" height="7" fill="#f43f5e" />
              <rect x="121.5" y="111.5" width="7" height="7" fill="#f43f5e" />
              <rect x="196.5" y="126.5" width="7" height="7" fill="#f43f5e" />
              <rect x="271.5" y="111.5" width="7" height="7" fill="#f43f5e" />
              <rect x="346.5" y="126.5" width="7" height="7" fill="#f43f5e" />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-[9px] uppercase font-black tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-600 inline-block"></span>
              <span className="text-slate-500">Warnings logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 inline-block"></span>
              <span className="text-slate-500">Critical Safety Trips</span>
            </div>
          </div>
        </div>

      </div>

      {/* MTTR and MTBF Spark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* MTTR Sparkline */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">MTTR Outage Trend</h3>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Average time to repair (Hours)</p>
            </div>
            <span className="text-[9px] font-black font-mono text-cyan-500 bg-[#09090b] px-2.5 py-1 border border-[#18181b] uppercase tracking-widest">
              Avg 1.42 hrs (Optimal)
            </span>
          </div>
          <div className="h-28 w-full bg-black/40 border border-[#18181b] p-2 flex items-end">
            <svg viewBox="0 0 300 80" className="w-full h-full">
              {/* Area fill */}
              <path 
                d="M 10,70 L 60,65 L 110,50 L 160,45 L 210,35 L 260,15 L 260,80 L 10,80 Z" 
                fill="rgba(6,182,212,0.05)" 
              />
              <path 
                d="M 10,70 L 60,65 L 110,50 L 160,45 L 210,35 L 260,15" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="3" 
                strokeLinecap="square"
              />
              {/* Month Text labels */}
              {mttrData.map((d, i) => (
                <text key={i} x={10 + i * 50} y="78" fill="#4b5563" className="text-[8px] font-black font-mono uppercase" textAnchor="middle">
                  {d.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* MTBF Sparkline */}
        <div className="bg-[#0c0c0e] border border-[#18181b] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">MTBF Reliability Trend</h3>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Mean time between trips (Hours)</p>
            </div>
            <span className="text-[9px] font-black font-mono text-indigo-400 bg-[#09090b] px-2.5 py-1 border border-[#18181b] uppercase tracking-widest">
              Avg 495 hrs (Excellent)
            </span>
          </div>
          <div className="h-28 w-full bg-black/40 border border-[#18181b] p-2 flex items-end">
            <svg viewBox="0 0 300 80" className="w-full h-full">
              {/* Area fill */}
              <path 
                d="M 10,65 L 60,60 L 110,50 L 160,35 L 210,30 L 260,10 L 260,80 L 10,80 Z" 
                fill="rgba(99,102,241,0.05)" 
              />
              <path 
                d="M 10,65 L 60,60 L 110,50 L 160,35 L 210,30 L 260,10" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeLinecap="square"
              />
              {/* Month Text labels */}
              {mtbfData.map((d, i) => (
                <text key={i} x={10 + i * 50} y="78" fill="#4b5563" className="text-[8px] font-black font-mono uppercase" textAnchor="middle">
                  {d.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
