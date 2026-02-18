import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeBlock, SavedTimetable, ChatMessage } from "../types";
import { generateId, timeToMinutes, minutesToTime } from "../lib/utils";
import { useTaskStore } from "./taskStore";

/** Recalculate start/end times for all blocks so they flow consecutively */
const recalculateTimes = (blocks: TimeBlock[]): TimeBlock[] => {
  if (blocks.length === 0) return blocks;
  let currentTime = blocks[0].startTime;
  return blocks.map((block) => {
    const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    const startMin = timeToMinutes(currentTime);
    const updated = {
      ...block,
      startTime: currentTime,
      endTime: minutesToTime(startMin + duration),
    };
    currentTime = updated.endTime;
    return updated;
  });
};

interface TimetableState {
  timetable: TimeBlock[];
  savedTimetables: SavedTimetable[];
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  isChatLoading: boolean;

  // Actions
  setTimetable: (blocks: TimeBlock[]) => void;
  moveBlock: (index: number, direction: -1 | 1) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  deleteBlock: (index: number) => void;
  saveTimetable: () => void;
  loadSavedTimetable: (id: string) => void;
  deleteSavedTimetable: (id: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  setIsGenerating: (v: boolean) => void;
  setIsChatLoading: (v: boolean) => void;
  clearTimetable: () => void;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      timetable: [],
      savedTimetables: [],
      chatMessages: [
        { role: "system", content: "Generate a timetable first, then ask me to rearrange it." },
      ],
      isGenerating: false,
      isChatLoading: false,

      setTimetable: (blocks) => set({ timetable: blocks }),

      moveBlock: (index, direction) => {
        const { timetable } = get();
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= timetable.length) return;

        const newTT = [...timetable];
        [newTT[index], newTT[targetIndex]] = [newTT[targetIndex], newTT[index]];
        set({ timetable: recalculateTimes(newTT) });
      },

      reorderBlocks: (fromIndex, toIndex) => {
        const { timetable } = get();
        if (
          fromIndex === toIndex ||
          fromIndex < 0 || fromIndex >= timetable.length ||
          toIndex < 0 || toIndex >= timetable.length
        ) return;

        const newTT = [...timetable];
        const [moved] = newTT.splice(fromIndex, 1);
        newTT.splice(toIndex, 0, moved);
        set({ timetable: recalculateTimes(newTT) });
      },

      deleteBlock: (index) => {
        const { timetable } = get();
        const newTT = timetable.filter((_, i) => i !== index);
        set({ timetable: recalculateTimes(newTT) });
      },

      saveTimetable: () => {
        const { timetable } = get();
        if (timetable.length === 0) return;

        const selectedDate = useTaskStore.getState().selectedDate;
        const saved: SavedTimetable = {
          id: generateId(),
          timetable: [...timetable],
          savedAt: Date.now(),
          date: selectedDate,
          taskCount: timetable.filter(
            (b) => !b.taskTitle.toLowerCase().includes("break") && !b.taskTitle.toLowerCase().includes("lunch")
          ).length,
        };

        set((state) => ({
          savedTimetables: [saved, ...state.savedTimetables],
        }));
      },

      loadSavedTimetable: (id) => {
        const { savedTimetables } = get();
        const found = savedTimetables.find((s) => s.id === id);
        if (found) {
          set({ timetable: [...found.timetable] });
        }
      },

      deleteSavedTimetable: (id) => {
        set((state) => ({
          savedTimetables: state.savedTimetables.filter((s) => s.id !== id),
        }));
      },

      addChatMessage: (msg) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, { ...msg, timestamp: Date.now() }],
        }));
      },

      setChatMessages: (msgs) => set({ chatMessages: msgs }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setIsChatLoading: (v) => set({ isChatLoading: v }),

      clearTimetable: () =>
        set({
          timetable: [],
          chatMessages: [
            { role: "system", content: "Generate a timetable first, then ask me to rearrange it." },
          ],
        }),
    }),
    {
      name: "whatodo-timetable",
      partialize: (state) => ({
        timetable: state.timetable,
        savedTimetables: state.savedTimetables,
      }),
    }
  )
);
