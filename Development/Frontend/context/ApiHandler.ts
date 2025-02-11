import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://f019-2400-1a00-bd11-7de0-481a-cf49-b2eb-fa53.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler; 