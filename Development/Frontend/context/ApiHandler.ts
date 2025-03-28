import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://e3c4-2400-1a00-bd11-f461-a932-7cee-1ffc-afe9.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;