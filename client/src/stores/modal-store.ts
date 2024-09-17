import { create } from "zustand";

export type ModalType =
  | "upsert-classroom"
  | "upsert-teacher"
  | "upsert-student"
  | "assign-teacher"
  | "confirm"
  | "edit-timetable"
  | "assign-students"
  | "create-subject"
  | null;

type ModalData = {
  classId?: string;
  performingAction?: () => void;
  selectedStudents?: string[];
  teacher?: ITeacher;
  student?: IStudent;
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
