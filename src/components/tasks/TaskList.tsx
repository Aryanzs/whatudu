import { Sparkles, ListTodo, Loader2 } from "lucide-react";
import { useTaskStore } from "../../stores/taskStore";
import { useTimetableStore } from "../../stores/timetableStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { chatCompletion } from "../../services/ai";
import { buildTimetablePrompt } from "../../lib/prompts";
import { safeParseJSON } from "../../lib/utils";
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

  const { isGenerating, setIsGenerating, setTimetable, setChatMessages } =
    useTimetableStore();
  const { setActiveTab } = useSettingsStore();

  const stats = getStats();
  const filtered = getFilteredTasks();
  const activeTasks = getActiveTasks();

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
      setChatMessages([
        { role: "system", content: "Timetable generation failed." },
        {
          role: "ai",
          content: `Sorry, I had trouble generating the timetable. ${err instanceof Error ? err.message : "Please try again."}`,
        },
      ]);
    }

    setIsGenerating(false);
  };

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

      {/* Filters */}
      <TaskFilters />

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ListTodo size={28} />
          </div>
          <h3>{tasks.length === 0 ? "No tasks yet" : "No matching tasks"}</h3>
          <p>
            {tasks.length === 0
              ? "Add your first task and let AI build your perfect schedule."
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
