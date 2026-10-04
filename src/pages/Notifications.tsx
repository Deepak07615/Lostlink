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
    setLoading(true);
    setMessage("");

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

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "calc(100vh - 72px)",
          background: "#f5f8fc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "42px 55px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(35, 55, 90, 0.06)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "4px solid #dbeafe",
              borderTopColor: "#1677ff",
              borderRadius: "50%",
              margin: "0 auto 18px",
              boxSizing: "border-box",
            }}
          />

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "19px",
            }}
          >
            Loading notifications...
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            Please wait while we load your latest updates.
          </p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "10px 0 40px",
        boxSizing: "border-box",
      }}
    >
      {/* =========================
          HEADER
          ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#1677ff",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            UPDATES
          </div>

          <h1
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "34px",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Notifications
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#667085",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Stay updated about matches and contact requests.
          </p>
        </div>

        {/* COUNT */}
        <div
          style={{
            minWidth: "125px",
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "14px",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 5px 18px rgba(35, 55, 90, 0.04)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              color: "#1677ff",
              fontSize: "24px",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {unreadCount}
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#718096",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Unread
          </div>
        </div>
      </div>

      {/* =========================
          ERROR
          ========================= */}

      {message && (
        <div
          style={{
            background: "#fff1f1",
            border: "1px solid #ffd6d6",
            borderRadius: "14px",
            padding: "16px 18px",
            marginBottom: "20px",
            color: "#c43232",
            fontSize: "14px",
          }}
        >
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Unable to load notifications
          </strong>

          {message}
        </div>
      )}

      {/* =========================
          EMPTY STATE
          ========================= */}

      {!message && notifications.length === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "65px 30px",
            textAlign: "center",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "16px",
              background: "#eaf3ff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 18px",
              fontSize: "27px",
            }}
          >
            🔔
          </div>

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "21px",
            }}
          >
            No notifications yet
          </h2>

          <p
            style={{
              margin: "9px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            New matches and contact requests will appear here.
          </p>
        </div>
      )}

      {/* =========================
          NOTIFICATION LIST
          ========================= */}

      {!message && notifications.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: notification.is_read ? "#ffffff" : "#f4f8ff",
                border: notification.is_read
                  ? "1px solid #e1e7f0"
                  : "1px solid #cfe0ff",
                borderRadius: "18px",
                padding: "22px",
                boxShadow: notification.is_read
                  ? "0 5px 18px rgba(35, 55, 90, 0.04)"
                  : "0 7px 22px rgba(22, 119, 255, 0.08)",
                boxSizing: "border-box",
                transition: "0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "15px",
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "13px",
                    background: notification.is_read
                      ? "#f1f5f9"
                      : "#eaf3ff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  🔔
                </div>

                {/* CONTENT */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "7px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: "#172033",
                        fontSize: "17px",
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.title}
                    </h2>

                    {!notification.is_read && (
                      <span
                        style={{
                          background: "#1677ff",
                          color: "#ffffff",
                          padding: "5px 9px",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "#475467",
                      fontSize: "14px",
                      lineHeight: 1.65,
                    }}
                  >
                    {notification.message}
                  </p>

                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;