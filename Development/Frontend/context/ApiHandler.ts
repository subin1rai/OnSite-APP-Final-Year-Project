import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://97b0-2400-1a00-bd11-43dd-18c7-2c8c-7d0b-9b31.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;