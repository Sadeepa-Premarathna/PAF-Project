import { useState, useCallback } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [page, setPage] = useState("user");
  const [toasts, setToasts] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const triggerRefresh = () => setRefresh((r) => r + 1);

  return (
    <div className="app">
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{t.type === "success" ? "✓" : "✕"}</span>
            {t.message}
          </div>
        ))}
      </div>

      <Sidebar setPage={setPage} currentPage={page} />

      <div className="main">
        {page === "user" && (
          <>
            <BookingForm onBookingCreated={triggerRefresh} showToast={showToast} />
            <BookingList refresh={refresh} showToast={showToast} />
          </>
        )}
        {page === "admin" && <AdminPanel showToast={showToast} />}
      </div>
    </div>
  );
}

export default App;