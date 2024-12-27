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