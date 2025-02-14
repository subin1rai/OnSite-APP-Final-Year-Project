import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://21b4-2400-1a00-bd11-5cd8-fd5a-f4f2-9e56-c82.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler; 