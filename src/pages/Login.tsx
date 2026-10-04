import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("✅ Login successful!");

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at 15% 20%, rgba(82, 103, 255, 0.10), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f6f9fd 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #5267ff, #7b61ff)",
              color: "#ffffff",
              fontSize: "19px",
              fontWeight: 800,
              boxShadow: "0 10px 25px rgba(82, 103, 255, 0.25)",
            }}
          >
            L
          </div>

          <span
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#172033",
            }}
          >
            LostLink
          </span>
        </div>

        {/* CARD */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e3e8f1",
            borderRadius: "20px",
            padding: "38px",
            boxShadow: "0 20px 60px rgba(34, 47, 78, 0.08)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "30px",
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                color: "#172033",
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Sign in to continue to your LostLink account.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              <label
                style={{
                  color: "#344054",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid #dce3ed",
                  borderRadius: "10px",
                  background: "#fbfcfe",
                  color: "#172033",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* PASSWORD */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <label
                style={{
                  color: "#344054",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1px solid #dce3ed",
                  borderRadius: "10px",
                  background: "#fbfcfe",
                  color: "#172033",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "#5567f3",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "11px",
                padding: "14px",
                background: loading
                  ? "#9aa5d8"
                  : "linear-gradient(135deg, #5267ff, #6678ff)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px rgba(82, 103, 255, 0.20)",
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* MESSAGE */}
          {message && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: message.startsWith("✅")
                  ? "#ecfdf5"
                  : "#fff1f2",
                border: message.startsWith("✅")
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecdd3",
                color: message.startsWith("✅")
                  ? "#15803d"
                  : "#be123c",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}

          {/* SIGN UP */}
          <div
            style={{
              marginTop: "25px",
              paddingTop: "22px",
              borderTop: "1px solid #edf0f5",
              textAlign: "center",
              color: "#718096",
              fontSize: "13px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#5567f3",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Create account
            </Link>
          </div>
        </div>

        {/* BACK TO LANDING */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#7b879a",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            ← Back to LostLink
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;