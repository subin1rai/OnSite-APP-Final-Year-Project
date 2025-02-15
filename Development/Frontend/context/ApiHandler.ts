import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://d1bd-2400-1a00-bd11-5cd8-61a5-8846-98c2-e3f6.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;