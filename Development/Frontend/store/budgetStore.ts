// @/store/useBudgetStore.ts
import { create } from "zustand";

export type BudgetType = {
  ownerName: string;
  projectName: string;
  budgets: {
    id: number;
    amount: number;
    inHand: number | null;
    type: string | null;
    createdAt: string;
    updatedAt: string;
    projectId: number;
  }[];
};

interface BudgetStore {
  budget: BudgetType | null;
  setBudget: (budget: BudgetType) => void;
  clearBudget: () => void;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budget: null,
  setBudget: (budget) => set({ budget }),
  clearBudget: () => set({ budget: null }),
}));
