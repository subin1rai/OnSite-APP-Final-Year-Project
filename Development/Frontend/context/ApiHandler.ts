import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://a5de-2400-1a00-bd11-5cd8-6965-8bd-920a-21a3.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;