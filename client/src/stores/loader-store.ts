import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
