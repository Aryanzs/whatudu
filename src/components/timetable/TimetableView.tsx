import { useState, useCallback, useEffect } from "react";
import { Sparkles, Save, Calendar, Loader2, Plus, AlertTriangle } from "lucide-react";
import { useTimetableStore } from "../../stores/timetableStore";
import { useTaskStore } from "../../stores/taskStore";
import { chatCompletion } from "../../services/ai";
import { buildTimetablePrompt } from "../../lib/prompts";
import { safeParseJSON, formatDateLabel, timeToMinutes, minutesToTime } from "../../lib/utils";
import { TimeBlock } from "./TimeBlock";
import { SavedTimetables } from "./SavedTimetables";
import { ChatPanel } from "../chat/ChatPanel";
import { useToastStore } from "../../stores/toastStore";
import type { TimeBlock as TimeBlockType } from "../../types";

const PROGRESS_STEPS = [
  "Analyzing your tasks...",
  "Building your optimal schedule...",
  "Adding smart breaks...",
  "Almost done...",
];

export const TimetableView = () => {
  const {
    timetable,
    timetableDate,
    isGenerating,
    setIsGenerating,
    setTimetable,
    setTimetableDate,
    addBlock,
    setChatMessages,
    saveTimetable,
    reorderBlocks,
  } = useTimetableStore();

  const getActiveTasks = useTaskStore((s) => s.getActiveTasks);
  const selectedDate = useTaskStore((s) => s.selectedDate);
  const addTask = useTaskStore((s) => s.addTask);
  const activeTasks = getActiveTasks();
  const showToast = useToastStore((s) => s.showToast);

  // ── Drag state ──
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // ── Animated progress ──
  const [progressStep, setProgressStep] = useState(0);
  const [progressWidth, setProgressWidth] = useState(15);

  useEffect(() => {
    if (!isGenerating) {
      setProgressStep(0);
      setProgressWidth(15);
      return;
    }
    const stepTimer = setInterval(() => {
      setProgressStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1));
    }, 2200);
    const barTimer = setInterval(() => {
      setProgressWidth((w) => Math.min(w + 7, 88));
    }, 600);
    return () => {
      clearInterval(stepTimer);
      clearInterval(barTimer);
    };
  }, [isGenerating]);

  // ── Add block form ──
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState(30);

  const handleAddBlock = () => {
    if (!newTitle.trim()) return;
    const lastBlock = timetable[timetable.length - 1];
    const startTime = lastBlock ? lastBlock.endTime : "09:00";
    const startMin = timeToMinutes(startTime);
    const endTime = minutesToTime(startMin + newDuration);
    addBlock({ taskTitle: newTitle.trim(), startTime, endTime, reasoning: "Manually added" });
    addTask({
      title: newTitle.trim(),
      description: "",
      priority: "medium",
      estimatedMinutes: newDuration,
      date: selectedDate,
    });
    showToast(`"${newTitle.trim()}" added to tasks & timetable`, "success");
    setNewTitle("");
    setShowAddBlock(false);
  };

  // ── Drag handlers ──
  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    setDropIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      reorderBlocks(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
  }, [dragIndex, dropIndex, reorderBlocks]);

  const handleRegenerate = async () => {
    if (activeTasks.length === 0) return;
    setIsGenerating(true);

    try {
      const prompt = buildTimetablePrompt(activeTasks);
      const response = await chatCompletion(prompt);
      const parsed = safeParseJSON<TimeBlockType[]>(response);

      if (parsed && Array.isArray(parsed)) {
        setTimetable(parsed);
        setTimetableDate(selectedDate);
        setChatMessages([
          { role: "system", content: "Timetable regenerated!" },
          {
            role: "ai",
            content: `Fresh schedule with ${parsed.length} blocks. Ask me to adjust anything!`,
          },
        ]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      showToast(`Regeneration failed: ${msg}`, "error");
      setChatMessages([
        {
          role: "ai",
          content: `Regeneration failed: ${msg}`,
        },
      ]);
    }

    setIsGenerating(false);
  };

  const taskBlockCount = timetable.filter(
    (b) =>
      !b.taskTitle.toLowerCase().includes("break") &&
      !b.taskTitle.toLowerCase().includes("lunch")
  ).length;

  const dateMismatch = !!(timetableDate && timetable.length > 0 && timetableDate !== selectedDate);
  const timetableDateLabel = timetableDate ? formatDateLabel(timetableDate) : "";

  return (
    <div className="timetable-container">
      {/* Timeline */}
      <div className="timetable-view">
        <div className="timetable-header">
          <div>
            <h2>Timetable</h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {timetable.length > 0
                ? `${taskBlockCount} tasks scheduled`
                : "Generate from your tasks"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {timetable.length > 0 && (
              <>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    saveTimetable();
                    showToast("Timetable saved", "success");
                  }}
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  className="btn-ai"
                  style={{ padding: "8px 14px", fontSize: 13 }}
                  onClick={handleRegenerate}
                  disabled={isGenerating || activeTasks.length === 0}
                >
                  {isGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Regenerate
                </button>
              </>
            )}
          </div>
        </div>

        {/* Date mismatch banner */}
        {dateMismatch && (
          <div className="date-mismatch-banner">
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            This timetable was generated for <strong style={{ margin: "0 3px" }}>{timetableDateLabel}</strong>.
            Switch back to that date or regenerate.
          </div>
        )}

        {/* Animated generation progress */}
        {isGenerating && timetable.length === 0 && (
          <div className="generation-progress">
            <div className="generation-step">
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)", flexShrink: 0 }} />
              {PROGRESS_STEPS[progressStep]}
            </div>
            <div className="generation-progress-track">
              <div className="generation-progress-bar" style={{ width: `${progressWidth}%` }} />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton skeleton-block"
                style={{ animationDelay: `${i * 0.12}s`, height: 60 }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && timetable.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={28} />
            </div>
            <h3>No timetable yet</h3>
            <p>
              Add tasks and click "Generate Timetable" to let AI create your
              optimal schedule.
            </p>
          </div>
        )}

        {/* Timetable blocks */}
        {timetable.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {timetable.map((block, i) => (
              <TimeBlock
                key={`${block.taskTitle}-${i}`}
                block={block}
                index={i}
                isDragging={dragIndex === i}
                isDragOver={dropIndex === i && dragIndex !== i}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}

        {/* Add block section */}
        {timetable.length > 0 && (
          <div className="add-block-section">
            {!showAddBlock ? (
              <button
                className="add-block-toggle-btn"
                onClick={() => setShowAddBlock(true)}
              >
                <Plus size={14} />
                Add block
              </button>
            ) : (
              <div className="add-block-form">
                <div className="add-block-row">
                  <input
                    className="input"
                    placeholder="Block title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddBlock()}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                  <select
                    className="input"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    style={{ width: 100, flexShrink: 0 }}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hr</option>
                    <option value={90}>1.5 hr</option>
                    <option value={120}>2 hr</option>
                  </select>
                </div>
                <div className="add-block-row" style={{ justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      setShowAddBlock(false);
                      setNewTitle("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddBlock}
                    disabled={!newTitle.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved timetables */}
        <SavedTimetables />
      </div>

      {/* Chat Panel */}
      <ChatPanel />
    </div>
  );
};
