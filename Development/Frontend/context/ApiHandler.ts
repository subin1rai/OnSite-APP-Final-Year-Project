import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://76d8-2400-1a00-bd11-9991-3116-30f9-80b7-776e.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;
