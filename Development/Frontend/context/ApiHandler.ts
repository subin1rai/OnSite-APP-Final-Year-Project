import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://1976-2400-1a00-bd11-f461-6c96-8aec-33a8-a942.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;