import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Report = {
  id: string;
  report_type: "lost" | "found";
  item_name: string;
  category: string;
  description: string;
  location: string;
  event_time: string;
  status: string;
};

function MyItems() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to view your items.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setReports(data ?? []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="my-items-page">
        <div className="my-items-loading">
          Loading your items...
        </div>
      </div>
    );
  }

  return (
    <div className="my-items-page">
      <div className="my-items-header">
        <div>
          <div className="my-items-eyebrow">YOUR REPORTS</div>
          <h1>My Items</h1>
          <p>All your LostLink reports in one place.</p>
        </div>

        <div className="my-items-count">
          <strong>{reports.length}</strong>
          <span>Total Reports</span>
        </div>
      </div>

      {message && (
        <div className="my-items-error">
          ❌ {message}
        </div>
      )}

      {!message && reports.length === 0 && (
        <div className="my-items-empty">
          <div className="my-items-empty-icon">📦</div>
          <h2>No reports yet</h2>
          <p>You haven't reported any lost or found items yet.</p>
        </div>
      )}

      {!message && reports.length > 0 && (
        <div className="my-items-grid">
          {reports.map((report) => {
            const isLost = report.report_type === "lost";

            return (
              <div className="my-item-card" key={report.id}>
                <div className="my-item-card-top">
                  <span
                    className={
                      isLost
                        ? "item-type-badge lost"
                        : "item-type-badge found"
                    }
                  >
                    {isLost ? "● Lost Item" : "● Found Item"}
                  </span>

                  <span className="item-status-badge">
                    {report.status}
                  </span>
                </div>

                <h2>{report.item_name}</h2>

                <div className="my-item-category">
                  {report.category}
                </div>

                <p className="my-item-description">
                  {report.description}
                </p>

                <div className="my-item-details">
                  <div className="my-item-detail">
                    <span className="detail-icon">📍</span>
                    <div>
                      <small>Location</small>
                      <strong>{report.location}</strong>
                    </div>
                  </div>

                  <div className="my-item-detail">
                    <span className="detail-icon">📅</span>
                    <div>
                      <small>Date</small>
                      <strong>
                        {new Date(report.event_time).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="my-item-card-footer">
                  <span>
                    {isLost
                      ? "Waiting for a match"
                      : "Looking for the owner"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyItems;