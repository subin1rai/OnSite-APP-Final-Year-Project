import React, { createContext, useContext, useState, useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

interface BottomSheetContextProps {
  openBottomSheet: () => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openBottomSheet = () => {
    setIsOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  return (
    <BottomSheetContext.Provider value={{ openBottomSheet, bottomSheetRef }}>
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};
