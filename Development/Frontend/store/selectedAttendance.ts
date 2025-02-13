import { create } from "zustand";

export interface Attendance {
  id: number;
  status: string;
  shifts: string;
}

interface AttendaceStore {
  selectedAttendance: Attendance | null;
  setSelectedAttendace: (attendance: Attendance) => void;
  clearSelectedAttendance: () => void;
}

export const useAttendaceStore = create<AttendaceStore>((set) => ({
  selectedAttendance: null,
  setSelectedAttendace: (attendance) => set({ selectedAttendance: attendance }),
  clearSelectedAttendance: () => set({ selectedAttendance: null }),
}));
