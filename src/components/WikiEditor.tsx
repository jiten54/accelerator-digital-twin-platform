import { useState } from "react";
import { WikiPage } from "../types";
import { BookOpen, Edit, Plus, Save, User, Clock, Tag } from "lucide-react";

interface WikiEditorProps {
  pages: WikiPage[];
  onSavePage: (id: string, title: string, category: string, content: string) => void;
  onCreatePage: (title: string, category: string, content: string) => void;
}

export default function WikiEditor({ pages, onSavePage, onCreatePage }: WikiEditorProps) {
  const [selectedId, setSelectedId] = useState<string>(pages[0]?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<"manual" | "procedure" | "runbook">("manual");
  const [editContent, setEditContent] = useState("");

  const selectedPage = pages.find(p => p.id === selectedId);

  const startEdit = () => {
    if (!selectedPage) return;
    setEditTitle(selectedPage.title);
    setEditCategory(selectedPage.category);
    setEditContent(selectedPage.content);
    setIsEditing(true);
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditTitle("");
    setEditCategory("manual");
    setEditContent("# New Operational Procedure\n\nProvide the engineering steps here.\n\n## Section 1: Setup\n- Step 1\n- Step 2\n\n## Section 2: Calibration\n- Step 3");
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (isCreating) {
      onCreatePage(editTitle, editCategory, editContent);
      setIsCreating(false);
    } else {
      onSavePage(selectedId, editTitle, editCategory, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="wiki-workspace">
      
      {/* Sidebar List */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col gap-3.5 lg:col-span-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Engineering Procedures</h3>
          <button 
            onClick={startCreate}
            className="p-1.5 bg-black hover:bg-[#18181b] text-cyan-400 border border-[#18181b] cursor-pointer"
            title="Create New Entry"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] lg:max-h-none">
          {pages.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setIsEditing(false);
                setIsCreating(false);
              }}
              className={`p-3.5 border text-left cursor-pointer transition-all ${
                selectedId === p.id && !isCreating
                  ? 'bg-[#18181b] border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-black/30 border-[#18181b] hover:bg-[#18181b]/50'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
                <span>{p.id}</span>
                <span className={`px-2 py-0.5 border uppercase font-black text-[8px] tracking-widest ${
                  p.category === 'runbook' ? 'bg-[#991b1b]/10 text-rose-400 border-rose-900/30' :
                  p.category === 'procedure' ? 'bg-[#92400e]/10 text-amber-400 border-amber-900/30' :
                  'bg-[#1e40af]/10 text-blue-400 border-blue-900/30'
                }`}>
                  {p.category}
                </span>
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mt-2.5 truncate">{p.title}</h4>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-1.5 uppercase font-black tracking-widest">
                <User className="w-3 h-3" />
                <span>{p.author.split('@')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-6 lg:col-span-3 flex flex-col min-h-[400px]">
        {isEditing || isCreating ? (
          /* Editor Layout */
          <div className="space-y-4 flex-1 flex flex-col font-mono">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isCreating ? "Drafting New Operations Procedure" : `Editing: ${editTitle}`}
              </h3>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Revision
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">DOCUMENT TITLE</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Main Ring Coolant Flushing Protocol"
                  className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">CATEGORY</label>
                <select
                  value={editCategory}
                  onChange={(e: any) => setEditCategory(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 uppercase font-black"
                >
                  <option value="manual">Manual (Hardware Specs)</option>
                  <option value="procedure">Procedure (Periodic Steps)</option>
                  <option value="runbook">Runbook (Emergency Recovery)</option>
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">CONTENT (MARKDOWN SUPPORTED)</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full flex-1 min-h-[250px] bg-[#0c0c0e] border border-[#18181b] p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                placeholder="Write operational guide..."
              />
            </div>
          </div>
        ) : (
          /* Reader Layout */
          selectedPage ? (
            <div className="space-y-4 flex-1 flex flex-col">
              
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#18181b] pb-4.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest">{selectedPage.id}</span>
                    <div className="flex items-center gap-1.5 bg-black border border-[#18181b] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{selectedPage.category}</span>
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider mt-2.5">{selectedPage.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[9px] text-slate-500 mt-2 font-mono uppercase font-black tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Author: {selectedPage.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Updated: {new Date(selectedPage.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startEdit}
                  className="bg-black hover:bg-[#18181b] border border-[#18181b] text-slate-300 hover:text-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Document
                </button>
              </div>

              {/* Styled markdown container */}
              <div className="flex-1 overflow-y-auto max-h-[400px] prose prose-invert prose-slate text-slate-300 leading-relaxed space-y-4 text-xs md:text-sm">
                {selectedPage.content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-lg font-black text-white border-b border-[#18181b] pb-1.5 mt-4 uppercase tracking-wider">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-sm font-black text-cyan-400 mt-4 mb-2 uppercase tracking-widest">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-xs font-black text-slate-200 mt-3 uppercase tracking-wide">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={idx} className="list-disc pl-1 ml-4 text-slate-300 my-1 font-bold uppercase text-[11px] tracking-wide">{line.replace(/^[-*]\s+/, '')}</li>;
                  }
                  if (line.startsWith('1. ')) {
                    return <li key={idx} className="list-decimal pl-1 ml-4 text-slate-300 my-1 font-bold uppercase text-[11px] tracking-wide">{line.replace(/^\d+\.\s+/, '')}</li>;
                  }
                  if (line.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }
                  return <p key={idx} className="leading-relaxed font-bold uppercase text-[11px] text-slate-400 tracking-wide">{line}</p>;
                })}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
              <BookOpen className="w-12 h-12 text-slate-700 stroke-1 mb-3" />
              <p className="text-sm">No documentation page found</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
