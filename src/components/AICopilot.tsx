import { useState, useRef, useEffect } from "react";
import { Send, Bot, Terminal, Loader2, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { Equipment, Alarm, Incident } from "../types";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

interface AICopilotProps {
  selectedEquipment: Equipment | null;
  activeAlarms: Alarm[];
  activeIncidents: Incident[];
}

export default function AICopilot({ selectedEquipment, activeAlarms, activeIncidents }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### Accelerator Digital Twin AI Copilot Initialized 🚀

I am connected to the live telemetry stream and engineering registries of Sector A.

How can I assist your operations shift today? 
- **Explain active alarms** & suggest interlock mitigation workflows.
- **Generate formal incident postmortems** based on telemetry spikes.
- **Draft safety and functional requirements** for superconducting magnets.
- **Answer runbook questions** using the Engineering Wiki procedures.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;

    if (!customPrompt) setInput("");

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: promptText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Gather current context
      const context = {
        selectedEquipment: selectedEquipment ? {
          id: selectedEquipment.id,
          name: selectedEquipment.name,
          type: selectedEquipment.type,
          status: selectedEquipment.status,
          healthScore: selectedEquipment.healthScore,
          latestTelemetry: selectedEquipment.telemetry[selectedEquipment.telemetry.length - 1]
        } : null,
        activeAlarms: activeAlarms.map(a => ({
          id: a.id,
          equipmentId: a.equipmentId,
          severity: a.severity,
          message: a.message,
          status: a.status
        })),
        activeIncidents: activeIncidents.map(i => ({
          id: i.id,
          title: i.title,
          severity: i.severity,
          status: i.status,
          assignedEngineer: i.assignedEngineer
        }))
      };

      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, context })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with AI");
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `### ❌ Diagnostic Failure\n\nUnable to reach the server AI gateway. Ensure your dev server is active and port forwarding is correct.\n\n*Error details: ${err.message}*`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESETS = [
    {
      label: "Explain Active Alarms",
      prompt: "Inspect active alarms and summarize the severity, affected equipment, and potential risk to beam uptime."
    },
    {
      label: "Suggest Cryo Mitigations",
      prompt: "The cryogenic helium cooling system CDU-A1 is fluctuating. Outline the critical procedures to avoid magnet quenches."
    },
    {
      label: "Draft Magnet Requirement",
      prompt: "Draft a functional requirement specification for a new High-Luminosity Quadrupole Focusing Magnet focusing gradient stability."
    },
    {
      label: "Diagnostic Checklist",
      prompt: "Generate a diagnostic checklist for the Power Converter RPC-A1 when experiencing thyroid thermal sensor spikes."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] border border-[#18181b] overflow-hidden relative" id="ai-copilot-container">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-black border-b border-[#18181b]">
        <div className="flex items-center gap-2.5">
          <div className="bg-cyan-500/10 p-1.5 border border-cyan-500/20 text-cyan-400">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
              Engineering AI Copilot
              <span className="text-[9px] bg-cyan-950/20 text-cyan-400 px-2 py-0.5 border border-cyan-800/30 font-black font-mono uppercase tracking-widest">
                Gemini 3.5
              </span>
            </h3>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Precision Operations Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 inline-block animate-ping" />
          <span className="text-[9px] font-black font-mono text-slate-500 uppercase tracking-widest">Interactive</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="w-7 h-7 bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-950/15 border border-cyan-500/30 text-cyan-100'
                  : msg.isError 
                  ? 'bg-rose-950/20 border border-rose-800/30 text-rose-200'
                  : 'bg-black/40 border border-[#18181b] text-slate-300'
              }`}
            >
              <div className="prose prose-invert prose-xs max-w-none text-xs md:text-sm space-y-2">
                {msg.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###')) {
                    return <h4 key={idx} className="font-black text-cyan-400 text-xs md:text-sm mt-3 mb-1.5 uppercase tracking-wider">{paragraph.replace('###', '').trim()}</h4>;
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={idx} className="font-black text-slate-200 uppercase tracking-wide">{paragraph}</p>;
                  }
                  if (paragraph.startsWith('-')) {
                    return (
                      <ul key={idx} className="list-disc list-inside pl-1 space-y-1 my-1">
                        {paragraph.split('\n').map((item, itemIdx) => {
                          const cleaned = item.replace(/^- \*\*(.*?)\*\*:/, '$1:').replace(/^- /, '');
                          const boldMatch = item.match(/^\s*- \*\*(.*?)\*\*:/);
                          if (boldMatch) {
                            return <li key={itemIdx}><strong className="text-cyan-300 font-black uppercase tracking-wide">{boldMatch[1]}</strong>{item.replace(/^\s*- \*\*(.*?)\*\*/, '')}</li>;
                          }
                          return <li key={itemIdx}>{cleaned}</li>;
                        })}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('1.')) {
                    return (
                      <ol key={idx} className="list-decimal list-inside pl-1 space-y-1 my-1">
                        {paragraph.split('\n').map((item, itemIdx) => {
                          return <li key={itemIdx}>{item.replace(/^\d+\.\s+/, '')}</li>;
                        })}
                      </ol>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-center text-cyan-400 flex-shrink-0 animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <div className="bg-black/30 border border-[#18181b] px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="uppercase font-black text-[10px] tracking-widest text-slate-500">Analyzing live telemetry metrics...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset buttons */}
      <div className="px-4 py-3 border-t border-[#18181b] bg-black/40">
        <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar-h">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(preset.prompt)}
              disabled={isLoading}
              className="flex-shrink-0 bg-[#0c0c0e] hover:bg-[#18181b] border border-[#18181b] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 px-3 py-2 transition-all flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-widest cursor-pointer"
            >
              <Terminal className="w-3 h-3 text-cyan-500" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="p-4 bg-black border-t border-[#18181b]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              selectedEquipment 
                ? `Query diagnostic for ${selectedEquipment.id}...` 
                : "Ask anything about Sector A infrastructure..."
            }
            disabled={isLoading}
            className="w-full bg-[#0c0c0e] border border-[#18181b] pl-4 pr-12 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 font-mono"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:bg-slate-800 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2.5 text-[9px] text-slate-500 px-1 uppercase font-black tracking-widest">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            Context-aware diagnostic active
          </span>
          {selectedEquipment && (
            <span className="text-cyan-400 font-mono font-bold">
              Target: {selectedEquipment.id}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
