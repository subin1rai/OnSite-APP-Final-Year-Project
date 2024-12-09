import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://4c53-2400-1a00-bd11-ab5d-d8b0-f524-9ef4-83af.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;
