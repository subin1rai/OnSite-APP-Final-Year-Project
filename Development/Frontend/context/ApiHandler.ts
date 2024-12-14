import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://5958-2400-1a00-bd11-f810-458-c213-66f9-5eb7.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;
