import React from "react";
import { markAsRead } from "../services/notificationService";

function NotificationDropdown({ notifications, reload }) {

  const handleRead = async (id) => {
    await markAsRead(id);
    reload();
  };

  return (
    <div style={styles.dropdown}>
      <h4>Notifications</h4>

      {notifications.length === 0 && <p>No notifications</p>}

      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            ...styles.item,
            background: n.read ? "#f0f0f0" : "#fff"
          }}
        >
          <p>{n.message}</p>

          {!n.read && (
            <button onClick={() => handleRead(n.id)}>
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  dropdown: {
    position: "absolute",
    top: "40px",
    right: "0",
    width: "300px",
    background: "#fff",
    border: "1px solid #ccc",
    padding: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  item: {
    padding: "10px",
    borderBottom: "1px solid #eee"
  }
};

export default NotificationDropdown;