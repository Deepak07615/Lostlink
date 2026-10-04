import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        ? "Contact request accepted."
        : "Contact request rejected."
    );

    await loadRequests();
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
            Loading requests...
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            Please wait while we load your contact requests.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter(
    ({ request }) => request.status === "pending"
  ).length;

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
          HEADER
          ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
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
            CONTACT CENTER
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
            Contact Requests
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#667085",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Review requests from owners of matched items.
          </p>
        </div>

        {/* PENDING COUNT */}
        <div
          style={{
            minWidth: "125px",
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "14px",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 5px 18px rgba(35, 55, 90, 0.04)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              color: "#1677ff",
              fontSize: "24px",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {pendingCount}
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#718096",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Pending
          </div>
        </div>
      </div>

      {/* =========================
          MESSAGE
          ========================= */}

      {message && (
        <div
          style={{
            background:
              message.includes("accepted")
                ? "#eaf9f2"
                : message.includes("rejected")
                ? "#fff1f1"
                : "#fff7ed",
            border:
              message.includes("accepted")
                ? "1px solid #c7eedc"
                : message.includes("rejected")
                ? "1px solid #ffd6d6"
                : "1px solid #fed7aa",
            color:
              message.includes("accepted")
                ? "#18794e"
                : message.includes("rejected")
                ? "#c43232"
                : "#9a3412",
            borderRadius: "14px",
            padding: "15px 17px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {message.includes("accepted") && "✅ "}
          {message.includes("rejected") && "❌ "}
          {message}
        </div>
      )}

      {/* =========================
          EMPTY STATE
          ========================= */}

      {requests.length === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e1e7f0",
            borderRadius: "18px",
            padding: "65px 30px",
            textAlign: "center",
            boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "16px",
              background: "#eaf3ff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 18px",
              fontSize: "27px",
            }}
          >
            🤝
          </div>

          <h2
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "21px",
            }}
          >
            No contact requests yet
          </h2>

          <p
            style={{
              margin: "9px 0 0",
              color: "#718096",
              fontSize: "14px",
            }}
          >
            When an owner requests to contact you, the request will appear
            here.
          </p>
        </div>
      )}

      {/* =========================
          REQUEST LIST
          ========================= */}

      {requests.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {requests.map(({ request, lostReport, foundReport }) => {
            const isPending = request.status === "pending";
            const isAccepted = request.status === "accepted";
            const isRejected = request.status === "rejected";

            return (
              <div
                key={request.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e1e7f0",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 6px 22px rgba(35, 55, 90, 0.05)",
                  boxSizing: "border-box",
                }}
              >
                {/* CARD HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "13px",
                        background: "#eaf3ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "21px",
                        flexShrink: 0,
                      }}
                    >
                      🔔
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#98a2b3",
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        OWNER CONTACT REQUEST
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          color: "#172033",
                          fontSize: "18px",
                          fontWeight: 700,
                        }}
                      >
                        Someone wants to contact you
                      </h2>
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <div
                    style={{
                      background: isPending
                        ? "#fff7ed"
                        : isAccepted
                        ? "#e9f9f1"
                        : "#fff1f1",
                      color: isPending
                        ? "#c2410c"
                        : isAccepted
                        ? "#18794e"
                        : "#c43232",
                      borderRadius: "999px",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "capitalize",
                    }}
                  >
                    {request.status}
                  </div>
                </div>

                {/* REPORT COMPARISON */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "14px",
                    marginBottom: "18px",
                  }}
                  className="contact-request-grid"
                >
                  {/* LOST ITEM */}
                  <div
                    style={{
                      background: "#fff8f8",
                      border: "1px solid #f5dddd",
                      borderRadius: "13px",
                      padding: "17px",
                    }}
                  >
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                      }}
                    >
                      🔴 Lost Item
                    </div>

                    <div
                      style={{
                        color: "#172033",
                        fontSize: "17px",
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      {lostReport.item_name}
                    </div>

                    <div
                      style={{
                        color: "#667085",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      {lostReport.description}
                    </div>
                  </div>

                  {/* FOUND ITEM */}
                  <div
                    style={{
                      background: "#f7fffb",
                      border: "1px solid #dcefe5",
                      borderRadius: "13px",
                      padding: "17px",
                    }}
                  >
                    <div
                      style={{
                        color: "#059669",
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                      }}
                    >
                      🟢 Found Item
                    </div>

                    <div
                      style={{
                        color: "#172033",
                        fontSize: "17px",
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      {foundReport.item_name}
                    </div>

                    <div
                      style={{
                        color: "#667085",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      {foundReport.description}
                    </div>
                  </div>
                </div>

                {/* LOCATION */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #edf1f6",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      color: "#98a2b3",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "5px",
                    }}
                  >
                    Found Item Location
                  </div>

                  <div
                    style={{
                      color: "#344054",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    📍 {foundReport.location}
                  </div>
                </div>

                {/* CREATED DATE */}
                <div
                  style={{
                    color: "#98a2b3",
                    fontSize: "11px",
                    marginBottom: "18px",
                  }}
                >
                  Request received:{" "}
                  {new Date(request.created_at).toLocaleString()}
                </div>

                {/* ACTIONS */}
                {isPending && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      borderTop: "1px solid #edf1f6",
                      paddingTop: "18px",
                    }}
                  >
                    <button
                      onClick={() =>
                        respondToRequest(request.id, "accepted")
                      }
                      style={{
                        border: "none",
                        background: "#1677ff",
                        color: "#ffffff",
                        padding: "12px 19px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        boxShadow:
                          "0 7px 18px rgba(22, 119, 255, 0.18)",
                      }}
                    >
                      ✓ Accept Request
                    </button>

                    <button
                      onClick={() =>
                        respondToRequest(request.id, "rejected")
                      }
                      style={{
                        border: "1px solid #d7dee8",
                        background: "#ffffff",
                        color: "#667085",
                        padding: "12px 19px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {/* ACCEPTED */}
                {isAccepted && (
                  <div
                    style={{
                      borderTop: "1px solid #edf1f6",
                      paddingTop: "18px",
                    }}
                  >
                    <div
                      style={{
                        background: "#eaf9f2",
                        border: "1px solid #c7eedc",
                        color: "#18794e",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        marginBottom: "14px",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      ✅ Contact request accepted. You can now communicate
                      with the owner through private chat.
                    </div>

                    <Link
                      to={`/chat/${request.id}`}
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

                {/* REJECTED */}
                {isRejected && (
                  <div
                    style={{
                      borderTop: "1px solid #edf1f6",
                      paddingTop: "18px",
                    }}
                  >
                    <div
                      style={{
                        background: "#fff1f1",
                        border: "1px solid #ffd6d6",
                        color: "#c43232",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        fontSize: "13px",
                      }}
                    >
                      ❌ This contact request was rejected.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RESPONSIVE */}
      <style>{`
        @media (max-width: 700px) {
          .contact-request-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ContactRequests;