import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    loadUser();
  }, []);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          padding: "80px 20px",
          color: "#718096",
        }}
      >
        Loading account...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            color: "#1677ff",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            marginBottom: "8px",
          }}
        >
          ACCOUNT
        </div>

        <h1
          style={{
            margin: "0 0 7px",
            color: "#172033",
            fontSize: "30px",
            lineHeight: 1.2,
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            margin: 0,
            color: "#718096",
            fontSize: "14px",
          }}
        >
          Manage your LostLink account information.
        </p>
      </div>

      {/* PROFILE CARD */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e3e8f0",
          borderRadius: "18px",
          padding: "28px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "22px",
          boxShadow: "0 8px 25px rgba(36, 55, 90, 0.05)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #5267ff, #7b61ff)",
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: "0 10px 25px rgba(82, 103, 255, 0.22)",
          }}
        >
          {initial}
        </div>

        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: "0 0 7px",
              color: "#172033",
              fontSize: "22px",
            }}
          >
            {userName}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#718096",
              fontSize: "14px",
              wordBreak: "break-word",
            }}
          >
            {user?.email || "No email available"}
          </p>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e3e8f0",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(36, 55, 90, 0.04)",
        }}
      >
        <div
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "17px",
            }}
          >
            Account Information
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#8a94a6",
              fontSize: "12px",
            }}
          >
            Your current LostLink account details.
          </p>
        </div>

        {/* NAME */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "20px 24px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background: "#eaf3ff",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            👤
          </div>

          <div>
            <div
              style={{
                color: "#8a94a6",
                fontSize: "11px",
                marginBottom: "4px",
              }}
            >
              FULL NAME
            </div>

            <strong
              style={{
                color: "#344054",
                fontSize: "14px",
              }}
            >
              {userName}
            </strong>
          </div>
        </div>

        {/* EMAIL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "20px 24px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background: "#eaf3ff",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            ✉️
          </div>

          <div>
            <div
              style={{
                color: "#8a94a6",
                fontSize: "11px",
                marginBottom: "4px",
              }}
            >
              EMAIL
            </div>

            <strong
              style={{
                color: "#344054",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              {user?.email || "No email available"}
            </strong>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              background: "#ecfdf5",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            ✓
          </div>

          <div>
            <div
              style={{
                color: "#8a94a6",
                fontSize: "11px",
                marginBottom: "4px",
              }}
            >
              ACCOUNT STATUS
            </div>

            <strong
              style={{
                color: "#15803d",
                fontSize: "14px",
              }}
            >
              Active
            </strong>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT */}
<div
  style={{
    marginTop: "22px",
    background: "#ffffff",
    border: "1px solid #f3d0d0",
    borderRadius: "18px",
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  }}
>
  <div>
    <h3
      style={{
        margin: "0 0 5px",
        color: "#172033",
        fontSize: "16px",
      }}
    >
      Delete Account
    </h3>

    <p
      style={{
        margin: 0,
        color: "#8a94a6",
        fontSize: "12px",
      }}
    >
      Permanently delete your LostLink account and account data.
    </p>
  </div>

  <button
    type="button"
    style={{
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      background: "#fff1f1",
      color: "#e5484d",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    Delete Account
  </button>
        <div>
          <h3
            style={{
              margin: "0 0 5px",
              color: "#172033",
              fontSize: "16px",
            }}
          >
            Sign out of LostLink
          </h3>

          <p
            style={{
              margin: 0,
              color: "#8a94a6",
              fontSize: "12px",
            }}
          >
            You will return to the LostLink landing page.
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "12px 18px",
            background: loggingOut ? "#f3b7b7" : "#e5484d",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loggingOut ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* MOBILE */}
      <style>
        {`
          @media (max-width: 600px) {
            .profile-page {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Profile;