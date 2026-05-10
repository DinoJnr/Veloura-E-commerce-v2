import React, { useState, useEffect, useRef } from "react";
import {
  Camera, User, Mail, Hash, Shield,
  Calendar, Clock, CheckCircle, XCircle,
  Loader2, Upload,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const API = "http://localhost:5200";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

// ─── INFO TILE ────────────────────────────────────────────────────────────────
const Tile = ({ icon: Icon, label, value, accent = "#0a1e28", mono = false }) => (
  <div style={{ background: "#fff", border: "1px solid rgba(180,210,220,0.45)", borderRadius: "18px", padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: "14px", boxShadow: "0 2px 12px rgba(10,50,70,0.04)" }}>
    <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: `${accent}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={17} color={accent} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#7a9aaa", fontFamily: "DM Sans, sans-serif" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0a1e28", fontFamily: mono ? "monospace" : "DM Sans, sans-serif", wordBreak: "break-all" }}>{value || "—"}</p>
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const VelouraProfile = () => {
  const { user: authUser } = useAuth();
  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [toast,          setToast]          = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios.get(`${API}/profile/me`)
      .then(r => setProfile(r.data.profile))
      .catch(() => showToast("Failed to load profile.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview immediately
    setPreviewUrl(URL.createObjectURL(file));

    const form = new FormData();
    form.append("avatar", file);

    try {
      setUploading(true);
      const res = await axios.patch(`${API}/profile/picture`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.profile);
      showToast("Profile picture updated!");
    } catch {
      showToast("Upload failed. Try again.", "error");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const avatarSrc = previewUrl || profile?.profilePicture || null;
  const initials  = profile?.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const isLogistics = profile?.role === "logistics";
  const roleAccent  = isLogistics ? "#7c3aed" : "#0a7c5c";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .prf-layout { display:flex;min-height:100vh;background:linear-gradient(135deg,#eef5f8 0%,#f4f9fb 100%);font-family:'DM Sans',sans-serif; }
        .prf-sidebar { width:260px;flex-shrink:0;position:sticky;top:0;height:100vh;background:rgba(255,255,255,0.45);backdrop-filter:blur(10px);border-right:1px solid rgba(180,210,220,0.4); }
        .prf-main { flex:1;padding:40px;overflow-y:auto; }
        .prf-avatar-ring { position:relative;width:130px;height:130px;flex-shrink:0; }
        .prf-avatar-img { width:130px;height:130px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 8px 32px rgba(10,30,40,0.14); }
        .prf-avatar-initials { width:130px;height:130px;border-radius:50%;background:linear-gradient(135deg,#0a1e28 0%,#0d2535 100%);border:4px solid #fff;box-shadow:0 8px 32px rgba(10,30,40,0.14);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:600;color:#e8f4f8;letter-spacing:0.04em; }
        .prf-camera-btn { position:absolute;bottom:4px;right:4px;width:34px;height:34px;border-radius:50%;background:#0a1e28;border:3px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s,background 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.18); }
        .prf-camera-btn:hover { background:#0d9a70;transform:scale(1.1); }
        .prf-card { background:#fff;border-radius:24px;border:1px solid rgba(180,210,220,0.5);overflow:hidden;box-shadow:0 6px 28px rgba(10,50,70,0.06); }
        .prf-tiles { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        @media(max-width:640px){ .prf-tiles{grid-template-columns:1fr;} }
        .prf-toast { position:fixed;bottom:32px;right:32px;z-index:9999;padding:13px 22px;border-radius:14px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:9px;box-shadow:0 8px 32px rgba(0,0,0,0.16);animation:toastIn 0.3s ease; }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes prfSpin { to{transform:rotate(360deg)} }
        .prf-upload-overlay { position:absolute;inset:0;border-radius:50%;background:rgba(10,30,40,0.45);display:flex;align-items:center;justify-content:center; }
      `}</style>

      <div className="prf-layout">
        <aside className="prf-sidebar">
          <VelouraAdminNavbar currentPage="Profile" />
        </aside>

        <main className="prf-main">

          {/* HEADER */}
          <header style={{ marginBottom: "32px" }}>
            <p style={{ color: "#7a9aaa", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>Veloura Admin</p>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#0a1e28", margin: 0 }}>My Profile</h1>
          </header>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
              <Loader2 size={28} color="#7a9aaa" style={{ animation: "prfSpin 1s linear infinite" }} />
            </div>
          ) : (
            <>
              {/* ── HERO CARD ─────────────────────────────────────────────── */}
              <div className="prf-card" style={{ marginBottom: "24px" }}>

                {/* Dark banner */}
                <div style={{ background: "linear-gradient(145deg,#0a1e28 0%,#0d2535 100%)", padding: "36px 36px 70px", position: "relative" }}>
                  <p style={{ margin: 0, color: "rgba(160,210,220,0.45)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Account Profile</p>
                  {/* Decorative circles */}
                  <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "20px", right: "60px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
                </div>

                {/* Avatar + name row — overlaps banner */}
                <div style={{ padding: "0 36px 32px", marginTop: "-50px", display: "flex", alignItems: "flex-end", gap: "22px", flexWrap: "wrap" }}>

                  {/* Avatar */}
                  <div className="prf-avatar-ring">
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" className="prf-avatar-img" />
                      : <div className="prf-avatar-initials">{initials}</div>
                    }
                    {uploading && (
                      <div className="prf-upload-overlay">
                        <Loader2 size={22} color="#fff" style={{ animation: "prfSpin 1s linear infinite" }} />
                      </div>
                    )}
                    <button className="prf-camera-btn" onClick={() => fileRef.current.click()} title="Change photo">
                      <Camera size={14} color="#fff" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                  </div>

                  {/* Name + role */}
                  <div style={{ paddingBottom: "4px" }}>
                    <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "30px", color: "#0a1e28", margin: "0 0 6px", fontWeight: 600 }}>
                      {profile?.fullName || "—"}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em", background: `${roleAccent}12`, color: roleAccent, border: `1px solid ${roleAccent}30` }}>
                        {profile?.role || "—"}
                      </span>
                      {isLogistics && (
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.08em", background: profile?.isActive ? "#ecfdf5" : "#f5f5f5", color: profile?.isActive ? "#065f46" : "#999", border: `1px solid ${profile?.isActive ? "#6ee7b7" : "#e0edf2"}` }}>
                          {profile?.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Upload hint */}
                  <div style={{ marginLeft: "auto", paddingBottom: "8px" }}>
                    <button onClick={() => fileRef.current.click()} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "12px", border: "1px solid #e0edf2", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#7a9aaa", fontFamily: "DM Sans, sans-serif", transition: "all 0.2s" }}>
                      <Upload size={13} /> Change Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* ── INFO TILES ────────────────────────────────────────────── */}
              <div className="prf-card" style={{ padding: "28px" }}>
                <p style={{ margin: "0 0 20px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#7a9aaa" }}>Account Details</p>
                <div className="prf-tiles">
                  <Tile icon={User}     label="Full Name"  value={profile?.fullName}  accent="#0a1e28" />
                  <Tile icon={Mail}     label="Email"      value={profile?.email}     accent="#2563eb" />
                  <Tile icon={Hash}     label="System ID"  value={profile?.systemId}  accent="#7c3aed" mono />
                  <Tile icon={Shield}   label="Role"       value={profile?.role}      accent={roleAccent} />
                  <Tile icon={Calendar} label="Joined"     value={fmtDate(profile?.createdAt)} accent="#d97706" />
                  <Tile
                    icon={profile?.isActive !== undefined ? (profile.isActive ? CheckCircle : XCircle) : Clock}
                    label={profile?.isActive !== undefined ? "Account Status" : "Last Active"}
                    value={profile?.isActive !== undefined ? (profile.isActive ? "Active" : "Inactive") : "—"}
                    accent={profile?.isActive ? "#0a7c5c" : "#dc2626"}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="prf-toast" style={{ background: toast.type === "error" ? "#dc2626" : "#0a7c5c", color: "#fff" }}>
          {toast.type === "error" ? <XCircle size={15} /> : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default VelouraProfile;