const API = "http://localhost:8080/api/bookings";

export const getAll = async () => (await fetch(API)).json();

export const create = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  if(!res.ok) {
    const msg = await res.text();
    alert(msg);  // show backend validation message
    throw new Error(msg);
  }
  return res.json();
};

export const updateStatus = async (id,status) =>
  fetch(`${API}/${id}?status=${status}`, { method: "PUT" });