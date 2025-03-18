import axios from "axios";

const apiHandler = axios.create({
  baseURL: "https://onsite-app-final-year-project-production.up.railway.app/api",
  responseType: "json",
  withCredentials: true,
});

export default apiHandler;