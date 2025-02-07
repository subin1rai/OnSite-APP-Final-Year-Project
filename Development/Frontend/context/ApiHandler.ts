import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://6f05-2400-1a00-bd11-b97a-c5dd-353-a86e-dbe4.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;