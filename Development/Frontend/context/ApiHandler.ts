import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://6168-2400-1a00-bd11-a92b-e8ac-ae98-1927-4d6.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});
export default apiHandler;