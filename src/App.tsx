import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/match/:matchId" element={<MatchReview />} />
        <Route path="/chat/:requestId" element={<Chat />} />
        <Route
  path="/contact-requests"
  element={<ContactRequests />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;