import { create } from "zustand";

type ModalType =
  | "create-classroom"
  | "create-teacher"
  | "create-student"
  | null;
type ModalData = unknown | null;

interface ModalStore {
  modalData: ModalData;
  isOpen: boolean;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  type: ModalType;
}

export const useModal = create<ModalStore>((set) => ({
  modalData: {},
  isOpen: false,
  openModal: (type, data) => set({ isOpen: true, modalData: data, type }),
  closeModal: () => set({ isOpen: false, modalData: null }),
  type: null,
}));
