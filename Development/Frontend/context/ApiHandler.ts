import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://a129-2400-1a00-bd11-4830-50fb-2af9-33-e1cb.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;