import axios from "axios";

const apiHandler = axios.create({
  baseURL:"https://f660-2400-1a00-bd11-1ed3-21c5-bc3f-ca20-9afd.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});
export default apiHandler;