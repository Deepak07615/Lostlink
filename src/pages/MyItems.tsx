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
    return <div style={{ padding: "40px" }}>Loading your items...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>My Items</h1>
      <p>All your LostLink reports in one place.</p>

      {message && <p>❌ {message}</p>}

      {!message && reports.length === 0 && (
        <p>You haven't reported any items yet.</p>
      )}

      <div style={{ display: "grid", gap: "20px", marginTop: "25px" }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2>
              {report.report_type === "lost" ? "🔴 Lost" : "🟢 Found"} —{" "}
              {report.item_name}
            </h2>

            <p>
              <strong>Category:</strong> {report.category}
            </p>

            <p>
              <strong>Description:</strong> {report.description}
            </p>

            <p>
              <strong>Location:</strong> {report.location}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(report.event_time).toLocaleString()}
            </p>

            <p>
              <strong>Status:</strong> {report.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyItems;