import { create } from 'zustand';
import { single_project } from '@/context/project';
import { useProjectStore } from '@/store/projectStore';

export interface AttendanceRecord {
  id: number;
  projectWorkerId: number;
  date: string;
  status: string;
  shifts: number;
}

export interface Worker {
  id: number;
  name: string;
  contact: string;
  profile: string | null;
  designation: string;
  isVisible: boolean; // ✅ lowercase boolean for correct type checking
  projectWorkerId: number;
  attendance: AttendanceRecord[];
}

interface AttendanceStore {
  selectedWorker: Worker | null;
  setSelectedWorker: (worker: Worker) => void;
  clearSelectedWorker: () => void;
  workers: Worker[];
  setWorkers: (workers: Worker[]) => void;
  fetchWorkers: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  selectedWorker: null,
  setSelectedWorker: (worker: Worker) => {
    set({ selectedWorker: worker });
  },
  clearSelectedWorker: () => set({ selectedWorker: null }),
  workers: [],
  setWorkers: (workers) => set({ workers }),

  fetchWorkers: async () => {
    const { selectedProject } = useProjectStore.getState();
    if (!selectedProject?.id) return;

    const result = await single_project(selectedProject.id.toString());

    if (result?.project?.worker) {
      console.log("Raw workers:", result.project.worker); // 🔍 Debug incoming data

      const visibleWorkers = result.project.worker.filter(
        (w: Worker) =>
          w.isVisible === true
      );

      console.log("Filtered visible workers:", visibleWorkers);

      set({ workers: visibleWorkers });
    } else {
      set({ workers: [] });
    }
  },
}));
