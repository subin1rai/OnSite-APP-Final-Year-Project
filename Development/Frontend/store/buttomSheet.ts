import { create } from "zustand";

interface BottomSheetState {
  isBottomSheetOpen: boolean;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  isBottomSheetOpen: false,
  openBottomSheet: () => set({ isBottomSheetOpen: true }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false }),
}));
