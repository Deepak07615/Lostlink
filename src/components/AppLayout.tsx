import { Link, Outlet, useLocation } from "react-router-dom";

function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "⌂" },
    { path: "/report-lost", label: "Report Lost", icon: "📍" },
    { path: "/report-found", label: "Report Found", icon: "🔎" },
    { path: "/my-items", label: "My Items", icon: "📦" },
    { path: "/matches", label: "Matches", icon: "✨" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
    { path: "/contact-requests", label: "Contact Requests", icon: "🤝" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">L</div>
          <span>LostLink</span>
        </div>

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
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/chat" className="nav-item">
            <span>💬</span>
            <span>Chat</span>
          </Link>

          <Link to="/profile" className="nav-item">
            <span>👤</span>
            <span>Profile</span>
          </Link>

          <button className="logout-button">
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search lost or found items..."
            />
          </div>

          <div className="topbar-right">
            <button className="notification-button">
              🔔
            </button>

            <div className="user-info">
             <div className="avatar">U</div>
              <span>Account</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;