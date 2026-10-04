import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading LostLink...
      </div>
    );
  }

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  if (!user) {
    return (
      <div className="dashboard-login">
        <h1>Welcome to LostLink</h1>
        <p>
          Please log in to manage your lost and found items.
        </p>

        <Link to="/login">
          <button className="dashboard-primary-btn">
            Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {userName}! 👋</h1>

          <p>
            Let's help bring lost items back to their owners.
          </p>
        </div>

        <Link to="/report-lost">
          <button className="dashboard-report-btn">
            + Report Lost Item
          </button>
        </Link>
      </div>

      {/* STAT CARDS */}

      <div className="dashboard-stats">

        <Link to="/my-items" className="stat-card">
          <div className="stat-card-top">
            <span>My Lost Items</span>
            <div className="stat-icon blue">📦</div>
          </div>

          <strong>View</strong>

          <span className="stat-link">
            View all →
          </span>
        </Link>

        <Link to="/my-items" className="stat-card">
          <div className="stat-card-top">
            <span>My Found Items</span>
            <div className="stat-icon green">🔎</div>
          </div>

          <strong>View</strong>

          <span className="stat-link">
            View all →
          </span>
        </Link>

        <Link to="/matches" className="stat-card">
          <div className="stat-card-top">
            <span>Potential Matches</span>
            <div className="stat-icon purple">✨</div>
          </div>

          <strong>Check</strong>

          <span className="stat-link">
            Check now →
          </span>
        </Link>

        <Link to="/notifications" className="stat-card">
          <div className="stat-card-top">
            <span>Notifications</span>
            <div className="stat-icon red">🔔</div>
          </div>

          <strong>View</strong>

          <span className="stat-link">
            View all →
          </span>
        </Link>

      </div>

      {/* LOWER SECTION */}

      <div className="dashboard-grid">

        {/* RECENT ACTIVITY */}

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest LostLink activity</p>
            </div>

            <Link to="/notifications">
              View all
            </Link>
          </div>

          <div className="activity-list">

            <Link
              to="/matches"
              className="activity-item"
            >
              <div className="activity-icon blue">
                🔔
              </div>

              <div>
                <strong>
                  Check your potential matches
                </strong>

                <span>
                  View possible matches for your items
                </span>
              </div>

              <span className="activity-arrow">
                →
              </span>
            </Link>

            <Link
              to="/contact-requests"
              className="activity-item"
            >
              <div className="activity-icon green">
                🤝
              </div>

              <div>
                <strong>
                  Contact requests
                </strong>

                <span>
                  Review requests from matched users
                </span>
              </div>

              <span className="activity-arrow">
                →
              </span>
            </Link>

            <Link
              to="/notifications"
              className="activity-item"
            >
              <div className="activity-icon purple">
                🔔
              </div>

              <div>
                <strong>
                  Notifications
                </strong>

                <span>
                  Check your latest updates
                </span>
              </div>

              <span className="activity-arrow">
                →
              </span>
            </Link>

          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="dashboard-panel quick-actions">

          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Get started quickly</p>
            </div>
          </div>

          <Link
            to="/report-lost"
            className="quick-action primary"
          >
            <span>📍</span>
            Report Lost Item
          </Link>

          <Link
            to="/report-found"
            className="quick-action secondary"
          >
            <span>🔎</span>
            Report Found Item
          </Link>

          <Link
            to="/my-items"
            className="quick-action neutral"
          >
            <span>📦</span>
            View My Items
          </Link>

          <Link
            to="/matches"
            className="quick-action outline"
          >
            <span>✨</span>
            View Potential Matches
          </Link>

        </div>

      </div>

      {/* HOW IT WORKS */}

      <div className="dashboard-info">

        <div>
          <span className="info-number">01</span>

          <div>
            <strong>Report</strong>
            <p>
              Tell us what you lost or found.
            </p>
          </div>
        </div>

        <div>
          <span className="info-number">02</span>

          <div>
            <strong>Match</strong>
            <p>
              LostLink compares relevant reports.
            </p>
          </div>
        </div>

        <div>
          <span className="info-number">03</span>

          <div>
            <strong>Connect</strong>
            <p>
              Contact the other person securely.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Home;