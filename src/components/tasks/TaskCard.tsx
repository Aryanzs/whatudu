import { Check, Pencil, Trash2, Flag, Clock } from "lucide-react";
import type { Task } from "../../types";
import { PRIORITIES } from "../../types";
import { formatDuration, cn } from "../../lib/utils";
import { useTaskStore } from "../../stores/taskStore";

interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { toggleTask, deleteTask } = useTaskStore();
  const isDone = task.status === "done";
  const priority = PRIORITIES.find((p) => p.value === task.priority);

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
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onEdit(task.id)}
          aria-label="Edit task"
        >
          <Pencil size={15} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm btn-danger"
          onClick={() => deleteTask(task.id)}
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
