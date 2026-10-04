import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type ContactRequest = {
  id: string;
  match_id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
};

type Match = {
  id: string;
  lost_report_id: string;
  found_report_id: string;
};

type Report = {
  id: string;
  item_name: string;
};

type Conversation = {
  request: ContactRequest;
  match: Match;
  itemName: string;
};

function ChatCenter() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to view your chats.");
      setLoading(false);
      return;
    }

    const { data: requests, error: requestError } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (requestError) {
      setMessage(requestError.message);
      setLoading(false);
      return;
    }

    if (!requests || requests.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const matchIds = requests.map((request) => request.match_id);

    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("id, lost_report_id, found_report_id")
      .in("id", matchIds);

    if (matchError) {
      setMessage(matchError.message);
      setLoading(false);
      return;
    }

    const reportIds = (matches ?? []).flatMap((match) => [
      match.lost_report_id,
      match.found_report_id,
    ]);

    const { data: reports, error: reportError } = await supabase
      .from("reports")
      .select("id, item_name")
      .in("id", reportIds);

    if (reportError) {
      setMessage(reportError.message);
      setLoading(false);
      return;
    }

    const result: Conversation[] = requests
      .map((request) => {
        const match = (matches ?? []).find(
          (item) => item.id === request.match_id
        );

        if (!match) return null;

        const lostReport = (reports ?? []).find(
          (report) => report.id === match.lost_report_id
        );

        const foundReport = (reports ?? []).find(
          (report) => report.id === match.found_report_id
        );

        return {
          request,
          match,
          itemName:
            lostReport?.item_name ||
            foundReport?.item_name ||
            "Matched Item",
        };
      })
      .filter(Boolean) as Conversation[];

    setConversations(result);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="chat-center-loading">
        Loading your conversations...
      </div>
    );
  }

  return (
    <div className="chat-center">

      <div className="chat-center-header">
        <div>
          <h1>Messages</h1>
          <p>
            Secure conversations with people connected through LostLink.
          </p>
        </div>
      </div>

      {message && (
        <div className="chat-center-message">
          {message}
        </div>
      )}

      {conversations.length === 0 && !message ? (
        <div className="empty-chat-card">
          <div className="empty-chat-icon">💬</div>

          <h2>No conversations yet</h2>

          <p>
            Once a contact request is accepted, your conversation
            will appear here.
          </p>

          <Link to="/matches">
            View Potential Matches
          </Link>
        </div>
      ) : (
        <div className="conversation-list">

          {conversations.map((conversation) => (
            <div
              className="conversation-card"
              key={conversation.request.id}
            >
              <div className="conversation-icon">
                💬
              </div>

              <div className="conversation-details">
                <h2>{conversation.itemName}</h2>

                <p>
                  🔒 Private LostLink conversation
                </p>

                <span>
                  Contact request accepted
                </span>
              </div>

              <Link
                to={`/chat/${conversation.request.id}`}
                className="open-chat-button"
              >
                Open Chat →
              </Link>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ChatCenter;