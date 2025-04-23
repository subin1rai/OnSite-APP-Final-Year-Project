import axios from "axios";

const apiHandler = axios.create({
  baseURL:"https://9fe4-2001-df7-be80-2362-3112-21b5-fce-14c1.ngrok-free.app/api",
  responseType: "json",
  withCredentials: true,
});
export default apiHandler;