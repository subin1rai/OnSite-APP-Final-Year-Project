import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://9260-2001-df7-be80-2236-e009-a3f3-f68c-6c61.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});
export default apiHandler;