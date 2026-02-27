import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskFormData, FilterType } from "../types";
import { generateId, toDateString } from "../lib/utils";

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  searchQuery: string;
  selectedDate: string; // YYYY-MM-DD

  // Actions
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDate: (date: string) => void;
  clearAll: () => void;

  // Computed (use these via selectors)
  getFilteredTasks: () => Task[];
  getActiveTasks: () => Task[];
  getStats: () => { total: number; active: number; done: number };
}

/** Helper: get the effective date for a task (backward compat for old tasks without date) */
const taskDate = (task: Task): string => task.date || toDateString();

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",
      searchQuery: "",
      selectedDate: toDateString(),

      addTask: (data) => {
        const task: Task = {
          ...data,
          id: generateId(),
          status: "todo",
          createdAt: Date.now(),
        };
        set((state) => ({ tasks: [task, ...state.tasks] }));
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      restoreTask: (task) => {
        set((state) => ({ tasks: [task, ...state.tasks] }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: t.status === "done" ? "todo" : "done", updatedAt: Date.now() }
              : t
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),

      clearAll: () => set({ tasks: [], filter: "all", searchQuery: "" }),

      getFilteredTasks: () => {
        const { tasks, filter, searchQuery, selectedDate } = get();
        // First: scope to selected date
        let result = tasks.filter((t) => taskDate(t) === selectedDate);

        // Filter by status or priority
        if (filter !== "all") {
          if (filter === "active") result = result.filter((t) => t.status !== "done");
          else if (filter === "done") result = result.filter((t) => t.status === "done");
          else result = result.filter((t) => t.priority === filter);
        }

        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          result = result.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description?.toLowerCase().includes(q)
          );
        }

        return result;
      },

      getActiveTasks: () => {
        const { tasks, selectedDate } = get();
        return tasks.filter((t) => taskDate(t) === selectedDate && t.status !== "done");
      },

      getStats: () => {
        const { tasks, selectedDate } = get();
        const dateTasks = tasks.filter((t) => taskDate(t) === selectedDate);
        return {
          total: dateTasks.length,
          active: dateTasks.filter((t) => t.status !== "done").length,
          done: dateTasks.filter((t) => t.status === "done").length,
        };
      },
    }),
    {
      name: "whatodo-tasks",
    }
  )
);

