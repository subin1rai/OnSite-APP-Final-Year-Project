import apiHandler from "./ApiHandler";
import * as SecureStore from "expo-secure-store";

export const all_project = async () => {
  try {
    const token = await SecureStore.getItemAsync("AccessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", 
    };
    // Make the API call with headers
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
    console.log("Project Data:", projectName, startDate,endDate, ownerName, budgetAmount, location);

    const token = await SecureStore.getItemAsync("AccessToken");
    const response = await apiHandler.post(
      "/project/create",
      {
        project_name: projectName,
        owner_name: ownerName,
        budget_amount: budgetAmount,
        location: location,
        startDate: startDate,
        endDate: endDate
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    console.log("Project Created Successfully:", response);
    return response.data;
  } catch (error: any) {
    console.error("Error Creating Project:", error.message);
    throw error;
  }
};



