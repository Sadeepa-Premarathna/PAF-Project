import axios from "axios";
import { authStore } from "../store/authStore";

const apiClient = axios.create({
  baseURL: (() => {
    const envBase = (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
                    import.meta.env.VITE_API_BASE_URL ||
                    "http://localhost:8081";
    
    // Ensure the base URL ends with /api/v1
    const base = envBase.endsWith("/") ? envBase.slice(0, -1) : envBase;
    return `${base}/api/v1`;
  })(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getResources = async (filters = {}) => {
  const response = await apiClient.get("/resources", { params: filters });
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await apiClient.get(`/resources/${id}`);
  return response.data;
};

export const createResource = async (payload) => {
  const response = await apiClient.post("/resources", payload);
  return response.data;
};

export const updateResource = async (id, payload) => {
  const response = await apiClient.put(`/resources/${id}`, payload);
  return response.data;
};

export const deleteResource = async (id) => {
  await apiClient.delete(`/resources/${id}`);
};
