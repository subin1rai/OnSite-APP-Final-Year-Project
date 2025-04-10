import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://9f95-2400-1a00-bd11-6b10-70db-45f0-369-ea29.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;