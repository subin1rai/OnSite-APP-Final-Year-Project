import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://dcc5-2400-1a00-bd11-a414-d05d-1d5-323c-a92d.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;