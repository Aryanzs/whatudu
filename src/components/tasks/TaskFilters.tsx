import { useTaskStore } from "../../stores/taskStore";
import type { FilterType } from "../../types";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const TaskFilters = () => {
  const { filter, searchQuery, setFilter, setSearchQuery } = useTaskStore();

  return (
    <div className="filter-bar">
      <input
        className="search-input"
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search tasks"
      />
      {FILTER_OPTIONS.map((f) => (
        <button
          key={f.value}
          className={`filter-chip ${filter === f.value ? "active" : ""}`}
          onClick={() => setFilter(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
