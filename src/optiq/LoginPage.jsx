import { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErr("Please enter credentials");
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

      const urlencoded = new URLSearchParams();
      urlencoded.append("username", username);
      urlencoded.append("password", password);

      const response = await fetch("https://da.azolla.sg/login", {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      });

      const result = await response.text();

      if (response.ok) {
        localStorage.setItem("token", result);
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
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Brand Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <img src="/Swoosh.png" alt="AZOLLA Logo" style={{
            width: '24px',
            height: '24px',
            flexShrink: 0
          }} />
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            letterSpacing: '0.3px'
          }}>OPTIQ</div>
        </div>

        {/* Divider Line */}
        <div style={{
          height: '1px',
          background: '#e5e7eb',
          marginBottom: '24px'
        }} />

        {/* Form Heading */}
        <h2 style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#9ca3af',
          margin: '0 0 28px 0',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>LOGIN</h2>

        {/* Error Message */}
        {err && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#991b1b',
            fontWeight: '500'
          }}>
            {err}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Email Address</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
              required
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: '#f9fafb',
                color: '#374151',
                boxSizing: 'border-box',
                fontWeight: '400',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: '#f6f8f9',
                color: '#374151',
                boxSizing: 'border-box',
                fontWeight: '400',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#eff6ff';
              }}
            />
          </div>

          {/* Sign In Button - Green */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: loading ? '#9ca3af' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#16a34a';
              }
            }}
          >
            {loading ? 'Signing In...' : '→ Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
