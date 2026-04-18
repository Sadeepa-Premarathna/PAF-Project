import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminNotificationPage from "./pages/AdminNotificationPage";
import UserNotificationPage from "./pages/UserNotificationPage";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="layout">
      {/* Navigation Bar to move between views easily */}
      <nav className="top-nav" style={{
        padding: "1rem 2rem", 
        background: "#ffffff", 
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        gap: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: "none", 
            fontWeight: 600, 
            color: location.pathname === "/" ? "#3b82f6" : "#64748b" 
          }}>
          Admin Dashboard
        </Link>
        <Link 
          to="/notifications" 
          style={{ 
            textDecoration: "none", 
            fontWeight: 600, 
            color: location.pathname === "/notifications" ? "#3b82f6" : "#64748b" 
          }}>
          User Notifications
        </Link>
      </nav>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<AdminNotificationPage />} />
          <Route path="/notifications" element={<UserNotificationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;