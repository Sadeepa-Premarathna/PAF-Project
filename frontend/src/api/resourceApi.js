import axios from "axios";

const apiClient = axios.create({
  baseURL:
    (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8082/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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
