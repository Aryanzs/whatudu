import { LogIn, LogOut, Trash2, User } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTaskStore } from "../../stores/taskStore";
import { useTimetableStore } from "../../stores/timetableStore";
import { usePuter } from "../../hooks/usePuter";
import { setAIModel } from "../../services/ai";
import type { AIModel } from "../../types";

const AI_MODELS: { value: AIModel; label: string; description: string }[] = [
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Fast and free — best for most users",
  },
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Latest Gemini model with improved reasoning",
  },
  {
    value: "claude-sonnet",
    label: "Claude Sonnet",
    description: "Anthropic's balanced model — great quality",
  },
  {
    value: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    description: "OpenAI's efficient model",
  },
];

export const SettingsPage = () => {
  const { aiModel, setAIModel: setStoreModel } = useSettingsStore();
  const clearAllTasks = useTaskStore((s) => s.clearAll);
  const clearTimetable = useTimetableStore((s) => s.clearTimetable);
  const { isSignedIn, username, signIn, signOut } = usePuter();

  const handleModelChange = (model: AIModel) => {
    setStoreModel(model);
    setAIModel(model);
  };

  const handleClearAll = () => {
    if (confirm("Delete all tasks and timetables? This cannot be undone.")) {
      clearAllTasks();
      clearTimetable();
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      {/* Puter Account */}
      <div className="settings-card">
        <h4>Puter Account</h4>
        <p>
          WhaTodo uses Puter.js for AI. Sign in with your free Puter account to
          enable AI features. No API keys needed — Puter handles everything.
        </p>

        {isSignedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="api-status">
              <div className="api-dot" style={{ background: "var(--low)" }} />
              <User size={14} />
              <span style={{ fontWeight: 500 }}>{username}</span>
              <span style={{ color: "var(--text-tertiary)" }}>· Connected</span>
            </div>
            <button className="btn btn-sm" onClick={signOut}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <button className="btn btn-primary" onClick={signIn}>
              <LogIn size={14} />
              Sign in with Puter
            </button>
            <div className="api-status" style={{ marginTop: 8 }}>
              <div
                className="api-dot"
                style={{ background: "var(--medium)" }}
              />
              <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                Not signed in — AI features won't work without signing in
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Model */}
      <div className="settings-card">
        <h4>AI Model</h4>
        <p>
          Choose which AI model generates your timetables. Different models have
          different strengths and costs.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {AI_MODELS.map((m) => (
            <label
              key={m.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                border: `1px solid ${aiModel === m.value ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                background:
                  aiModel === m.value ? "var(--accent-light)" : "transparent",
                transition: "all 0.15s",
              }}
              onClick={() => handleModelChange(m.value)}
            >
              <input
                type="radio"
                name="aiModel"
                checked={aiModel === m.value}
                onChange={() => handleModelChange(m.value)}
                style={{ marginTop: 2 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    marginTop: 2,
                  }}
                >
                  {m.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-card">
        <h4>Data Management</h4>
        <p>
          Your data is stored locally in your browser. AI requests are processed
          through Puter.js and the model provider. Nothing else is stored
          externally.
        </p>
        <button className="btn btn-danger" onClick={handleClearAll}>
          <Trash2 size={14} />
          Clear All Data
        </button>
      </div>

      {/* About */}
      <div className="settings-card">
        <h4>About WhaTodo</h4>
        <p>
          AI-powered task management and scheduling. Built with React,
          TypeScript, Zustand, and Puter.js. Designed to be a PWA — install it
          on your phone from the browser menu.
        </p>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};
