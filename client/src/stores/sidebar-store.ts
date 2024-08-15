import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useSidebar = create<SidebarState>((set, get) => ({
  isCollapsed: false,
  toggleSidebar: () => set({ isCollapsed: !get().isCollapsed }),
}));
