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

      if (data) {
        allMatches = [...allMatches, ...data];
      }
    }

    if (foundIds.length > 0) {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .in("found_report_id", foundIds);

      if (data) {
        allMatches = [...allMatches, ...data];
      }
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

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f8fc",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "40px 50px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(35, 55, 90, 0.06)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "4px solid #dbeafe",
              borderTopColor: "#1677ff",
              margin: "0 auto 18px",
              boxSizing: "border-box",
            }}
          />

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "18px",
            }}
          >
            Loading matches...
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            Please wait while LostLink checks your reports.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN PAGE
     ========================= */

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "10px 0 40px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
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
          MATCH CENTER
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
          Potential Matches
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#667085",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          LostLink compares reports and shows possible matches between lost
          and found items.
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "14px",
            padding: "16px 18px",
            marginBottom: "22px",
            color: "#9a3412",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* EMPTY STATE */}
      {matches.length === 0 && !message && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "60px 30px",
            textAlign: "center",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background: "#eaf3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              fontSize: "25px",
            }}
          >
            🔍
          </div>

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "21px",
            }}
          >
            No potential matches yet
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            When LostLink finds a possible match, it will appear here.
          </p>
        </div>
      )}

      {/* MATCH LIST */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {matches.map(({ match, otherReport, role }) => {
          const score = Math.round(Number(match.match_score));

          return (
            <div
              key={match.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e1e7f0",
                borderRadius: "18px",
                padding: "26px",
                boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
                boxSizing: "border-box",
              }}
            >
              {/* CARD TOP */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "22px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#eaf3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    🔎
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#8a94a6",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "4px",
                      }}
                    >
                      Match detected
                    </div>

                    <div
                      style={{
                        color: "#172033",
                        fontSize: "17px",
                        fontWeight: 700,
                      }}
                    >
                      Potential Match
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: score >= 70 ? "#e9f9f1" : "#eef5ff",
                    color: score >= 70 ? "#18794e" : "#1859a8",
                    borderRadius: "999px",
                    padding: "8px 13px",
                    fontSize: "13px",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {score}% Match
                </div>
              </div>

              {/* ITEM SUMMARY */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #edf1f6",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#98a2b3",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "5px",
                      }}
                    >
                      Matching report
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        color: "#172033",
                        fontSize: "24px",
                        fontWeight: 700,
                      }}
                    >
                      {otherReport.item_name}
                    </h2>
                  </div>

                  <div
                    style={{
                      background:
                        role === "Owner" ? "#fff1f2" : "#ecfdf5",
                      color: role === "Owner" ? "#dc2626" : "#059669",
                      borderRadius: "999px",
                      padding: "7px 11px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    You are the {role}
                  </div>
                </div>

                <div
                  style={{
                    color: "#1677ff",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "14px",
                  }}
                >
                  {otherReport.category}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "14px",
                    lineHeight: 1.65,
                  }}
                >
                  {otherReport.description}
                </p>
              </div>

              {/* DETAILS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #edf1f6",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Location
                  </div>

                  <div
                    style={{
                      color: "#344054",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    📍 {otherReport.location}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid #edf1f6",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Report Time
                  </div>

                  <div
                    style={{
                      color: "#344054",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    🕒{" "}
                    {new Date(otherReport.event_time).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* REASON */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #dbeafe",
                  borderRadius: "12px",
                  padding: "15px 16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "#1859a8",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "5px",
                  }}
                >
                  Why this match?
                </div>

                <div
                  style={{
                    color: "#344054",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  {match.match_reason}
                </div>
              </div>

              {/* ACTION */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Link
                  to={`/match/${match.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "#1677ff",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    boxShadow: "0 7px 18px rgba(22, 119, 255, 0.18)",
                  }}
                >
                  Review Match →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;