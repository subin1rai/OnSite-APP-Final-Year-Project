import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiHandler from "@/context/ApiHandler";
import * as SecureStore from "expo-secure-store";
import { useProjectStore } from "@/store/projectStore";

// 3D Model Type
interface ThreeDModel {
  id: number;
  modelName: string;
  modelUrl: string;
  image: string;
  userId: number;
  projectId: number;
  createdAt: string;
}

// Store Type including selectedModel state
interface ThreeDModelStore {
  threeDModels: ThreeDModel[];
  selectedModel: ThreeDModel | null;
  fetchThreeDModels: () => Promise<void>;
  clearThreeDModels: () => void;
  addThreeDModel: (newModel: ThreeDModel) => void;
  setSelectedModel: (model: ThreeDModel) => void;
}

export const useThreeDModelStore = create<ThreeDModelStore>()(
  persist(
    (set, get) => ({
      threeDModels: [],
      selectedModel: null,

      // Clearing models before fetching new ones
      clearThreeDModels: () => set({ threeDModels: [] }),

      // Fetch 3D Models
      fetchThreeDModels: async () => {
        const projectStore = useProjectStore.getState();
        const selectedProject = projectStore.selectedProject;

        if (!selectedProject) {
          console.warn("No active project selected.");
          return;
        }

        try {
          const token = await SecureStore.getItemAsync("AccessToken");

          const response = await apiHandler.post(
            "/all3dModel",
            { projectId: selectedProject.id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            set({ threeDModels: response.data.models });
          }
        } catch (error) {
          console.error("Failed to fetch 3D models:", error);
        }
      },

      // Adds a new 3D Model to state
      addThreeDModel: (newModel: ThreeDModel) => {
        set((state) => ({ threeDModels: [newModel, ...state.threeDModels] }));
      },

      // Saves the selected model
      setSelectedModel: (model: ThreeDModel) => set({ selectedModel: model }),
    }),
    { name: "threeDModel-storage" }
  )
);
