import { useRef } from "react";
import { Sparkles, ListTodo, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTaskStore } from "../../stores/taskStore";
import { useTimetableStore } from "../../stores/timetableStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useToastStore } from "../../stores/toastStore";
import { chatCompletion } from "../../services/ai";
import { buildTimetablePrompt } from "../../lib/prompts";
import { safeParseJSON, toDateString, formatDateLabel } from "../../lib/utils";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import type { TimeBlock } from "../../types";

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (id: string) => void;
}

export const TaskList = ({ onAddTask, onEditTask }: TaskListProps) => {
  const tasks = useTaskStore((s) => s.tasks);
  const getFilteredTasks = useTaskStore((s) => s.getFilteredTasks);
  const getStats = useTaskStore((s) => s.getStats);
  const getActiveTasks = useTaskStore((s) => s.getActiveTasks);
  const selectedDate = useTaskStore((s) => s.selectedDate);
  const setSelectedDate = useTaskStore((s) => s.setSelectedDate);

  const { isGenerating, setIsGenerating, setTimetable, setTimetableDate, setChatMessages } =
    useTimetableStore();
  const { setActiveTab } = useSettingsStore();
  const showToast = useToastStore((s) => s.showToast);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const stats = getStats();
  const filtered = getFilteredTasks();
  const activeTasks = getActiveTasks();

  // ── Date navigation ──
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateString(d));
  };

  const goToToday = () => setSelectedDate(toDateString());

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setSelectedDate(e.target.value);
  };

  const handleGenerate = async () => {
    if (activeTasks.length === 0) return;

    setIsGenerating(true);
    setActiveTab("timetable");

    try {
      const prompt = buildTimetablePrompt(activeTasks);
      const response = await chatCompletion(prompt);
      const parsed = safeParseJSON<TimeBlock[]>(response);

      if (parsed && Array.isArray(parsed)) {
        setTimetable(parsed);
        setTimetableDate(selectedDate);
        setChatMessages([
          { role: "system", content: "Timetable generated! Ask me to rearrange anything." },
          {
            role: "ai",
            content: `I've built your schedule with ${parsed.length} blocks, prioritizing your critical tasks in peak hours. Want me to adjust anything?`,
          },
        ]);
      } else {
        throw new Error("Could not parse timetable from AI response");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      showToast(`Generation failed: ${msg}`, "error");
      setChatMessages([
        { role: "system", content: "Timetable generation failed." },
        {
          role: "ai",
          content: `Sorry, I had trouble generating the timetable. ${msg}`,
        },
      ]);
    }

    setIsGenerating(false);
  };

  const isToday = selectedDate === toDateString();
  const dateLabel = formatDateLabel(selectedDate);

  // Format the full date for subtitle
  const fullDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h2>Tasks</h2>
          <div className="tasks-stats">
            <span>
              <div className="stat-dot" style={{ background: "var(--accent)" }} />
              {stats.active} active
            </span>
            <span>
              <div className="stat-dot" style={{ background: "var(--low)" }} />
              {stats.done} done
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-ai"
            onClick={handleGenerate}
            disabled={isGenerating || activeTasks.length === 0}
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? "Generating..." : "Generate Timetable"}
          </button>
          <button className="btn btn-primary" onClick={onAddTask}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Date Picker Strip */}
      <div className="date-picker-strip">
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => shiftDate(-1)}
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          className="date-label-btn"
          onClick={() => dateInputRef.current?.showPicker?.()}
          title={fullDate}
        >
          <Calendar size={14} />
          <span className="date-label-text">{dateLabel}</span>
          <span className="date-label-full">{!isToday ? ` · ${fullDate.split(",").slice(0, 2).join(",")}` : ""}</span>
          <input
            ref={dateInputRef}
            type="date"
            className="date-picker-hidden"
            value={selectedDate}
            onChange={handleDatePick}
            tabIndex={-1}
          />
        </button>

        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => shiftDate(1)}
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>

        {!isToday && (
          <button className="btn btn-sm" onClick={goToToday} style={{ marginLeft: 8 }}>
            Today
          </button>
        )}
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ListTodo size={28} />
          </div>
          <h3>{tasks.length === 0 && stats.total === 0 ? "No tasks yet" : "No matching tasks"}</h3>
          <p>
            {stats.total === 0
              ? `Add your first task for ${dateLabel.toLowerCase() === "today" ? "today" : dateLabel} and let AI build your perfect schedule.`
              : "Try adjusting your filters or search query."}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      )}
    </div>
  );
};
