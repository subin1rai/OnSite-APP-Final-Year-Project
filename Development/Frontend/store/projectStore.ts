// projectStore.ts
import {create} from "zustand";

export interface Project {
  id: number;
  projectName: string;
  location: string;
  builderId: number;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
}

interface ProjectStore {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  clearSelectedProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  clearSelectedProject: () => set({ selectedProject: null }),
}));
