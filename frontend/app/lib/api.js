import axios from "axios";

// Relative '/api' works since Nginx proxies /api to the backend container
const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT (if present) to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
