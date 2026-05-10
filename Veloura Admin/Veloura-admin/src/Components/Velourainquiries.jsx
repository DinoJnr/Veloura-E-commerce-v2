import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Mail, ChevronDown, ChevronRight,
  Paperclip, Send, X, Check,
  AlertCircle, Loader2, RefreshCw,
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const BASE_URL = "http://localhost:5200";


const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
      })
    : "";

const SUBJECT_COLORS = {
  "General Inquiry": { bg: "#f0f4ff", color: "#4f46e5" },
  "Order Status":    { bg: "#fef3e2", color: "#a07c45" },
  "Styling Advice":  { bg: "#eaf3de", color: "#3b6d11" },
  "Bespoke Request": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Press & Media":   { bg: "#e0f2fe", color: "#0369a1" },
};

const subjectStyle = (s) =>
  SUBJECT_COLORS[s] || { bg: "#f0f0f8", color: "#3a3a7a" };


const ReplyComposer = ({ inquiry, onSent }) => {
  const [body,    setBody]    = useState("");
  const [files,   setFiles]   = useState([]);
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = "";
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const fmt_size = (bytes) =>
    bytes < 1024 ? `${bytes}B`
    : bytes < 1048576 ? `${(bytes / 1024).toFixed(0)}KB`
    : `${(bytes / 1048576).toFixed(1)}MB`;

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("to",        inquiry.email);
      fd.append("subject",   `Re: ${inquiry.subject || "Your Inquiry"} — Veloura`);
      fd.append("message",   body);
      fd.append("inquiryId", inquiry._id);
      files.forEach((f) => fd.append("attachments", f));

      await axios.post(`${BASE_URL}/admin/inquiry/reply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSent(true);
      setBody("");
      setFiles([]);
      setTimeout(() => { setSent(false); onSent && onSent(); }, 1800);
    } catch (err) {
      setError("Failed to send reply. Please try again.");
      console.error("[ReplyComposer]", err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: "#fafbff", border: "1px solid #e4e6f0",
      borderRadius: "16px", overflow: "hidden", marginTop: "20px",
    }}>
      {/* header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #e4e6f0",
        display: "flex", alignItems: "center", gap: "8px", background: "white",
      }}>
        <Mail size={13} color="#9088b8" />
        <span style={{ fontSize: "12px", color: "#9088b8", fontFamily: "DM Sans, sans-serif" }}>Reply to</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a2030", fontFamily: "DM Sans, sans-serif" }}>
          {inquiry.email}
        </span>
      </div>

      {/* textarea */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Write your reply to ${inquiry.firstName} ${inquiry.lastName}…`}
        rows={5}
        style={{
          width: "100%", border: "none", outline: "none", padding: "16px",
          fontFamily: "DM Sans, sans-serif", fontSize: "13px", color: "#1a2030",
          background: "transparent", resize: "vertical", lineHeight: 1.6,
          boxSizing: "border-box",
        }}
      />

      {/* attached files */}
      {files.length > 0 && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#f0f0f8", borderRadius: "8px",
              padding: "4px 10px", fontSize: "11px", color: "#3a3a7a",
              fontFamily: "DM Sans, sans-serif",
            }}>
              <Paperclip size={11} />
              <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </span>
              <span style={{ color: "#9088b8" }}>{fmt_size(f.size)}</span>
              <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={11} color="#a32d2d" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p style={{ padding: "0 16px 10px", fontSize: "12px", color: "#a32d2d", fontFamily: "DM Sans, sans-serif" }}>
          {error}
        </p>
      )}

      {/* action bar */}
      <div style={{
        padding: "10px 16px", borderTop: "1px solid #e4e6f0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx"
            style={{ display: "none" }} onChange={pickFiles} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 12px", borderRadius: "10px",
              border: "1px solid #e0dff0", background: "white",
              cursor: "pointer", fontSize: "12px",
              color: "#7a8aa8", fontFamily: "DM Sans, sans-serif", fontWeight: 500,
            }}
          >
            <Paperclip size={13} /> Attach
          </button>
          <span style={{ fontSize: "11px", color: "#9088b8", fontFamily: "DM Sans, sans-serif" }}>
            {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} attached` : "images, PDFs, docs"}
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 20px", borderRadius: "12px", border: "none",
            cursor: sending || !body.trim() ? "not-allowed" : "pointer",
            background: sent ? "#eaf3de" : "#1a0a2e",
            color: sent ? "#3b6d11" : "white",
            fontSize: "13px", fontWeight: 600, fontFamily: "DM Sans, sans-serif",
            opacity: !body.trim() && !sending ? 0.45 : 1,
            transition: "all 0.2s",
          }}
        >
          {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            : sent ? <Check size={14} />
            : <Send size={14} />}
          {sending ? "Sending…" : sent ? "Sent!" : "Send Reply"}
        </button>
      </div>
    </div>
  );
};

// ─── INQUIRY CARD ─────────────────────────────────────────────────────────────
const InquiryCard = ({ inquiry, expanded, onToggle, onReplied }) => {
  const sc = subjectStyle(inquiry.subject);

  return (
    <div style={{
      background: "white",
      border: `1px solid ${expanded ? "#c8c4d8" : "#e4e6f0"}`,
      borderRadius: "18px", overflow: "hidden", marginBottom: "10px",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: expanded ? "0 4px 24px rgba(26,10,46,0.07)" : "none",
    }}>
      {/* card header */}
      <div onClick={onToggle} style={{
        padding: "18px 22px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "14px",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          background: "#ede9f8", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: 700, color: "#5b3ea6",
          fontFamily: "DM Sans, sans-serif",
        }}>
          {(inquiry.firstName?.[0] || "?").toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a2030", fontFamily: "DM Sans, sans-serif" }}>
              {inquiry.firstName} {inquiry.lastName}
            </span>
            <span style={{
              background: sc.bg, color: sc.color,
              fontSize: "10px", fontWeight: 700,
              padding: "2px 9px", borderRadius: "6px",
              textTransform: "uppercase", letterSpacing: "0.06em",
              fontFamily: "DM Sans, sans-serif",
            }}>
              {inquiry.subject || "General"}
            </span>
          </div>
          <p style={{
            fontSize: "12px", color: "#9088b8", margin: 0,
            fontFamily: "DM Sans, sans-serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            maxWidth: "480px",
          }}>
            {inquiry.message}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", color: "#9088b8", fontFamily: "DM Sans, sans-serif" }}>
            {fmt(inquiry.createdAt)} {fmtTime(inquiry.createdAt)}
          </span>
          {expanded ? <ChevronDown size={15} color="#9088b8" /> : <ChevronRight size={15} color="#9088b8" />}
        </div>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #f0f0f8" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", padding: "14px 0", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Mail size={12} color="#9088b8" />
              <span style={{ fontSize: "13px", color: "#1a2030", fontFamily: "DM Sans, sans-serif" }}>
                {inquiry.email}
              </span>
            </div>
          </div>

          <div style={{
            background: "#f8f7fc", border: "1px solid #ede9f8",
            borderRadius: "12px", padding: "16px 18px",
            fontSize: "14px", color: "#1a2030", lineHeight: 1.7,
            fontFamily: "DM Sans, sans-serif", whiteSpace: "pre-wrap",
          }}>
            {inquiry.message}
          </div>

          <ReplyComposer inquiry={inquiry} onSent={onReplied} />
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const VelouraInquiries = () => {
  const [inquiries,     setInquiries]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [expandedId,    setExpandedId]    = useState(null);
  const [pendingCount,  setPendingCount]  = useState(0);
  const [subjectFilter, setSubjectFilter] = useState("all");

  const SUBJECTS = ["all", "General Inquiry", "Order Status", "Styling Advice", "Bespoke Request", "Press & Media"];

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setInquiries([]);
    setExpandedId(null);
    try {
      const res = await axios.get(`${BASE_URL}/admin/inquiries/pending`);
      const data = res.data.inquiries || res.data || [];
      setInquiries(data);
      setPendingCount(data.length);
    } catch (err) {
      console.error("[fetchInquiries]", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = inquiries.filter((inq) => {
    const matchSearch =
      `${inq.firstName} ${inq.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      inq.email?.toLowerCase().includes(search.toLowerCase()) ||
      inq.message?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "all" || inq.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@300;400;500;700&display=swap');
        .inq-layout { display:flex; min-height:100vh; background:linear-gradient(135deg,#e8eaf6 0%,#f3e5f5 40%,#e8eaf6 100%); font-family:'DM Sans',sans-serif; }
        .inq-sidebar { width:260px; flex-shrink:0; position:sticky; top:0; height:100vh; background:rgba(255,255,255,0.4); backdrop-filter:blur(10px); border-right:1px solid rgba(220,215,235,0.5); }
        .inq-main { flex:1; padding:40px; overflow-y:auto; }
        .subj-pill { padding:5px 13px; border-radius:100px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid #e0dff0; background:white; color:#7a8aa8; font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap; }
        .subj-pill:hover { border-color:#9088b8; color:#1a0a2e; }
        .subj-pill.active { background:#f3e5f5; color:#7b1fa2; border-color:#c9a0dc; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="inq-layout">
        <aside className="inq-sidebar">
          <VelouraAdminNavbar currentPage="Inquiries" />
        </aside>

        <main className="inq-main">

          {/* PAGE HEADER */}
          <div style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ color: "#9088b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px", fontFamily: "DM Sans, sans-serif" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#0d1020", margin: 0, fontWeight: 600 }}>
                Inquiries
              </h1>
              <p style={{ color: "#9088b8", fontSize: "13px", margin: "4px 0 0", fontFamily: "DM Sans, sans-serif" }}>
                {pendingCount} pending
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", borderRadius: "12px", border: "1px solid #e0dff0", background: "white", cursor: "pointer", fontSize: "13px", color: "#7a8aa8", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* SEARCH + SUBJECT FILTERS */}
          <div style={{
            background: "white", border: "1px solid #e4e6f0",
            borderRadius: "18px", padding: "16px 20px", marginBottom: "18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <Search size={15} color="#9088b8" />
              <input
                type="text"
                placeholder="Search by name, email or message…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, border: "none", outline: "none",
                  fontSize: "13px", fontFamily: "DM Sans, sans-serif",
                  color: "#1a2030", background: "transparent",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <X size={14} color="#9088b8" />
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SUBJECTS.map((s) => (
                <button key={s} className={`subj-pill ${subjectFilter === s ? "active" : ""}`} onClick={() => setSubjectFilter(s)}>
                  {s === "all" ? "All subjects" : s}
                </button>
              ))}
            </div>
          </div>

          {/* RESULT COUNT */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
            <AlertCircle size={13} color="#d97706" />
            <span style={{ fontSize: "13px", color: "#9088b8", fontFamily: "DM Sans, sans-serif" }}>
              {filtered.length} inquiry{filtered.length !== 1 ? "ies" : "y"} found
            </span>
          </div>

          {/* INQUIRY LIST */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Loader2 size={26} color="#9088b8" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f0f0f8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Mail size={22} color="#9088b8" />
              </div>
              <p style={{ fontSize: "15px", color: "#1a2030", fontWeight: 600, fontFamily: "DM Sans, sans-serif", margin: "0 0 6px" }}>
                No pending inquiries
              </p>
              <p style={{ fontSize: "13px", color: "#9088b8", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
                {search ? `Nothing matching "${search}"` : "All clear here."}
              </p>
            </div>
          ) : (
            filtered.map((inq) => (
              <InquiryCard
                key={inq._id}
                inquiry={inq}
                expanded={expandedId === inq._id}
                onToggle={() => setExpandedId((prev) => prev === inq._id ? null : inq._id)}
                onReplied={fetchInquiries}
              />
            ))
          )}

        </main>
      </div>
    </>
  );
};

export default VelouraInquiries;