import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://21b5-2001-df7-be80-3a7a-fc8b-13b0-a5f6-94d6.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;