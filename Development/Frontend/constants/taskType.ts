export interface TaskType {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt?: string;
  }
  
  export interface ProjectType {
    id: number;
    projectName: string;
    location?: string;
    startDate?: string;
    ownerName?: string;
    siteCode?: string;
    size?: string;
    notes?: string;
    managerName?: string;
  }
  