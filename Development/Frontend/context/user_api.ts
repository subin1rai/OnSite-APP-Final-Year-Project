import apiHandler from "./ApiHandler";

export const user_login = async (email: string, password: string) => {
  try {
    const response = await apiHandler.post("/user/login", {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return {
      status: 400,
      message: "Login failed."
    };
  }
};

