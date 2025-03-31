
import { create } from "zustand";

interface ProjectProgressStore {
  projectProgressMap: Record<number, number>; 
  setProjectProgress: (projectId: number, progress: number) => void;
}

export const useProjectProgressStore = create<ProjectProgressStore>((set) => ({
  projectProgressMap: {},
  setProjectProgress: (projectId, progress) =>
    set((state) => ({
      projectProgressMap: {
        ...state.projectProgressMap,
        [projectId]: progress,
      },
    })),
}));
