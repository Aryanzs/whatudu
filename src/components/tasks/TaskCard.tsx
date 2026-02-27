import { useRef } from "react";
import { Check, Pencil, Trash2, Flag, Clock, CalendarPlus } from "lucide-react";
import type { Task } from "../../types";
import { PRIORITIES } from "../../types";
import { formatDuration, formatDateLabel, cn } from "../../lib/utils";
import { useTaskStore } from "../../stores/taskStore";
import { useToastStore } from "../../stores/toastStore";

interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
}

const TIME_PREF_ICONS: Record<string, string> = {
  morning: "☀️",
  afternoon: "⛅",
  evening: "🌙",
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { toggleTask, deleteTask, restoreTask, addTask } = useTaskStore();
  const showToast = useToastStore((s) => s.showToast);
  const copyDateRef = useRef<HTMLInputElement>(null);
  const isDone = task.status === "done";
  const priority = PRIORITIES.find((p) => p.value === task.priority);

  const handleDelete = () => {
    const snapshot = { ...task };
    deleteTask(task.id);
    showToast("Task deleted", "info", {
      action: { label: "Undo", onClick: () => restoreTask(snapshot) },
    });
  };

  const handleCopyToDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!date) return;
    addTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
      date,
      timePreference: task.timePreference,
    });
    showToast(`Copied to ${formatDateLabel(date)}`, "success");
    e.target.value = "";
  };

  return (
    <div className={cn("task-card", isDone && "done")}>
      {/* Checkbox */}
      <div
        className={cn("task-checkbox", isDone && "checked")}
        onClick={() => toggleTask(task.id)}
        role="checkbox"
        aria-checked={isDone}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleTask(task.id)}
      >
        {isDone && <Check size={14} />}
      </div>

      {/* Body */}
      <div className="task-body">
        <div className={cn("task-title", isDone && "done")}>{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <span
            className="task-badge"
            style={{ color: priority?.color, background: priority?.bg }}
          >
            <Flag size={10} />
            {task.priority}
          </span>
          <span className="task-time">
            <Clock size={12} />
            {formatDuration(task.estimatedMinutes)}
          </span>
          {task.timePreference && (
            <span className="time-pref-badge" title={task.timePreference}>
              {TIME_PREF_ICONS[task.timePreference]}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions">
        {/* Copy to another day */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => copyDateRef.current?.showPicker?.()}
            aria-label="Copy to another day"
            title="Copy to another day"
          >
            <CalendarPlus size={15} />
          </button>
          <input
            ref={copyDateRef}
            type="date"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              pointerEvents: "none",
              width: "100%",
              height: "100%",
            }}
            onChange={handleCopyToDate}
            tabIndex={-1}
          />
        </div>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onEdit(task.id)}
          aria-label="Edit task"
        >
          <Pencil size={15} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm btn-danger"
          onClick={handleDelete}
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
