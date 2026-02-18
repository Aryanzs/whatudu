import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIModel, TabId } from "../types";

interface SettingsState {
  activeTab: TabId;
  aiModel: AIModel;

  setActiveTab: (tab: TabId) => void;
  setAIModel: (model: AIModel) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activeTab: "tasks",
      aiModel: "gemini-2.0-flash",

      setActiveTab: (tab) => set({ activeTab: tab }),
      setAIModel: (model) => set({ aiModel: model }),
    }),
    {
      name: "whatodo-settings",
      partialize: (state) => ({
        aiModel: state.aiModel,
      }),
    }
  )
);
