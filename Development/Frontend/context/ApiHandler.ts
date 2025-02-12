import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://de43-2400-1a00-bd11-7de0-68a5-d6bf-ff4d-d314.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler; 