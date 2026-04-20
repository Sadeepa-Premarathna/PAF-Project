export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <h2>Smart Campus</h2>
      <button onClick={()=>setPage("user")}>Bookings</button>
      <button onClick={()=>setPage("admin")}>Admin Panel</button>
    </div>
  );
}