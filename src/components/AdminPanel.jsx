import { useEffect, useState } from "react";
import { getAll, updateStatus } from "../services/bookingService";

export default function AdminPanel({ showToast }) {
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");

  const load = () => getAll().then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = data
    .filter((b) => filterStatus === "ALL" || b.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const total = data.length;
  const pending = data.filter((b) => b.status === "PENDING").length;
  const approved = data.filter((b) => b.status === "APPROVED").length;
  const rejected = data.filter((b) => b.status === "REJECTED").length;

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
      showToast(
        `Booking ${status.toLowerCase()} successfully!`,
        status === "APPROVED" ? "success" : "error"
      );
      load();
    } catch (e) {
      const msg = e?.response?.data || e?.message || "Failed to update status!";
      showToast(msg, "error");
    }
  };

  return (
    <div>
      <div className="summary-cards">
        <div className="summary-card pending-card">
          <div className="summary-num">{pending}</div>
          <div className="summary-lbl">Pending</div>
        </div>
        <div className="summary-card approved-card">
          <div className="summary-num">{approved}</div>
          <div className="summary-lbl">Approved</div>
        </div>
        <div className="summary-card rejected-card">
          <div className="summary-num">{rejected}</div>
          <div className="summary-lbl">Rejected</div>
        </div>
        <div className="summary-card total-card">
          <div className="summary-num">{total}</div>
          <div className="summary-lbl">Total</div>
        </div>
      </div>

      <div className="card">
        <h3>All Bookings</h3>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Filter by status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="empty-msg">No bookings found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
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
                    {b.status === "PENDING" && (
                      <div className="action-btns">
                        <button className="btn success" onClick={() => handleStatus(b.id, "APPROVED")}>
                          Approve
                        </button>
                        <button className="btn danger" onClick={() => handleStatus(b.id, "REJECTED")}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}