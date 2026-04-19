import { useEffect, useState } from "react";
import { getAll, update, remove } from "../services/bookingService";

const RESOURCES = [
  "Conference Room A",
  "Conference Room B",
  "Lecture Hall 1",
  "Lecture Hall 2",
  "Computer Lab 1",
  "Computer Lab 2",
  "Meeting Room 1",
  "Meeting Room 2",
  "Auditorium",
  "Project Room",
];

export default function BookingList({ refresh, showToast }) {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  const load = () =>
    getAll()
      .then(setData)
      .catch(() => showToast("Failed to load bookings!", "error"));

  useEffect(() => {
    load();
  }, [refresh]);

  // 🔥 DELETE FUNCTION (NEW)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      await remove(id);
      showToast("Booking deleted successfully!", "success");
      load();
    } catch (e) {
      showToast(e?.response?.data || "Delete failed!", "error");
    }
  };

  const openEdit = (b) => {
    setEditingId(b.id);
    setEditData({
      resourceId: b.resourceId,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editData.resourceId)
      return showToast("Select resource!", "error");
    if (!editData.date)
      return showToast("Select date!", "error");
    if (editData.startTime >= editData.endTime)
      return showToast("Invalid time range!", "error");

    setLoading(true);
    try {
      await update(editingId, editData);
      showToast("Booking updated!", "success");
      closeEdit();
      load();
    } catch (e) {
      showToast(e?.response?.data || "Update failed!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>My Bookings</h3>

      {data.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((b) => (
              <tr key={b.id}>
                <td>{b.resourceId}</td>
                <td>{b.date}</td>
                <td>{b.startTime} - {b.endTime}</td>
                <td>{b.purpose}</td>
                <td>
                  <span className={`status ${b.status?.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>

                <td>
                  {/* 🔥 EDIT */}
                  {b.status === "PENDING" && (
                    <button
                      className="btn success"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </button>
                  )}

                  {/* 🔥 DELETE */}
                  <button
                    className="btn danger"
                    onClick={() => handleDelete(b.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔥 EDIT MODAL */}
      {editingId && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Booking</h3>

            <select
              value={editData.resourceId}
              onChange={(e) =>
                setEditData({ ...editData, resourceId: e.target.value })
              }
            >
              <option value="">Select Resource</option>
              {RESOURCES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />

            <input
              type="time"
              value={editData.startTime}
              onChange={(e) =>
                setEditData({ ...editData, startTime: e.target.value })
              }
            />

            <input
              type="time"
              value={editData.endTime}
              onChange={(e) =>
                setEditData({ ...editData, endTime: e.target.value })
              }
            />

            <input
              type="text"
              value={editData.purpose}
              onChange={(e) =>
                setEditData({ ...editData, purpose: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn danger" onClick={closeEdit}>
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={saveEdit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}