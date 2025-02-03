import apiHandler from "./ApiHandler";
import * as SecureStore from "expo-secure-store";

export const all_project = async () => {
  try {
    const token = await SecureStore.getItemAsync("AccessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", 
    };

    const response = await apiHandler.get("/project", { headers });
      return response.data;
  } catch (error: any) {
    console.error("Error message:", error.message);
   
  }
};


export const create_project = async (
  projectName: string,
  ownerName: string,
  budgetAmount: number, 
  location: string,
  startDate: string,
  endDate: string
) => {
  try {
    const token = await SecureStore.getItemAsync("AccessToken");

    const response = await apiHandler.post(
      "/project/create",
      {
        projectName: projectName,
        ownerName: ownerName,
        budgetAmount: budgetAmount,
        location: location,
        startDate: new Date(startDate).toISOString(), 
        endDate: new Date(endDate).toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Project Created Successfully:", response, );
    return response.data;
  } catch (error: any) {
    console.error("Error Creating Project:", error);
  }
};




