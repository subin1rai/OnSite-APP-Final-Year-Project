import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://c93b-2400-1a00-bd11-b97a-99a4-af6e-7300-7eb4.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;