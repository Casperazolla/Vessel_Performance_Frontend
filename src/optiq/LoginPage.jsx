import { useState } from "react";
import { C, Logo } from "./shared";

function LoginPage({ onLogin }) {

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async () => {

    if (!username || !password) {
      setErr("Please enter credentials");
      return;
    }

    setErr("");
    setLoading(true);

    try {

      const myHeaders = new Headers();

      myHeaders.append(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );

      const urlencoded = new URLSearchParams();

      urlencoded.append("username", username);
      urlencoded.append("password", password);

      const response = await fetch(
        "https://da.azolla.sg/login",
        {
          method: "POST",
          headers: myHeaders,
          body: urlencoded,
          redirect: "follow"
        }
      );

      const result = await response.text();


      if (response.ok) {

        localStorage.setItem(
          "token",
          result
        );

        onLogin();

      } else {

        setErr("Invalid username or password");

      }

    } catch (err) {

      console.error(err);
      setErr("Server error");

    }

    setLoading(false);
  };

  return (

    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/Background.png')",
      backgroundSize: "cover",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(10,25,50,0.75)",
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "32px",
        backdropFilter: "blur(18px)",
      }}>

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 20,
        }}>
          <Logo />
        </div>

        <h2 style={{
          color: C.textPrimary,
          fontSize: 24,
          marginBottom: 8,
          textAlign: "center",
        }}>
          OPTIQ Login
        </h2>

        <p style={{
          color: C.textMuted,
          fontSize: 13,
          textAlign: "center",
          marginBottom: 28,
        }}>
          Access vessel performance platform
        </p>

        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          placeholder="Username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: 14,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.inputBg,
            color: C.textPrimary,
          }}
        />

        <input
          type="password"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: 14,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.inputBg,
            color: C.textPrimary,
          }}
        />

        {err && (
          <div style={{
            color: "#f87171",
            fontSize: 12,
            marginBottom: 12,
          }}>
            {err}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: C.accentBtn,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

      </div>

    </div>

  );
}

export default LoginPage;
