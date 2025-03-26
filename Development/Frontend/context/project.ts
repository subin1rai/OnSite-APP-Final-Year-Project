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
export const single_project = async (id: string) => {
  try {
    console.log("Project Id:", id);
    const token = await SecureStore.getItemAsync("AccessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await apiHandler.post(`/singleProject?id=${id}`, {}, { headers });
    console.log("singleProject", response);
    return response.data;
  } catch (error: any) {
    console.error("Error message:", error.message);
  }
};
