import { create } from "zustand";

export interface AttendanceRecord {
  id: number;
  projectWorkerId: number;
  date: string;
  status: string;
  shifts: number;
}

interface AttendanceStore {
  selectedWorker: AttendanceRecord | null;
  setSelectedWorker: (worker: AttendanceRecord) => void;
  clearSelectedWorker: () => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  selectedWorker: null,
  setSelectedWorker: (worker) => set({ selectedWorker: worker }),
  clearSelectedWorker: () => set({ selectedWorker: null }),
}));
