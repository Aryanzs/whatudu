// ─── Task Types ─────────────────────────────────────────────────────

export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  date: string; // YYYY-MM-DD — the day this task is scheduled for
  category?: string;
  tags?: string[];
  dueDate?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  date: string; // YYYY-MM-DD
}

// ─── Timetable Types ────────────────────────────────────────────────

export interface TimeBlock {
  taskTitle: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  reasoning: string;
}

export interface SavedTimetable {
  id: string;
  timetable: TimeBlock[];
  savedAt: number;
  taskCount: number;
  date?: string; // YYYY-MM-DD — the date this timetable was generated for
  label?: string;
}

// ─── Chat Types ─────────────────────────────────────────────────────

export type ChatRole = "user" | "ai" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: number;
}

// ─── Settings Types ─────────────────────────────────────────────────

export type AIModel = "gemini-2.0-flash" | "gemini-2.5-flash" | "claude-sonnet" | "gpt-4.1-nano";

export interface AppSettings {
  aiModel: AIModel;
  isPuterConnected: boolean;
}

// ─── UI Types ───────────────────────────────────────────────────────

export type TabId = "tasks" | "timetable" | "settings";

export type FilterType = "all" | "active" | "done" | Priority;

// ─── Priority Config ────────────────────────────────────────────────

export interface PriorityConfig {
  value: Priority;
  label: string;
  color: string;
  bg: string;
}

export const PRIORITIES: PriorityConfig[] = [
  { value: "critical", label: "Critical", color: "#dc2626", bg: "#fef2f2" },
  { value: "high", label: "High", color: "#ea580c", bg: "#fff7ed" },
  { value: "medium", label: "Medium", color: "#ca8a04", bg: "#fefce8" },
  { value: "low", label: "Low", color: "#16a34a", bg: "#f0fdf4" },
];

export const TIME_PRESETS: number[] = [15, 30, 45, 60, 90, 120, 180, 240];
