import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to view notifications.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setNotifications(data ?? []);
    }

    setLoading(false);
  }

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading notifications...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Notifications</h1>

      {message && <p>❌ {message}</p>}

      {!message && notifications.length === 0 && (
        <p>No notifications yet.</p>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            marginTop: "16px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "14px",
            background: notification.is_read ? "#fff" : "#f1f5ff",
          }}
        >
          <h3>🔔 {notification.title}</h3>

          <p>{notification.message}</p>

          <small>
            {new Date(notification.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}

export default Notifications;