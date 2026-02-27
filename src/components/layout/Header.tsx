import { ListTodo, Calendar, Settings, LogIn } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { usePuter } from "../../hooks/usePuter";
import type { TabId } from "../../types";

const tabs: { id: TabId; label: string; icon: typeof ListTodo }[] = [
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Header = () => {
  const { activeTab, setActiveTab } = useSettingsStore();
  const { isReady, isSignedIn, username, signIn } = usePuter();

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
        {isSignedIn ? (
          <div className="profile-chip">
            <div className="profile-avatar">
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <span className="profile-name">{username}</span>
          </div>
        ) : (
          <button
            className="btn-sign-in"
            onClick={signIn}
            disabled={!isReady}
          >
            <LogIn size={14} />
            <span className="btn-sign-in-text">Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
