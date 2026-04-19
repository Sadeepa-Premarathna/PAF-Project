export default function Sidebar({ setPage, currentPage }) {
  return (
    <div className="sidebar">
      <h2>Smart Campus</h2>
      <button
        className={currentPage === "user" ? "active" : ""}
        onClick={() => setPage("user")}
      >
        My Bookings
      </button>
      <button
        className={currentPage === "admin" ? "active" : ""}
        onClick={() => setPage("admin")}
      >
        Admin Panel
      </button>
    </div>
  );
}