import type { Task, TimeBlock } from "../types";

/**
 * Build the prompt for generating a timetable from tasks
 */
export const buildTimetablePrompt = (tasks: Task[]): string => {
  const now = new Date();
  const taskList = tasks
    .filter((t) => t.status !== "done")
    .map((t) => {
      const pref = t.timePreference ? ` | Preferred time: ${t.timePreference}` : "";
      return `- "${t.title}" | Priority: ${t.priority} | Est. time: ${t.estimatedMinutes}min${pref} | ${t.description || "No details"}`;
    })
    .join("\n");

  return `You are an expert productivity coach and time management specialist. Generate an optimized daily timetable based on these tasks.

Current date/time: ${now.toLocaleString()}

Tasks:
${taskList}

Rules:
1. Critical and high priority tasks should be scheduled during peak focus hours (morning/early afternoon)
2. Include 5-10 minute breaks between tasks
3. Include a lunch break if schedule spans midday
4. Group similar tasks when possible
5. Never schedule more than 2 hours of deep work without a break
6. Start from the next available hour from now
7. Respect the estimated time for each task
8. Respect each task's preferred time slot when specified:
   - morning = 6:00am–12:00pm, afternoon = 12:00pm–5:00pm, evening = 5:00pm–10:00pm
   Only override a preference if it creates a severe scheduling conflict.

Respond ONLY with a valid JSON array. No markdown, no backticks, no explanation text. Just the raw JSON array:
[{"taskTitle":"exact task title from above","startTime":"HH:MM","endTime":"HH:MM","reasoning":"brief reason for this time slot"},{"taskTitle":"Break","startTime":"HH:MM","endTime":"HH:MM","reasoning":"Rest period"}]`;
};

/**
 * Build the prompt for chat-based timetable rearrangement
 */
export const buildChatPrompt = (
  tasks: Task[],
  timetable: TimeBlock[],
  userMessage: string,
  chatHistory: { role: string; content: string }[]
): string => {
  const historyStr = chatHistory
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const ttStr = timetable
    .map((b) => `${b.startTime}-${b.endTime}: ${b.taskTitle}`)
    .join("\n");

  const tasksStr = tasks
    .filter((t) => t.status !== "done")
    .map((t) => `- "${t.title}" (${t.priority}, ${t.estimatedMinutes}min)`)
    .join("\n");

  return `You are an AI productivity assistant for the WhaTodo app. The user wants to modify their timetable through conversation.

Current timetable:
${ttStr}

Available tasks:
${tasksStr}

Recent conversation:
${historyStr}

User says: "${userMessage}"

If the user wants to rearrange, add breaks, swap tasks, or modify timing, respond with TWO parts:
1. A brief friendly message explaining what you changed
2. The updated timetable as JSON

Format your response EXACTLY like this:
MESSAGE: Your friendly explanation here
TIMETABLE: [{"taskTitle":"...","startTime":"HH:MM","endTime":"HH:MM","reasoning":"..."}]

If the user is just chatting or asking a question (not requesting changes), respond with ONLY:
MESSAGE: Your helpful response here

Do NOT use markdown backticks around the JSON. Do NOT add any other text outside this format.`;
};

/**
 * Parse the chat response into message and optional timetable
 */
export const parseChatResponse = (
  response: string
): { message: string; timetable: TimeBlock[] | null } => {
  const messageMatch = response.match(/MESSAGE:\s*([\s\S]*?)(?=TIMETABLE:|$)/);
  const timetableMatch = response.match(/TIMETABLE:\s*(\[[\s\S]*\])/);

  const message = messageMatch ? messageMatch[1].trim() : response.trim();

  let timetable: TimeBlock[] | null = null;
  if (timetableMatch) {
    try {
      const cleaned = timetableMatch[1]
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      timetable = JSON.parse(cleaned);
    } catch {
      timetable = null;
    }
  }

  return { message, timetable };
};
