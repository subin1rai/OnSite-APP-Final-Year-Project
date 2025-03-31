import { TaskType } from '@/constants/taskType';
import { create } from 'zustand';

interface TaskStore {
  tasks: TaskType[];
  setTasks: (tasks: TaskType[]) => void;
  projectProgress: number;
  setProjectProgress: (progress: number) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => {
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const total = tasks.length || 1;
    const progress = Math.round((completed / total) * 100);
    set({ tasks, projectProgress: progress });
  },
  projectProgress: 0,
  setProjectProgress: (progress) => set({ projectProgress: progress }),
}));
