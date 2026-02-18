import { ArrowUp, ArrowDown, Trash2, Clock } from "lucide-react";
import type { TimeBlock as TimeBlockType } from "../../types";
import { PRIORITIES } from "../../types";
import { useTaskStore } from "../../stores/taskStore";
import { useTimetableStore } from "../../stores/timetableStore";

interface TimeBlockProps {
  block: TimeBlockType;
  index: number;
  total: number;
}

export const TimeBlock = ({ block, index, total }: TimeBlockProps) => {
  const tasks = useTaskStore((s) => s.tasks);
  const { moveBlock, deleteBlock } = useTimetableStore();

  const isBreak =
    block.taskTitle === "Break" ||
    block.taskTitle.toLowerCase().includes("break") ||
    block.taskTitle.toLowerCase().includes("lunch");

  const matchedTask = tasks.find((t) => t.title === block.taskTitle);
  const priority = matchedTask
    ? PRIORITIES.find((p) => p.value === matchedTask.priority)
    : null;

  return (
    <div
      className="time-block"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="time-label">{block.startTime}</div>
      <div
        className={`time-block-card ${isBreak ? "is-break" : ""}`}
        style={priority ? { borderLeftColor: priority.color } : {}}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="time-block-title">{block.taskTitle}</div>
            {block.reasoning && (
              <div className="time-block-reasoning">{block.reasoning}</div>
            )}
            <div className="time-block-time">
              <Clock size={11} />
              {block.startTime} — {block.endTime}
              {priority && (
                <span
                  className="task-badge"
                  style={{
                    color: priority.color,
                    background: priority.bg,
                    marginLeft: 8,
                  }}
                >
                  {matchedTask!.priority}
                </span>
              )}
            </div>
          </div>
          <div className="time-block-actions">
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => moveBlock(index, -1)}
              disabled={index === 0}
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => moveBlock(index, 1)}
              disabled={index === total - 1}
              aria-label="Move down"
            >
              <ArrowDown size={14} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm btn-danger"
              onClick={() => deleteBlock(index)}
              aria-label="Remove block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
