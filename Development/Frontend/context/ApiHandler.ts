import axios from "axios";

const apiHandler = axios.create({
  baseURL:"https://f5dd-2400-1a00-bd11-2e1f-18bd-5a0c-ac46-1a6f.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});
export default apiHandler;