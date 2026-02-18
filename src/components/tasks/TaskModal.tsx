import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { useTaskStore } from "../../stores/taskStore";
import { PRIORITIES, TIME_PRESETS } from "../../types";
import type { Priority } from "../../types";
import { formatDuration } from "../../lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskId: string | null;
}

export const TaskModal = ({ isOpen, onClose, editingTaskId }: TaskModalProps) => {
  const { tasks, addTask, updateTask } = useTaskStore();
  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [customTime, setCustomTime] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Reset form when modal opens or editing task changes
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setPriority(editingTask.priority);
        setEstimatedMinutes(editingTask.estimatedMinutes);
        // Check if current time matches a preset
        const isPreset = TIME_PRESETS.includes(editingTask.estimatedMinutes);
        setIsCustom(!isPreset);
        setCustomTime(!isPreset ? String(editingTask.estimatedMinutes) : "");
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setEstimatedMinutes(60);
        setCustomTime("");
        setIsCustom(false);
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const finalMinutes = isCustom && customTime ? parseInt(customTime, 10) : estimatedMinutes;
    if (isNaN(finalMinutes) || finalMinutes <= 0) return;

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedMinutes: finalMinutes,
    };

    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }

    onClose();
  };

  const handleTimePresetClick = (minutes: number) => {
    setEstimatedMinutes(minutes);
    setIsCustom(false);
    setCustomTime("");
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setCustomTime("");
  };

  const handleCustomTimeChange = (value: string) => {
    // Only allow numbers
    const num = value.replace(/[^0-9]/g, "");
    setCustomTime(num);
    if (num) {
      setEstimatedMinutes(parseInt(num, 10));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? "Edit Task" : "New Task"}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim() || (isCustom && (!customTime || parseInt(customTime) <= 0))}
          >
            {editingTask ? "Update Task" : "Add Task"}
          </button>
        </>
      }
    >
      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <textarea
          className="form-input"
          placeholder="Add details, notes, or context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Priority */}
      <div className="form-group">
        <label className="form-label">Priority</label>
        <div className="priority-selector">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              className={`priority-chip ${priority === p.value ? "selected" : ""}`}
              style={{
                color: p.color,
                borderColor: priority === p.value ? p.color : undefined,
                background: priority === p.value ? p.bg : undefined,
              }}
              onClick={() => setPriority(p.value)}
              type="button"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="form-group">
        <label className="form-label">Estimated Time</label>
        <div className="time-selector">
          {TIME_PRESETS.map((t) => (
            <button
              key={t}
              className={`time-chip ${!isCustom && estimatedMinutes === t ? "selected" : ""}`}
              onClick={() => handleTimePresetClick(t)}
              type="button"
            >
              {formatDuration(t)}
            </button>
          ))}
          <button
            className={`time-chip ${isCustom ? "selected" : ""}`}
            onClick={handleCustomToggle}
            type="button"
          >
            Custom
          </button>
        </div>

        {/* Custom time input */}
        {isCustom && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              placeholder="Enter minutes"
              value={customTime}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: 140 }}
              autoFocus
            />
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              minutes
              {customTime && parseInt(customTime) > 0 && (
                <> ({formatDuration(parseInt(customTime))})</>
              )}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
