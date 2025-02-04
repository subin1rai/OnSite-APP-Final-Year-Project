import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://d852-2400-1a00-bd11-b97a-fca1-e924-f49c-d408.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;