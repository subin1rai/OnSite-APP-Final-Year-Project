import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://4578-2400-1a00-bd11-812-e9e4-e12a-dda8-bfe5.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;
