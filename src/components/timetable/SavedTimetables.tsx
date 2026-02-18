import { Trash2 } from "lucide-react";
import { useTimetableStore } from "../../stores/timetableStore";

export const SavedTimetables = () => {
  const { savedTimetables, loadSavedTimetable, deleteSavedTimetable } =
    useTimetableStore();

  if (savedTimetables.length === 0) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        Saved Schedules
      </h3>
      {savedTimetables.map((s) => (
        <div
          key={s.id}
          className="saved-timetable-card"
          onClick={() => loadSavedTimetable(s.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && loadSavedTimetable(s.id)}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {new Date(s.savedAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              {s.taskCount} tasks ·{" "}
              {new Date(s.savedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              deleteSavedTimetable(s.id);
            }}
            aria-label="Delete saved timetable"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
