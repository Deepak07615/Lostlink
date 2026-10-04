import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type ContactRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

function Chat() {
  const { requestId } = useParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<ContactRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChat();
  }, [requestId]);

  async function loadChat() {
    setLoading(true);
    setError("");

    if (!requestId) {
      setError("Invalid contact request.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in.");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data: requestData, error: requestError } = await supabase
      .from("contact_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !requestData) {
      setError("Contact request not found.");
      setLoading(false);
      return;
    }

    if (
      requestData.requester_id !== user.id &&
      requestData.recipient_id !== user.id
    ) {
      setError("You are not part of this conversation.");
      setLoading(false);
      return;
    }

    if (requestData.status !== "accepted") {
      setError("Chat is locked until the finder accepts the request.");
      setLoading(false);
      return;
    }

    setRequest(requestData);

    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .eq("contact_request_id", requestId)
      .order("created_at", { ascending: true });

    if (messageError) {
      setError(messageError.message);
    } else {
      setMessages(messageData ?? []);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!request || !userId || !newMessage.trim()) return;

    const receiverId =
      request.requester_id === userId
        ? request.recipient_id
        : request.requester_id;

    const { error: sendError } = await supabase
      .from("messages")
      .insert({
        contact_request_id: request.id,
        sender_id: userId,
        receiver_id: receiverId,
        message: newMessage.trim(),
      });

    if (sendError) {
      setError(sendError.message);
      return;
    }

    setNewMessage("");
    await loadChat();
  }

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-center-loading">
          Loading your conversation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-error-card">
          <Link to="/chat" className="chat-back-link">
            ← Back to Messages
          </Link>

          <div className="chat-error-icon">
            ⚠️
          </div>

          <h1>Unable to open chat</h1>

          <p>{error}</p>

          <Link to="/chat" className="chat-error-button">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">

      {/* HEADER */}

      <div className="chat-page-header">

        <Link
          to="/chat"
          className="chat-back-link"
        >
          ← Back to Messages
        </Link>

        <div className="chat-title-row">
          <div>
            <h1>LostLink Chat</h1>

            <p>
              🔒 Secure conversation
            </p>
          </div>

          <div className="chat-status">
            ● Connected
          </div>
        </div>

      </div>

      {/* CHAT */}

      <div className="chat-container">

        <div className="chat-messages">

          {messages.length === 0 ? (
            <div className="empty-chat-messages">
              <div className="empty-chat-message-icon">
                💬
              </div>

              <h2>Start the conversation</h2>

              <p>
                Send a message to discuss the matched item.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === userId;

              return (
                <div
                  key={msg.id}
                  className={
                    isMine
                      ? "chat-message-wrapper sent"
                      : "chat-message-wrapper received"
                  }
                >
                  <div
                    className={
                      isMine
                        ? "chat-message sent"
                        : "chat-message received"
                    }
                  >
                    <span>
                      {msg.message}
                    </span>

                    <small className="chat-message-time">
                      {new Date(
                        msg.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* INPUT */}

        <div className="chat-input-area">

          <input
            type="text"
            value={newMessage}
            onChange={(e) =>
              setNewMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
          />

          <button
            className="chat-send-button"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default Chat;