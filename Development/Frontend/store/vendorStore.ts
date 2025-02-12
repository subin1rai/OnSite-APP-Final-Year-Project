import { create } from "zustand";

export interface Vendor {
  id: number;
  VendorName: string;
  contact: string;
}

interface VendorStore {
  selectedVendor: Vendor | null;
  setSelectedVendor: (vendor: Vendor) => void;
  clearSelectedVendor: () => void;
}

export const useVendorStore = create<VendorStore>((set) => ({
  selectedVendor: null,
  setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),
  clearSelectedVendor: () => set({ selectedVendor: null }),
}));
