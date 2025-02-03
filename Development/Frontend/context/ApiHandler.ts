import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://bfbe-2400-1a00-bd11-4b6a-747f-b0a1-ac51-c60a.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;