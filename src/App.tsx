import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Matches from "./pages/Matches";
import MyItems from "./pages/MyItems";
import Notifications from "./pages/Notifications";
import MatchReview from "./pages/MatchReview";
import ContactRequests from "./pages/ContactRequests";
import Chat from "./pages/Chat";
import AppLayout from "./components/AppLayout";
import Profile from "./pages/Profile";
import ChatCenter from "./pages/ChatCenter";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Landing() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link
          to="/"
          className="logo"
          style={{ textDecoration: "none" }}
        >
          <div className="logo-mark">L</div>
          <span>LostLink</span>
        </Link>

        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>

          {/* SIGN IN AT TOP RIGHT */}
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: "#5668f1",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Sign In
          </Link>

          {/* LOGIN BUTTON */}
          <Link
            to="/login"
            className="login-btn"
            style={{
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            SMART LOST & FOUND PLATFORM
          </div>

          <h1>
            Find what you lost.
            <br />
            <span>Return what you found.</span>
          </h1>

          <p>
            LostLink connects people who have lost items with people
            who find them, using smart matching to make recovery faster
            and easier.
          </p>

          {/* ONLY GET STARTED HERE */}
          <div className="hero-actions">
            <Link
              to="/signup"
              className="primary-btn"
              style={{
                textDecoration: "none",
              }}
            >
              Get Started
            </Link>
          </div>

          <div className="trust-line">
            <span>✓ Easy reporting</span>
            <span>✓ Smart matching</span>
            <span>✓ Private communication</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="stats" id="how-it-works">
        <div>
          <strong>01</strong>
          <span>Report a lost or found item</span>
        </div>

        <div>
          <strong>02</strong>
          <span>LostLink finds possible matches</span>
        </div>

        <div>
          <strong>03</strong>
          <span>Connect and recover your item</span>
        </div>
      </section>

      {/* ABOUT */}
      <section className="info-section" id="about">
        <div className="section-label">
          ABOUT LOSTLINK
        </div>

        <h2>
          One platform for the entire lost-and-found journey.
        </h2>

        <p>
          Report your item, review potential matches, communicate
          privately, and work toward getting the item back to its
          rightful owner.
        </p>
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC LANDING */}
        <Route path="/" element={<Landing />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

        {/* APPLICATION */}
        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={<Home />}
          />

          <Route
            path="/report-lost"
            element={<ReportLost />}
          />

          <Route
            path="/report-found"
            element={<ReportFound />}
          />

          <Route
            path="/my-items"
            element={<MyItems />}
          />

          <Route
            path="/matches"
            element={<Matches />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/chat"
            element={<ChatCenter />}
          />

          <Route
            path="/match/:matchId"
            element={<MatchReview />}
          />

          <Route
            path="/contact-requests"
            element={<ContactRequests />}
          />

          <Route
            path="/chat/:requestId"
            element={<Chat />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;