import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://4bca-2400-1a00-bd11-e95a-a88a-ed53-c0fa-ed8c.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;   