import { create } from "zustand";
import { generateId } from "../lib/utils";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  showToast: (
    message: string,
    type: ToastType,
    options?: { action?: Toast["action"] }
  ) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type, options) => {
    const id = generateId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type, ...options }] }));
    // Auto-dismiss success and info; errors stay until manually closed
    if (type !== "error") {
      setTimeout(
        () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        4000
      );
    }
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
