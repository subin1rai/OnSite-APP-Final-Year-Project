import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://f1f1-2400-1a00-bd11-9225-e138-244f-a687-316d.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;