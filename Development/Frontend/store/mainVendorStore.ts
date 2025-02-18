import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiHandler from "@/context/ApiHandler";
import * as SecureStore from "expo-secure-store";

// Vendor Type
interface Vendor {
  id: number;
  VendorName: string;
  address?: string;
  email?: string;
  contact?: string;
  profile?: string;
  companyName?: string;
}

// Store Type
interface VendorsStore {
  vendors: Vendor[];
  fetchVendors: () => Promise<void>;
  addVendor: (newVendor: Vendor) => void;
}

// Zustand Store with Persistence
export const useVendorsStore = create<VendorsStore>()(
  persist(
    (set) => ({
      vendors: [],

      // Fetch Vendors
      fetchVendors: async () => {
        try {
          const token = await SecureStore.getItemAsync("AccessToken");
          const response = await apiHandler.get("/vendor", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            set({ vendors: response.data.vendors });
          }
        } catch (error) {
          console.error("Failed to fetch vendors:", error);
        }
      },

      // Add Vendor to State
      addVendor: (newVendor) => {
        set((state) => ({ vendors: [newVendor, ...state.vendors] }));
      },
    }),
    { name: "vendor-storage" }
  )
);
