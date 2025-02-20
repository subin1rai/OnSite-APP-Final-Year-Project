import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://8b8e-2400-1a00-bd11-80f1-a963-dbd5-f53e-d17d.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;   