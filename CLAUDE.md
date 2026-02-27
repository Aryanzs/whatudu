# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check (tsc -b) then bundle to dist/
npm run preview  # Preview production build locally
```

No test or lint commands are configured.

## Architecture

**WhaTodo** is a PWA task manager with AI-generated scheduling. Stack: React 19, TypeScript, Vite, Tailwind CSS 4, Zustand 5, Puter.js.

### App Shell

`src/main.tsx` → `src/App.tsx` → `src/components/layout/AppShell.tsx`

AppShell renders one of three tab views (Tasks / Timetable / Settings) plus a floating chat panel. Active tab is driven by `settingsStore`.

### State (Zustand stores in `src/stores/`)

- **taskStore** — CRUD for tasks; filters by date/status/priority/search. Tasks are scoped to a `YYYY-MM-DD` date. Persisted as `whatodo-tasks`.
- **timetableStore** — AI-generated `TimeBlock[]` with drag-and-drop reordering, saved timetable snapshots, and chat message history. Persisted as `whatodo-timetable` (chat excluded).
- **settingsStore** — active tab + selected AI model. Persisted as `whatodo-settings`.

### AI Integration

- [src/services/ai.ts](src/services/ai.ts) — thin wrapper around `puter.ai.chat()` (Puter.js); handles auth automatically, user pays via Puter account.
- [src/lib/prompts.ts](src/lib/prompts.ts) — builds prompts for timetable generation (`buildTimetablePrompt`) and chat refinement (`buildChatPrompt`). `parseChatResponse` splits AI reply into a MESSAGE part and a TIMETABLE JSON part.
- Supported models: `gemini-2.0-flash`, `gemini-2.5-flash`, `claude-sonnet`, `gpt-4.1-nano`.

### Key Types (`src/types/index.ts`)

```typescript
Task           — id, title, description, priority, estimatedMinutes, status, date
TimeBlock      — taskTitle, startTime, endTime, reasoning
SavedTimetable — snapshot of a timetable for a given date
ChatMessage    — role ("user" | "ai" | "system"), content, timestamp
```

### Utilities (`src/lib/utils.ts`)

Helpers for ID generation, `HH:MM` ↔ minutes conversion, date formatting/navigation, duration display, safe JSON parsing (strips markdown fences), and `cn()` class merging.

### PWA

Service worker at `public/sw.js`; manifest at `public/manifest.json`. Registered in `src/main.tsx`.
