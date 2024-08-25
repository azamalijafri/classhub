import { create } from "zustand";

type ModalType =
  | "upsert-classroom"
  | "create-teacher"
  | "create-student"
  | "assign-teacher"
  | "confirm"
  | "edit-timetable"
  | null;

type ModalData = {
  classId?: string;
  performingAction?: () => void;
} | null;

interface Modal {
  type: ModalType;
  data?: ModalData;
}

interface ModalStore {
  modals: Modal[];
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  modals: [],
  openModal: (type, data) =>
    set((state) => ({
      modals: [...state.modals, { type, data }],
    })),
  closeModal: () =>
    set((state) => ({
      modals: state.modals.slice(0, -1),
    })),
}));
