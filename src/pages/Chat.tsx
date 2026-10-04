import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    return <div style={{ padding: "40px" }}>Loading chat...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
        <h1>LostLink Chat</h1>
        <p>❌ {error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h1>LostLink Chat</h1>

      <p>🔒 Secure conversation</p>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          minHeight: "300px",
          marginTop: "20px",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign: msg.sender_id === userId ? "right" : "left",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  maxWidth: "75%",
                }}
              >
                {msg.message}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "12px" }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;