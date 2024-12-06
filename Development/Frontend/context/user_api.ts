import apiHandler from "./ApiHandler";

export const user_login = async (email: string, password: string) => {
  try {
    const response = await apiHandler.post("/login", {
      email,
      password
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
