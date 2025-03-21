import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://03c6-2400-1a00-bd11-7321-8564-a86c-6451-58d9.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;