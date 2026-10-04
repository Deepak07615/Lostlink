import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ContactRequest = {
  id: string;
  match_id: string;
  requester_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

type Report = {
  item_name: string;
  description: string;
  location: string;
};

type RequestDisplay = {
  request: ContactRequest;
  lostReport: Report;
  foundReport: Report;
};

function ContactRequests() {
  const [requests, setRequests] = useState<RequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in.");
      setLoading(false);
      return;
    }

    const { data: requestData, error } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const results: RequestDisplay[] = [];

    for (const request of requestData ?? []) {
      const { data: match } = await supabase
        .from("matches")
        .select("lost_report_id, found_report_id")
        .eq("id", request.match_id)
        .single();

      if (!match) continue;

      const { data: lostReport } = await supabase
        .from("reports")
        .select("item_name, description, location")
        .eq("id", match.lost_report_id)
        .single();

      const { data: foundReport } = await supabase
        .from("reports")
        .select("item_name, description, location")
        .eq("id", match.found_report_id)
        .single();

      if (lostReport && foundReport) {
        results.push({
          request,
          lostReport,
          foundReport,
        });
      }
    }

    setRequests(results);
    setLoading(false);
  }

  async function respondToRequest(
    requestId: string,
    status: "accepted" | "rejected"
  ) {
    const { error } = await supabase
      .from("contact_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      status === "accepted"
        ? "✅ Contact request accepted."
        : "❌ Contact request rejected."
    );

    await loadRequests();
  }

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading requests...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Contact Requests</h1>

      <p>Review requests from owners of matched items.</p>

      {message && <p>{message}</p>}

      {requests.length === 0 && (
        <p>No contact requests yet.</p>
      )}

      {requests.map(({ request, lostReport, foundReport }) => (
        <div
          key={request.id}
          style={{
            marginTop: "20px",
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "16px",
          }}
        >
          <h2>🔔 Owner Contact Request</h2>

          <p>
            <strong>Lost Item:</strong> {lostReport.item_name}
          </p>

          <p>
            <strong>Found Item:</strong> {foundReport.item_name}
          </p>

          <p>
            <strong>Details:</strong> {foundReport.description}
          </p>

          <p>
            <strong>Location:</strong> {foundReport.location}
          </p>

          <p>
            <strong>Status:</strong> {request.status}
          </p>

          {request.status === "pending" && (
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() =>
                  respondToRequest(request.id, "accepted")
                }
              >
                Accept
              </button>

              <button
                onClick={() =>
                  respondToRequest(request.id, "rejected")
                }
                style={{ marginLeft: "10px" }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ContactRequests;