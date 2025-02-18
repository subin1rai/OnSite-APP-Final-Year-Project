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

// Store Type
interface ThreeDModelStore {
  threeDModels: ThreeDModel[];
  fetchThreeDModels: () => Promise<void>;
  clearThreeDModels: () => void;  // ✅ Function to clear models before fetching new ones
  addThreeDModel: (newModel: ThreeDModel) => void;
}

// Zustand Store with Persistence
export const useThreeDModelStore = create<ThreeDModelStore>()(
  persist(
    (set, get) => ({
      threeDModels: [],

      // ✅ Clears models before fetching new ones
      clearThreeDModels: () => set({ threeDModels: [] }),

      // Fetch 3D Models Using `selectedProject` from ProjectStore
      fetchThreeDModels: async () => {
        const projectStore = useProjectStore.getState();
        const selectedProject = projectStore.selectedProject;

        if (!selectedProject) {
          console.warn("No active project selected.");
          return;
        }

        try {
          const token = await SecureStore.getItemAsync("AccessToken");

          const response = await apiHandler.post("/all3dModel", { projectId: selectedProject.id }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            set({ threeDModels: response.data.models });
          }
        } catch (error) {
          console.error("Failed to fetch 3D models:", error);
        }
      },

      // Add 3D Model to State
      addThreeDModel: (newModel) => {
        set((state) => ({ threeDModels: [newModel, ...state.threeDModels] }));
      },
    }),
    { name: "threeDModel-storage" }
  )
);
