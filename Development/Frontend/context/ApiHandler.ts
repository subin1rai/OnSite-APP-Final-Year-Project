import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://929c-2400-1a00-bd11-ab5d-a5ee-fef9-85d-4f4a.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;
