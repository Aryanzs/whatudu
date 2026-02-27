import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { useTaskStore } from "../../stores/taskStore";
import { useToastStore } from "../../stores/toastStore";
import { PRIORITIES, TIME_PRESETS } from "../../types";
import type { Priority, TimePreference } from "../../types";
import { formatDuration } from "../../lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskId: string | null;
}

/**
 * Parse flexible time strings into total minutes.
 * Accepts: "1h 25m", "1h25m", "1:25", "1.5h", "45m", "90" (plain = minutes)
 */
const parseTimeInput = (value: string): number | null => {
  const s = value.trim().toLowerCase();
  if (!s) return null;

  // "1h 25m", "1h25m", "1hr 25min", "1 hour 25 minutes"
  const hmMatch = s.match(
    /^(\d+(?:\.\d+)?)\s*h(?:r|rs|our|ours)?\s+(\d+)\s*m?(?:in|ins|inute|inutes)?$|^(\d+(?:\.\d+)?)\s*h(?:r|rs|our|ours)?(\d+)\s*m?(?:in|ins|inute|inutes)?$/
  );
  if (hmMatch) {
    const hours = parseFloat(hmMatch[1] ?? hmMatch[3]);
    const mins = parseInt(hmMatch[2] ?? hmMatch[4]);
    return Math.round(hours * 60) + mins;
  }

  // "1:25" (h:mm)
  const colonMatch = s.match(/^(\d+):(\d{1,2})$/);
  if (colonMatch) {
    return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  }

  // "1.5h", "2h", "1 hour"
  const hourMatch = s.match(/^(\d+(?:\.\d+)?)\s*h(?:r|rs|our|ours)?$/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // "45m", "45min", "45 minutes"
  const minMatch = s.match(/^(\d+)\s*m(?:in|ins|inute|inutes)?$/);
  if (minMatch) {
    return parseInt(minMatch[1]);
  }

  // Plain number → minutes
  const numMatch = s.match(/^(\d+)$/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }

  return null;
};

/** Convert stored minutes to a human-friendly display string */
const minutesToDisplay = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const TIME_PREF_OPTIONS: { value: TimePreference; label: string; icon: string }[] = [
  { value: "morning", label: "Morning", icon: "☀️" },
  { value: "afternoon", label: "Afternoon", icon: "⛅" },
  { value: "evening", label: "Evening", icon: "🌙" },
];

export const TaskModal = ({ isOpen, onClose, editingTaskId }: TaskModalProps) => {
  const { tasks, addTask, updateTask } = useTaskStore();
  const selectedDate = useTaskStore((s) => s.selectedDate);
  const showToast = useToastStore((s) => s.showToast);
  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [customTime, setCustomTime] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [timePreference, setTimePreference] = useState<TimePreference | undefined>(undefined);

  // Reset form when modal opens or editing task changes
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setPriority(editingTask.priority);
        setEstimatedMinutes(editingTask.estimatedMinutes);
        const isPreset = TIME_PRESETS.includes(editingTask.estimatedMinutes);
        setIsCustom(!isPreset);
        setCustomTime(!isPreset ? minutesToDisplay(editingTask.estimatedMinutes) : "");
        setTimePreference(editingTask.timePreference ?? undefined);
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setEstimatedMinutes(60);
        setCustomTime("");
        setIsCustom(false);
        setTimePreference(undefined);
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const finalMinutes = isCustom ? (parseTimeInput(customTime) ?? 0) : estimatedMinutes;
    if (finalMinutes <= 0) return;

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedMinutes: finalMinutes,
      date: editingTask?.date || selectedDate,
      timePreference,
    };

    if (editingTask) {
      updateTask(editingTask.id, data);
      showToast("Task updated", "success");
    } else {
      addTask(data);
      showToast("Task added", "success");
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
    setCustomTime(value);
    const parsed = parseTimeInput(value);
    if (parsed && parsed > 0) {
      setEstimatedMinutes(parsed);
    }
  };

  const parsedCustomMinutes = parseTimeInput(customTime);
  const customIsValid = parsedCustomMinutes !== null && parsedCustomMinutes > 0;

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
            disabled={!title.trim() || (isCustom && !customIsValid)}
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
          <div className="custom-time-input">
            <input
              className={`form-input ${customTime && !customIsValid ? "input-error" : ""}`}
              type="text"
              placeholder="e.g. 1h 25m, 1:25, 90"
              value={customTime}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            <span className="custom-time-hint">
              {customTime
                ? customIsValid
                  ? formatDuration(parsedCustomMinutes!)
                  : "Invalid — try 1h 25m, 1:25 or 90"
                : "hours, h:mm or minutes"}
            </span>
          </div>
        )}
      </div>

      {/* Preferred Time */}
      <div className="form-group">
        <label className="form-label">
          Preferred Time <span className="form-label-optional">(optional)</span>
        </label>
        <div className="time-preference-selector">
          {TIME_PREF_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`time-pref-chip ${timePreference === p.value ? "selected" : ""}`}
              onClick={() =>
                setTimePreference(timePreference === p.value ? undefined : p.value)
              }
            >
              <span className="time-pref-icon">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
