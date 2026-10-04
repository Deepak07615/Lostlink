import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Match = {
  id: string;
  lost_report_id: string;
  found_report_id: string;
  match_score: number;
  match_reason: string;
};

type Report = {
  id: string;
  report_type: "lost" | "found";
  item_name: string;
  category: string;
  description: string;
  location: string;
  event_time: string;
};

function Matches() {
  const [matches, setMatches] = useState<
    { match: Match; otherReport: Report; role: "Owner" | "Finder" }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to view your matches.");
      setLoading(false);
      return;
    }

    const { data: myReports, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id);

    if (reportError) {
      setMessage(reportError.message);
      setLoading(false);
      return;
    }

    if (!myReports || myReports.length === 0) {
      setMessage("You don't have any reports yet.");
      setLoading(false);
      return;
    }

    const lostIds = myReports
      .filter((report) => report.report_type === "lost")
      .map((report) => report.id);

    const foundIds = myReports
      .filter((report) => report.report_type === "found")
      .map((report) => report.id);

    let allMatches: Match[] = [];

    if (lostIds.length > 0) {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .in("lost_report_id", lostIds);

      if (data) allMatches = [...allMatches, ...data];
    }

    if (foundIds.length > 0) {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .in("found_report_id", foundIds);

      if (data) allMatches = [...allMatches, ...data];
    }

    const uniqueMatches = Array.from(
      new Map(allMatches.map((match) => [match.id, match])).values()
    );

    const results: {
  match: Match;
  otherReport: Report;
  role: "Owner" | "Finder";
}[] = [];

    for (const match of uniqueMatches) {
      const isOwner = lostIds.includes(match.lost_report_id);

      const otherReportId = isOwner
        ? match.found_report_id
        : match.lost_report_id;

      const { data: otherReport } = await supabase
        .from("reports")
        .select("*")
        .eq("id", otherReportId)
        .single();

      if (otherReport) {
        results.push({
          match,
          otherReport,
          role: isOwner ? "Owner" : "Finder",
        });
      }
    }

    setMatches(results);
    setLoading(false);
  }

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading matches...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Potential Matches</h1>

      <p>
        LostLink compares reports and shows possible matches between lost and
        found items.
      </p>

      {message && <p>{message}</p>}

      {matches.length === 0 && !message && (
        <p>No potential matches found yet.</p>
      )}

      {matches.map(({ match, otherReport, role }) => (
        <div
          key={match.id}
          style={{
            marginTop: "20px",
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "16px",
          }}
        >
          <h2>
            {match.match_score}% Potential Match
          </h2>

          <p>
            <strong>You are:</strong> {role}
          </p>

          <h3>{otherReport.item_name}</h3>

          <p>
            <strong>Category:</strong> {otherReport.category}
          </p>

          <p>
            <strong>Description:</strong> {otherReport.description}
          </p>

          <p>
            <strong>Location:</strong> {otherReport.location}
          </p>

          <p>
            <strong>Reason:</strong> {match.match_reason}
          </p>

         <Link to={`/match/${match.id}`}>
  <button>Review Match</button>
</Link>
        </div>
      ))}
    </div>
  );
}

export default Matches;






























