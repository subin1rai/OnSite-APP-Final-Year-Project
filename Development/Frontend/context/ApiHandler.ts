import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://1a0d-2400-1a00-bd11-71df-4a7-9d2f-1931-3eda.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;   