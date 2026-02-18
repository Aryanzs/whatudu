import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskFormData, FilterType } from "../types";
import { generateId } from "../lib/utils";

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  searchQuery: string;

  // Actions
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;

  // Computed (use these via selectors)
  getFilteredTasks: () => Task[];
  getActiveTasks: () => Task[];
  getStats: () => { total: number; active: number; done: number };
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",
      searchQuery: "",

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

      clearAll: () => set({ tasks: [], filter: "all", searchQuery: "" }),

      getFilteredTasks: () => {
        const { tasks, filter, searchQuery } = get();
        let result = tasks;

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
        return get().tasks.filter((t) => t.status !== "done");
      },

      getStats: () => {
        const { tasks } = get();
        return {
          total: tasks.length,
          active: tasks.filter((t) => t.status !== "done").length,
          done: tasks.filter((t) => t.status === "done").length,
        };
      },
    }),
    {
      name: "whatodo-tasks",
    }
  )
);
