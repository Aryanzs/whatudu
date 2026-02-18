/**
 * Generate a unique ID (collision-safe for client-side use)
 */
export const generateId = (): string =>
  Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

/**
 * Format minutes into human-readable duration
 * e.g. 90 → "1h 30m", 45 → "45m", 120 → "2h"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Parse "HH:MM" time string to total minutes from midnight
 */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Convert total minutes from midnight to "HH:MM" string
 */
export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * Calculate duration between two "HH:MM" time strings in minutes
 */
export const getBlockDuration = (start: string, end: string): number => {
  return timeToMinutes(end) - timeToMinutes(start);
};

/**
 * Safely parse JSON from AI response (strips markdown fences)
 */
export const safeParseJSON = <T>(raw: string): T | null => {
  try {
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
};

/**
 * cn — simple conditional class name joiner
 */
export const cn = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(" ");

/**
 * Get YYYY-MM-DD string from a Date (defaults to today)
 */
export const toDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Format a YYYY-MM-DD string into a human-friendly label
 * Returns "Today", "Tomorrow", "Yesterday", or "Wed, Feb 19"
 */
export const formatDateLabel = (dateStr: string): string => {
  const today = toDateString();
  if (dateStr === today) return "Today";

  const todayDate = new Date(today + "T00:00:00");
  const tomorrow = new Date(todayDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === toDateString(tomorrow)) return "Tomorrow";

  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === toDateString(yesterday)) return "Yesterday";

  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};
