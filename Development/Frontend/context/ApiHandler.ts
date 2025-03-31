import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://ec42-2400-1a00-bd11-e324-51e2-e5de-8a65-6b0a.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;