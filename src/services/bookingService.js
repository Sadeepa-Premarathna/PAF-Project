import axios from "axios";

const API = "http://localhost:8080/api/bookings";

// ✅ CREATE BOOKING
export const create = (data) => axios.post(API, data);

// ✅ GET ALL BOOKINGS
export const getAll = () =>
  axios.get(API).then((res) => res.data);

// ✅ UPDATE STATUS (APPROVE / REJECT / PENDING)
export const updateStatus = (id, status) =>
  axios.put(`${API}/${id}?status=${status}`).then((res) => res.data);

// ✅ EDIT BOOKING
export const update = (id, data) =>
  axios.put(`${API}/${id}/edit`, data).then((res) => res.data);

// 🔥 NEW: DELETE BOOKING (ADD THIS)
export const remove = (id) =>
  axios.delete(`${API}/${id}`).then((res) => res.data);