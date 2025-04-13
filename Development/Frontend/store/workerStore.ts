import {create} from "zustand";
import { persist } from "zustand/middleware";
import apiHandler from "@/context/ApiHandler";
import * as SecureStore from "expo-secure-store";

// Worker Type
interface Worker {
  id: number;
  name: string;
  contact: string;
  profile?: string;
  designation?: string;
  salary: number;
}

//Store Type
interface WorkerStore {
  workers: Worker[];
  fetchWorkers: () => Promise<void>;
  addWorker: (newWorker: Worker) => void;
  removeWorker: (workerId: number) => void;
}

//Zustand Store with Persistence
export const useWorkerStore = create<WorkerStore>()(
  persist(
    (set) => ({
      workers: [],

      // Fetch Workers
      fetchWorkers: async () => {
        try {
          const token = await SecureStore.getItemAsync("AccessToken");
          const response = await apiHandler.get("/worker", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            set({ workers: response.data.workers });
          }
        } catch (error) {
          console.error("Failed to fetch workers:", error);
        }
      },

      // Add Worker to State
      addWorker: (newWorker) => {
        set((state) => ({ workers: [newWorker, ...state.workers] }));
      },
      
      // Remove Worker from State
      removeWorker: (workerId) => {
        set((state) => ({
          workers: state.workers.filter(worker => worker.id !== workerId)
        }));
      },
    }),
    { name: "worker-storage" }
  )
);