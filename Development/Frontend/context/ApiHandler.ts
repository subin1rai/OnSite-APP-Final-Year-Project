import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://22a1-2001-df7-be80-309b-41c6-15e9-af1d-9233.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;