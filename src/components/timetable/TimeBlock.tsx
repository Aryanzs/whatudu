import { memo } from "react";
import { GripVertical, Trash2, Clock } from "lucide-react";
import type { TimeBlock as TimeBlockType } from "../../types";
import { PRIORITIES } from "../../types";
import { useTaskStore } from "../../stores/taskStore";
import { useTimetableStore } from "../../stores/timetableStore";

interface TimeBlockProps {
  block: TimeBlockType;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

export const TimeBlock = memo(
  ({
    block,
    index,
    isDragging,
    isDragOver,
    onDragStart,
    onDragEnter,
    onDragEnd,
  }: TimeBlockProps) => {
    const tasks = useTaskStore((s) => s.tasks);
    const { deleteBlock } = useTimetableStore();

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
        className={`time-block${isDragging ? " dragging" : ""}${isDragOver ? " drag-over" : ""}`}
        style={{ animationDelay: `${index * 0.05}s` }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          // Use a tiny timeout so the browser captures the element before we style it
          requestAnimationFrame(() => onDragStart(index));
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          onDragEnter(index);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDragEnd={onDragEnd}
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
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
              <div className="drag-handle" aria-label="Drag to reorder">
                <GripVertical size={16} />
              </div>
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
            </div>
            <div className="time-block-actions">
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
  }
);

TimeBlock.displayName = "TimeBlock";
