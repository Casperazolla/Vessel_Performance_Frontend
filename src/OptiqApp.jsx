import { useState, useRef, useEffect } from "react";
import LoginPage from "./optiq/LoginPage";
import LandingPage from "./optiq/LandingPage";
import Dashboard from "./optiq/SingleModePage";
import FleetDashboard from "./optiq/FleetDashboard";
import { GlobalStyles } from "./optiq/shared";

const INACTIVITY_TIMEOUT = 10 * 60 * 1500;

export default function App() {
  // Persist login + IMO + shipData + mode across reloads
  const [page, setPage] = useState(() => {
    if (!localStorage.getItem("token")) return "login";
    if (localStorage.getItem("imo") && localStorage.getItem("shipData")) return "dashboard";
    return "landing";
  });

  const [mode, setMode] = useState(() => localStorage.getItem("mode") || "single");

  // imo is a string in single mode and an array in fleet mode -> stored as JSON.
  // The catch handles back-compat with older builds that stored a raw string.
  const [imo, setImo] = useState(() => {
    const saved = localStorage.getItem("imo");
    if (!saved) return "";
    try { return JSON.parse(saved); } catch { return saved; }
  });

  const [shipData, setShipData] = useState(() => {
    try {
      const saved = localStorage.getItem("shipData");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const inactivityTimer = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("imo");
    localStorage.removeItem("shipData");
    localStorage.removeItem("mode");
    localStorage.removeItem("lastActivity");
    setImo("");
    setShipData(null);
    setMode("single");
    setPage("login");
  };

  const resetTimer = useRef(null);
  resetTimer.current = () => {
    localStorage.setItem("lastActivity", Date.now());
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (localStorage.getItem("token")) {
      inactivityTimer.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    // On mount: if logged in, check if already timed out from a previous session
    if (localStorage.getItem("token")) {
      const lastActivity = parseInt(localStorage.getItem("lastActivity") || "0");
      const elapsed = Date.now() - lastActivity;
      if (lastActivity && elapsed > INACTIVITY_TIMEOUT) {
        // Session expired while tab was closed
        handleLogout();
        return;
      }
    }

    // Attach activity listeners
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handler = () => resetTimer.current();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));

    // Start the timer
    resetTimer.current();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  const handleEnter = (id, data, selectedMode = "single") => {
    localStorage.setItem("imo", JSON.stringify(id));   // id: string (single) or array (fleet)
    localStorage.setItem("shipData", JSON.stringify(data));
    localStorage.setItem("mode", selectedMode);
    setImo(id);
    setShipData(data);
    setMode(selectedMode);
    setPage("dashboard");
  };

  const handleBack = () => {
    localStorage.removeItem("imo");
    localStorage.removeItem("shipData");
    localStorage.removeItem("mode");
    setImo("");
    setShipData(null);
    setMode("single");
    setPage("landing");
  };

  return (
    <>
      <GlobalStyles />
      {page === "login" && (
        <LoginPage
          onLogin={() => setPage("landing")}
        />
      )}

      {page === "landing" && (
        <LandingPage
          onLogout={handleLogout}
          onEnter={handleEnter}
        />
      )}

      {page === "dashboard" && mode === "fleet" && (
        <FleetDashboard
          fleet={imo}          // array of IMOs
          results={shipData}   // array of { imo, status, data }
          onBack={handleBack}
          onLogout={handleLogout}
        />
      )}

      {page === "dashboard" && mode === "single" && (
        <Dashboard
          imo={imo}
          shipData={shipData}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
