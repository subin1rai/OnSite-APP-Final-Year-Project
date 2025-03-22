import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://a380-2400-1a00-bd11-fde-a111-5ec9-94bc-ef3c.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;