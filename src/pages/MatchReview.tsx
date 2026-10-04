import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

type ContactRequest = {
  id: string;
  status: "pending" | "accepted" | "rejected";
};

function MatchReview() {
  const { matchId } = useParams();

  const [match, setMatch] = useState<MatchData | null>(null);
  const [role, setRole] = useState<"Owner" | "Finder" | null>(null);
  const [message, setMessage] = useState("");
  const [contactRequest, setContactRequest] =
    useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  async function loadMatch() {
    if (!matchId) {
      setMessage("Match not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

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
    if (!match || role !== "Owner") {
      return;
    }

    setMessage("");

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

    setMessage("Contact request sent to the finder.");

    // Reload so the new pending request appears immediately.
    await loadMatch();
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
          background: "#f5f8fc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "42px 55px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(35, 55, 90, 0.06)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "4px solid #dbeafe",
              borderTopColor: "#1677ff",
              borderRadius: "50%",
              margin: "0 auto 18px",
              boxSizing: "border-box",
            }}
          />

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "19px",
            }}
          >
            Loading match...
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            Please wait while LostLink loads the match details.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
     ========================= */

  if (!match) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "50px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #f1d1d1",
            borderRadius: "18px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 8px 25px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: "38px",
              marginBottom: "12px",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              color: "#172033",
              fontSize: "26px",
            }}
          >
            Match unavailable
          </h1>

          <p
            style={{
              margin: "0 0 22px",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            {message || "We couldn't load this match."}
          </p>

          <Link
            to="/matches"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1677ff",
              color: "#ffffff",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  const score = Math.round(Number(match.match_score));

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "10px 0 40px",
        boxSizing: "border-box",
      }}
    >
      {/* =========================
          PAGE HEADER
          ========================= */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            color: "#1677ff",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          MATCH REVIEW
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
          Review Match
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#667085",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Compare the lost and found reports before deciding how to proceed.
        </p>
      </div>

      {/* =========================
          MATCH SUMMARY
          ========================= */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e1e7f0",
          borderRadius: "18px",
          padding: "25px",
          marginBottom: "20px",
          boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                color: "#98a2b3",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              MATCH CONFIDENCE
            </div>

            <div
              style={{
                color: "#172033",
                fontSize: "23px",
                fontWeight: 700,
              }}
            >
              {score}% Potential Match
            </div>
          </div>

          <div
            style={{
              background: score >= 70 ? "#e9f9f1" : "#eef5ff",
              color: score >= 70 ? "#18794e" : "#1859a8",
              padding: "9px 15px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            {score >= 70 ? "Strong Match" : "Possible Match"}
          </div>
        </div>

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "13px",
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              color: "#1859a8",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Why LostLink matched these reports
          </div>

          <div
            style={{
              color: "#344054",
              fontSize: "14px",
              lineHeight: 1.65,
            }}
          >
            {match.match_reason}
          </div>
        </div>
      </div>

      {/* =========================
          REPORT COMPARISON
          ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* LOST REPORT */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff1f2",
              color: "#dc2626",
              borderRadius: "999px",
              padding: "7px 11px",
              fontSize: "12px",
              fontWeight: 800,
              marginBottom: "18px",
            }}
          >
            🔴 LOST REPORT
          </div>

          <h2
            style={{
              margin: "0 0 18px",
              color: "#172033",
              fontSize: "23px",
              fontWeight: 700,
            }}
          >
            {match.lost_report.item_name}
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#98a2b3",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Category
              </div>

              <div
                style={{
                  color: "#1677ff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {match.lost_report.category}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#98a2b3",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: "#475467",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {match.lost_report.description}
              </div>
            </div>

            <div>
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
                📍 {match.lost_report.location}
              </div>
            </div>
          </div>
        </div>

        {/* FOUND REPORT */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ecfdf5",
              color: "#059669",
              borderRadius: "999px",
              padding: "7px 11px",
              fontSize: "12px",
              fontWeight: 800,
              marginBottom: "18px",
            }}
          >
            🟢 FOUND REPORT
          </div>

          <h2
            style={{
              margin: "0 0 18px",
              color: "#172033",
              fontSize: "23px",
              fontWeight: 700,
            }}
          >
            {match.found_report.item_name}
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#98a2b3",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Category
              </div>

              <div
                style={{
                  color: "#1677ff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {match.found_report.category}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#98a2b3",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: "#475467",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {match.found_report.description}
              </div>
            </div>

            <div>
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
                📍 {match.found_report.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          ACTION SECTION
          ========================= */}

      {role && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          {/* OWNER */}

          {role === "Owner" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "#eaf3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "19px",
                  }}
                >
                  👤
                </div>

                <div>
                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    YOUR ROLE
                  </div>

                  <h2
                    style={{
                      margin: "3px 0 0",
                      color: "#172033",
                      fontSize: "20px",
                    }}
                  >
                    You are the Owner
                  </h2>
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 20px",
                  color: "#667085",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Think this found item belongs to you? Contact the finder to
                begin the recovery conversation.
              </p>

              {!contactRequest && (
                <button
                  onClick={contactFinder}
                  style={{
                    border: "none",
                    background: "#1677ff",
                    color: "#ffffff",
                    padding: "13px 20px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    boxShadow: "0 7px 18px rgba(22, 119, 255, 0.18)",
                  }}
                >
                  Contact Finder →
                </button>
              )}

              {contactRequest?.status === "pending" && (
                <div
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#9a3412",
                    borderRadius: "12px",
                    padding: "15px 16px",
                    fontSize: "14px",
                  }}
                >
                  ⏳ Contact request sent. Waiting for the finder to accept.
                </div>
              )}

              {contactRequest?.status === "accepted" && (
                <div>
                  <div
                    style={{
                      background: "#eaf9f2",
                      border: "1px solid #c7eedc",
                      color: "#18794e",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "14px",
                      fontSize: "14px",
                    }}
                  >
                    ✅ Contact request accepted. You can now chat with the
                    finder.
                  </div>

                  <Link
                    to={`/chat/${contactRequest.id}`}
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
                    }}
                  >
                    💬 Open Chat
                  </Link>
                </div>
              )}

              {contactRequest?.status === "rejected" && (
                <div
                  style={{
                    background: "#fff1f1",
                    border: "1px solid #ffd6d6",
                    color: "#c43232",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    fontSize: "14px",
                  }}
                >
                  ❌ The contact request was rejected.
                </div>
              )}

              {message && (
                <div
                  style={{
                    marginTop: "14px",
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  {message}
                </div>
              )}
            </>
          )}

          {/* FINDER */}

          {role === "Finder" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "19px",
                  }}
                >
                  🔎
                </div>

                <div>
                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    YOUR ROLE
                  </div>

                  <h2
                    style={{
                      margin: "3px 0 0",
                      color: "#172033",
                      fontSize: "20px",
                    }}
                  >
                    You are the Finder
                  </h2>
                </div>
              </div>

              {!contactRequest && (
                <p
                  style={{
                    margin: 0,
                    color: "#667085",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  The owner must verify this match and contact you first.
                </p>
              )}

              {contactRequest?.status === "pending" && (
                <div
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#9a3412",
                      fontWeight: 700,
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    🔔 The owner has requested contact.
                  </div>

                  <div
                    style={{
                      color: "#667085",
                      fontSize: "13px",
                    }}
                  >
                    Waiting for you to accept the request.
                  </div>
                </div>
              )}

              {contactRequest?.status === "accepted" && (
                <div>
                  <div
                    style={{
                      background: "#eaf9f2",
                      border: "1px solid #c7eedc",
                      color: "#18794e",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "14px",
                      fontSize: "14px",
                    }}
                  >
                    ✅ Contact request accepted. You can now chat with the
                    owner.
                  </div>

                  <Link
                    to={`/chat/${contactRequest.id}`}
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
                    }}
                  >
                    💬 Open Chat
                  </Link>
                </div>
              )}

              {contactRequest?.status === "rejected" && (
                <div
                  style={{
                    background: "#fff1f1",
                    border: "1px solid #ffd6d6",
                    color: "#c43232",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    fontSize: "14px",
                  }}
                >
                  ❌ Contact request was rejected.
                </div>
              )}

              {message && (
                <div
                  style={{
                    marginTop: "14px",
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!role && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "14px",
          }}
        >
          You are not associated with either report in this match.
        </div>
      )}

      {/* BACK LINK */}

      <div style={{ marginTop: "20px" }}>
        <Link
          to="/matches"
          style={{
            color: "#1677ff",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          ← Back to Matches
        </Link>
      </div>

      {/* RESPONSIVE NOTE
          Grid will naturally stack on narrow screens through CSS below. */}
      <style>{`
        @media (max-width: 760px) {
          .match-review-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MatchReview;