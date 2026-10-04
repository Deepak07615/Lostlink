import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type MatchData = {
  id: string;
  match_score: number;
  match_reason: string;
  lost_report: {
    item_name: string;
    category: string;
    description: string;
    location: string;
    user_id: string;
  };
  found_report: {
    item_name: string;
    category: string;
    description: string;
    location: string;
    user_id: string;
  };
};

function MatchReview() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [role, setRole] = useState<"Owner" | "Finder" | null>(null);
  const [message, setMessage] = useState("");
  const [contactRequest, setContactRequest] = useState<{
  id: string;
  status: "pending" | "accepted" | "rejected";
} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  async function loadMatch() {
    if (!matchId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        match_score,
        match_reason,
        lost_report:lost_report_id (
          item_name,
          category,
          description,
          location,
          user_id
        ),
        found_report:found_report_id (
          item_name,
          category,
          description,
          location,
          user_id
        )
      `)
      .eq("id", matchId)
      .single();

    if (error || !data) {
      setMessage(error?.message || "Match not found.");
      setLoading(false);
      return;
    }

    const matchData = data as unknown as MatchData;

    setMatch(matchData);
    const { data: requestData } = await supabase
  .from("contact_requests")
  .select("id, status")
  .eq("match_id", matchId)
  .maybeSingle();

setContactRequest(requestData ?? null);

    if (matchData.lost_report.user_id === user.id) {
      setRole("Owner");
    } else if (matchData.found_report.user_id === user.id) {
      setRole("Finder");
    }

    setLoading(false);
  }

  async function contactFinder() {
    if (!match || role !== "Owner") return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in.");
      return;
    }

    const { error } = await supabase
      .from("contact_requests")
      .insert({
        match_id: match.id,
        requester_id: user.id,
        recipient_id: match.found_report.user_id,
      });

    if (error) {
      if (error.code === "23505") {
        setMessage("Contact request already sent.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    setMessage("✅ Contact request sent to the finder.");
  }

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading match...</div>;
  }

  if (!match) {
    return <div style={{ padding: "40px" }}>❌ {message}</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Review Match</h1>

      <h2>{match.match_score}% Potential Match</h2>

      <p>{match.match_reason}</p>

      <hr />

      <h2>Lost Report</h2>
      <p><strong>Item:</strong> {match.lost_report.item_name}</p>
      <p><strong>Category:</strong> {match.lost_report.category}</p>
      <p><strong>Description:</strong> {match.lost_report.description}</p>
      <p><strong>Location:</strong> {match.lost_report.location}</p>

      <h2>Found Report</h2>
      <p><strong>Item:</strong> {match.found_report.item_name}</p>
      <p><strong>Category:</strong> {match.found_report.category}</p>
      <p><strong>Description:</strong> {match.found_report.description}</p>
      <p><strong>Location:</strong> {match.found_report.location}</p>

      {role === "Owner" && (
  <div style={{ marginTop: "30px" }}>
    <h3>Are you sure this is your item?</h3>

    {!contactRequest && (
      <button onClick={contactFinder}>
        Contact Finder
      </button>
    )}

    {contactRequest?.status === "pending" && (
      <p>⏳ Contact request sent. Waiting for the finder.</p>
    )}

    {contactRequest?.status === "accepted" && (
      <a href={`/chat/${contactRequest.id}`}>
        <button>💬 Open Chat</button>
      </a>
    )}

    {message && <p>{message}</p>}
  </div>
)}
     {role === "Finder" && (
  <div style={{ marginTop: "30px" }}>
    <h3>You're the Finder</h3>

    {!contactRequest && (
      <p>
        The owner must verify this match and contact you first.
      </p>
    )}

    {contactRequest?.status === "pending" && (
      <>
        <p>🔔 The owner has requested contact.</p>
        <p>Waiting for you to accept the request.</p>
      </>
    )}

    {contactRequest?.status === "accepted" && (
      <>
        <p>✅ Contact request accepted.</p>

        <a href={`/chat/${contactRequest.id}`}>
          <button>💬 Open Chat</button>
        </a>
      </>
    )}

    {contactRequest?.status === "rejected" && (
      <p>❌ Contact request was rejected.</p>
    )}

    {message && <p>{message}</p>}
  </div>
)}
    </div>
  );
}

export default MatchReview;