import { Sparkles, Save, Calendar, Loader2 } from "lucide-react";
import { useTimetableStore } from "../../stores/timetableStore";
import { useTaskStore } from "../../stores/taskStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { chatCompletion } from "../../services/ai";
import { buildTimetablePrompt } from "../../lib/prompts";
import { safeParseJSON } from "../../lib/utils";
import { TimeBlock } from "./TimeBlock";
import { SavedTimetables } from "./SavedTimetables";
import { ChatPanel } from "../chat/ChatPanel";
import type { TimeBlock as TimeBlockType } from "../../types";

export const TimetableView = () => {
  const {
    timetable,
    isGenerating,
    setIsGenerating,
    setTimetable,
    setChatMessages,
    saveTimetable,
  } = useTimetableStore();

  const getActiveTasks = useTaskStore((s) => s.getActiveTasks);
  const activeTasks = getActiveTasks();

  const handleRegenerate = async () => {
    if (activeTasks.length === 0) return;
    setIsGenerating(true);

    try {
      const prompt = buildTimetablePrompt(activeTasks);
      const response = await chatCompletion(prompt);
      const parsed = safeParseJSON<TimeBlockType[]>(response);

      if (parsed && Array.isArray(parsed)) {
        setTimetable(parsed);
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
      setChatMessages([
        {
          role: "ai",
          content: `Regeneration failed: ${err instanceof Error ? err.message : "Unknown error"}`,
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
                <button className="btn btn-sm" onClick={saveTimetable}>
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

        {/* Loading skeleton */}
        {isGenerating && timetable.length === 0 && (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton skeleton-block"
                style={{ animationDelay: `${i * 0.1}s` }}
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
                key={`${block.startTime}-${i}`}
                block={block}
                index={i}
                total={timetable.length}
              />
            ))}
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
