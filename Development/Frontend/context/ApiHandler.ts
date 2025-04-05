import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://9608-2400-1a00-bd11-97b-595c-6895-c53d-9d6b.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;