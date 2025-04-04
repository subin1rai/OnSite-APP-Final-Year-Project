import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://da95-2400-1a00-bd11-97b-10de-dd4b-b194-5253.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;