// constants/ambulanceData.ts
export interface AmbulanceService {
    name: string;
    phone: string;
    district: string;
  }
  
  export const ambulanceServices: AmbulanceService[] = [
    {
      name: "Nepal Ambulance Service",
      phone: "01-4427833",
      district: "Kathmandu",
    },
    {
      name: "Ambulance Lalitpur Municipality",
      phone: "9841202641",
      district: "Lalitpur",
    },
    {
      name: "Ambulance Service Siddhartha Club",
      phone: "061530200",
      district: "Pokhara",
    },
    // ... more entries
  ];
  