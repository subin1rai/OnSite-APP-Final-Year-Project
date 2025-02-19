import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://47be-2400-1a00-bd11-80f1-7891-a8ad-c8c8-2116.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;