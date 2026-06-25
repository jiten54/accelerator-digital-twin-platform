import React, { useState } from "react";
import { SprintTask } from "../types";
import { Plus, User, HelpCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface SprintBoardProps {
  tasks: SprintTask[];
  onAddTask: (title: string, points: number, description: string, assignee: string) => void;
  onMoveTask: (id: string, column: 'backlog' | 'todo' | 'progress' | 'review' | 'done') => void;
}

export default function SprintBoard({ tasks, onAddTask, onMoveTask }: SprintBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(3);
  const [assignee, setAssignee] = useState("Elena Rostova");
  const [description, setDescription] = useState("");

  const columns = [
    { id: "backlog" as const, title: "Product Backlog" },
    { id: "todo" as const, title: "To Do" },
    { id: "progress" as const, title: "In Progress" },
    { id: "review" as const, title: "Review" },
    { id: "done" as const, title: "Done" }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title, points, description, assignee);
    setTitle("");
    setPoints(3);
    setDescription("");
    setShowAddForm(false);
  };

  // Move task helpers
  const handleMoveLeft = (task: SprintTask) => {
    const sequence = ["backlog", "todo", "progress", "review", "done"];
    const idx = sequence.indexOf(task.column);
    if (idx > 0) {
      onMoveTask(task.id, sequence[idx - 1] as any);
    }
  };

  const handleMoveRight = (task: SprintTask) => {
    const sequence = ["backlog", "todo", "progress", "review", "done"];
    const idx = sequence.indexOf(task.column);
    if (idx < sequence.length - 1) {
      onMoveTask(task.id, sequence[idx + 1] as any);
    }
  };

  // Metrics
  const totalPoints = tasks.reduce((acc, t) => acc + t.points, 0);
  const donePoints = tasks.filter(t => t.column === 'done').reduce((acc, t) => acc + t.points, 0);
  const burndownPercentage = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;

  return (
    <div className="space-y-6" id="sprint-workspace">
      
      {/* Sprint Progress Summary */}
      <div className="bg-[#0c0c0e] border border-[#18181b] p-5 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="text-center md:text-left">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Current Sprint Status</span>
          <h3 className="text-base font-black text-white uppercase tracking-wider mt-1.5">Sprint #24: High-Luminosity Integration</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">Active scope: {tasks.length} issues • Velocity index: 24 points / sprint</p>
        </div>

        {/* Burndown Graph (Small inline SVG) */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Sprint Burndown</span>
            <div className="text-xs font-black font-mono text-cyan-500 uppercase tracking-wider mt-1">
              {totalPoints - donePoints} / {totalPoints} Points Remaining
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#18181b]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={`${burndownPercentage}, 100`}
                strokeLinecap="square"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-black text-white">{Math.round(burndownPercentage)}%</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Add Task Form (Inline collapse) */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-black border border-[#18181b] p-5 space-y-4 font-mono">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">New Backlog Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">TASK TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optimize coolant valve feedback loop"
                required
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">STORY POINTS</label>
              <select
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 uppercase font-black"
              >
                <option value="1">1 Point (Trivial)</option>
                <option value="2">2 Points (Minor)</option>
                <option value="3">3 Points (Normal)</option>
                <option value="5">5 Points (Medium)</option>
                <option value="8">8 Points (Major)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">ASSIGNEE</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-[#18181b] px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 uppercase font-black"
              >
                <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                <option value="Dr. Hans Mueller">Dr. Hans Mueller</option>
                <option value="Claude Dubois">Claude Dubois</option>
                <option value="DevOps Specialist">DevOps Specialist</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-black tracking-widest uppercase mb-1.5">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide full technical parameters..."
              rows={2}
              className="w-full bg-[#0c0c0e] border border-[#18181b] p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-[#18181b] text-slate-300 px-3.5 py-2 uppercase font-black tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-cyan-600 text-white px-4 py-2 font-black uppercase tracking-widest"
            >
              Add to Backlog
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.column === col.id);
          return (
            <div key={col.id} className="bg-[#0c0c0e]/40 border border-[#18181b] p-3 flex flex-col gap-3 min-h-[350px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#18181b] pb-2.5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  {col.title}
                </h4>
                <span className="text-[10px] font-mono font-black text-slate-500 bg-[#0c0c0e] px-2 py-0.5 border border-[#18181b]">
                  {colTasks.length}
                </span>
              </div>

              {/* List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-black border border-[#18181b] hover:border-slate-700 p-3.5 shadow-sm text-left transition-all relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">{task.id}</span>
                      <span className="text-[9px] font-mono font-black bg-cyan-950/20 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.5">
                        {task.points} SP
                      </span>
                    </div>

                    <h5 className="text-xs font-black text-white uppercase tracking-wider mt-2 line-clamp-2">{task.title}</h5>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-bold uppercase tracking-wide">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#18181b] text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[80px]">{task.assignee.split(' ')[1] || task.assignee}</span>
                      </div>
                      
                      {/* Interactive Controls */}
                      <div className="flex items-center gap-1">
                        {col.id !== "backlog" && (
                          <button
                            onClick={() => handleMoveLeft(task)}
                            className="p-1 hover:bg-[#18181b] border border-transparent hover:border-[#18181b] text-slate-500 hover:text-white cursor-pointer"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== "done" && (
                          <button
                            onClick={() => handleMoveRight(task)}
                            className="p-1 hover:bg-[#18181b] border border-transparent hover:border-[#18181b] text-slate-500 hover:text-white cursor-pointer"
                            title="Advance stage"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center py-12 text-slate-600 text-xs font-mono uppercase font-black tracking-widest">
                    Empty Stage
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
