import apiHandler from "./ApiHandler";

export const user_login = async (email: string, password: string) => {
  try {
    console.log("user_login", email, password);
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

export const signUp_user =async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const response = await apiHandler.post("/user/signUp", {
        name,
        email,
        password,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return {
          status: 400,
          message: "Register failed."
        };
    }
  }
  