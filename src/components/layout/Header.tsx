import { ListTodo, Calendar, Settings, Plus } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import type { TabId } from "../../types";

interface HeaderProps {
  onAddTask: () => void;
}

const tabs: { id: TabId; label: string; icon: typeof ListTodo }[] = [
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Header = ({ onAddTask }: HeaderProps) => {
  const { activeTab, setActiveTab } = useSettingsStore();

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-mark">W</div>
        <div className="logo-text">WhaTodo</div>
      </div>

      <nav className="nav-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {activeTab === "tasks" && (
          <button className="btn btn-primary btn-sm" onClick={onAddTask}>
            <Plus size={14} />
            <span>Add</span>
          </button>
        )}
      </div>
    </header>
  );
};
