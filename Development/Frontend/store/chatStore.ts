import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatStore {
  selectedChat: User | null;
  setSelectedChat: (user: User) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  selectedChat: null,
  setSelectedChat: (user) => set({ selectedChat: user }),
}));

export default useChatStore;
