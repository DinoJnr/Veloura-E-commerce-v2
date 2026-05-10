// Components/VelouraLogin.jsx  (Logistics App)

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth  } from "./AuthContext";
import { Loader2 } from "lucide-react";

const API = "http://localhost:5200";

/* ─── FONTS ─── */
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');`;

/* ─── STYLES ─── */
const css = `
${FONT}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --card-bg: #ffffff;
  --accent: #3DDC84;
  --text-main: #2D3436;
  --text-muted: #636E72;
  --border: rgba(0, 0, 0, 0.08);
  --input-bg: #F8FAF9;
  --syne: 'Syne', sans-serif;
  --body: 'Manrope', sans-serif;
}

.login-shell {
  font-family: var(--body);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

.login-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  animation: fadeIn 0.6s ease-out;
}

.brand-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent), #2ecc71);
  border-radius: 12px;
  margin: 0 auto 16px;
}

.brand-name {
  font-family: var(--syne);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-name span { color: var(--accent); }

.welcome-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-group { margin-bottom: 20px; }

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-main);
}

.input {
  width: 100%;
  padding: 14px 16px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: var(--body);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.input:focus {
  border-color: var(--accent);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(61, 220, 132, 0.1);
}

.input.error-input {
  border-color: #e74c3c;
  box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.08);
}

.error-box {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  padding: 11px 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: var(--body);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s, opacity 0.2s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background: #35c776;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
}

.link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spinning { animation: spin 1s linear infinite; }
`;

export default function VelouraLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || "/veloura/updatelogistics";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });

      // Block admin accounts from using the logistics portal
      if (res.data.user?.role !== "logistics") {
        setError("This portal is for logistics staff only.");
        return;
      }

      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#e1f5e8] to-[#ffffff] login-shell">
      <style>{css}</style>

      <div className="login-card">
        <div className="brand-section">
          <div className="logo-icon" />
          <h1 className="brand-name">Veloura<span>Logistics</span></h1>
          <p className="welcome-text">Logistics Portal Access</p>
        </div>

        <form onSubmit={handleLogin}>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: "10px", fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>!</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              className={`input ${error ? "error-input" : ""}`}
              placeholder="logistics@veloura.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className={`input ${error ? "error-input" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? <><Loader2 size={18} className="spinning" /> Verifying…</>
              : "Sign In"
            }
          </button>
        </form>

        <div className="footer-links">
          <p>Access issues? <a href="#" className="link">Contact Admin</a></p>
        </div>
      </div>
    </div>
  );
}