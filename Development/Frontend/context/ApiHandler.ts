import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://f0d3-2001-df7-be80-369c-28a7-a9f8-5391-b96f.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;