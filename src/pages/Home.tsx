import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading LostLink...</div>;
  }

  const userName =
    user?.user_metadata?.full_name || user?.email || "User";

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1>Welcome to LostLink</h1>

      {user ? (
        <>
          <p>Welcome, {userName} 👋</p>

          <p>
            Lost something or found something? Let LostLink help connect
            the right people.
          </p>

          <div style={{ marginTop: "25px" }}>
            <Link to="/report-lost">
              <button>I Lost Something</button>
            </Link>

            <Link to="/report-found">
              <button style={{ marginLeft: "10px" }}>
                I Found Something
              </button>
            </Link>

            <Link to="/matches">
              <button style={{ marginLeft: "10px" }}>
                View Matches
              </button>
            </Link>
          </div>

          <div style={{ marginTop: "25px" }}>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <>
          <p>
            Report lost or found items and let LostLink find potential
            matches.
          </p>

          <div style={{ marginTop: "25px" }}>
            <Link to="/login">
              <button>Login</button>
            </Link>

            <Link to="/signup">
              <button style={{ marginLeft: "10px" }}>
                Create Account
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;