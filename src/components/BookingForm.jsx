import { useState } from "react";
import { create } from "../services/bookingService";

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

export default function BookingForm({ onBookingCreated, showToast }) {
  const [data, setData] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleSubmit = async () => {
    if (!data.resourceId) return showToast("Please select a resource!", "error");
    if (!data.date) return showToast("Please select a date!", "error");
    if (!data.startTime || !data.endTime)
      return showToast("Please select start and end time!", "error");
    if (data.startTime >= data.endTime)
      return showToast("Start time must be before end time!", "error");
    if (!data.purpose.trim())
      return showToast("Please enter a purpose!", "error");

    setLoading(true);
    try {
      await create(data);
      showToast("Booking created successfully!", "success");
      setData({ resourceId: "", date: "", startTime: "", endTime: "", purpose: "" });
      if (onBookingCreated) onBookingCreated();
    } catch (e) {
      const msg = e?.response?.data || e?.message || "Failed to create booking!";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Create Booking</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Resource</label>
          <select
            value={data.resourceId}
            onChange={(e) => setData({ ...data, resourceId: e.target.value })}
          >
            <option value="">Select a resource</option>
            {RESOURCES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date (within 7 days)</label>
          <input
            type="date"
            value={data.date}
            min={today}
            max={maxDate}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => setData({ ...data, startTime: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => setData({ ...data, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Purpose</label>
        <input
          type="text"
          placeholder="Enter purpose of booking"
          value={data.purpose}
          onChange={(e) => setData({ ...data, purpose: e.target.value })}
        />
      </div>

      <button className="btn primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Booking"}
      </button>
    </div>
  );
}