import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://e6d4-202-51-86-227.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export const socketURL = "https://e6d4-202-51-86-227.ngrok-free.app";

export default apiHandler;