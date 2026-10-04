import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

function AppLayout() {
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const initial = userName.charAt(0).toUpperCase();

  /*
   * LOGOUT
   *
   * We use Supabase signOut and then a normal browser redirect.
   * This completely reloads the application at the public landing page.
   */
  const handleLogout = async () => {
    console.log("LOGOUT BUTTON CLICKED");

    try {
      console.log("Starting Supabase logout...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase logout error:", error);

        alert("Logout failed: " + error.message);

        return;
      }

      console.log("Supabase logout successful");

      setUser(null);

      /*
       * Force a fresh application load.
       * This sends the user to the public landing page.
       */
      window.location.replace("/");
    } catch (error) {
      console.error("Logout exception:", error);

      alert("Logout failed. Please try again.");
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Home",
      icon: "⌂",
    },
    {
      path: "/report-lost",
      label: "Report Lost",
      icon: "📍",
    },
    {
      path: "/report-found",
      label: "Report Found",
      icon: "🔎",
    },
    {
      path: "/my-items",
      label: "My Items",
      icon: "📦",
    },
    {
      path: "/matches",
      label: "Matches",
      icon: "✨",
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: "🔔",
    },
    {
      path: "/contact-requests",
      label: "Contact Requests",
      icon: "🤝",
    },
  ];

  return (
    <div className="app-layout">

      {/* =========================
          SIDEBAR
          ========================= */}

      <aside className="sidebar">

        {/* LOGO */}
        <Link
          to="/dashboard"
          className="logo"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="logo-icon">
            L
          </div>

          <span>
            LostLink
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <span>
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </Link>
          ))}

          {/* CHAT */}
          <Link
            to="/chat"
            className={
              location.pathname.startsWith("/chat")
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span>💬</span>
            <span>Chat</span>
          </Link>

          {/* PROFILE */}
          <Link
            to="/profile"
            className={
              location.pathname === "/profile"
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span>👤</span>
            <span>Profile</span>
          </Link>

        </nav>

        {/* =========================
            LOGOUT
            ========================= */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN AREA
          ========================= */}

      <div className="main-area">

        {/* TOP BAR */}
        <header className="topbar">

          {/* SEARCH */}
          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search lost or found items..."
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="topbar-right">

            {/* NOTIFICATIONS */}
            <Link
              to="/notifications"
              className="notification-button"
              aria-label="Notifications"
            >
              🔔
            </Link>

            {/* USER PROFILE */}
            <Link
              to="/profile"
              className="user-info"
              style={{
                textDecoration: "none",
              }}
            >
              <div className="avatar">
                {initial}
              </div>

              <span>
                {userName}
              </span>
            </Link>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AppLayout;