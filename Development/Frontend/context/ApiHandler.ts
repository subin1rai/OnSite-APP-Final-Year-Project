import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://e072-202-51-86-227.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;