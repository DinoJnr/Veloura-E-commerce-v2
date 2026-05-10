import React, { useState, useEffect } from "react";
import {
  Search, Eye, Check, X, AlertCircle,
  ChevronLeft, ChevronRight, Loader2,
  User, Package, RefreshCcw, Hash, FileText,
  DollarSign, Clock, ArrowRight
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";


const ReturnModal = ({ order, onClose }) => {
  if (!order) return null;

  const requestedAt = order.requestedAt || order.createdAt
    ? new Date(order.requestedAt || order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  const statusColors = {
    Pending:      { bg: "#fff4e6", color: "#d97706" },
    Approved:     { bg: "#eaf3de", color: "#3b6d11" },
    Rejected:     { bg: "#fcebeb", color: "#a32d2d" },
    "In Transit": { bg: "#e8f0fe", color: "#1a56db" },
    Received:     { bg: "#e0f2fe", color: "#0369a1" },
    Refunded:     { bg: "#f0fdf4", color: "#15803d" },
  };
  const sc = statusColors[order.returnStatus] || statusColors.Pending;

  return (
    <>
      <style>{`
        .rmodal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(10, 20, 30, 0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: flex-end;
          animation: rOverlayIn 0.2s ease;
        }
        @keyframes rOverlayIn { from { opacity: 0 } to { opacity: 1 } }

        .rmodal-drawer {
          width: 580px; height: 100vh; background: #ffffff;
          overflow-y: auto; display: flex; flex-direction: column;
          animation: rSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.15);
        }
        @keyframes rSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }

        .rmodal-head {
          background: linear-gradient(135deg, #1a0a2e 0%, #0d1f2e 100%);
          padding: 28px 32px 24px;
          position: sticky; top: 0; z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .rmodal-section { padding: 24px 32px; border-bottom: 1px solid #f0f4f8; }
        .rmodal-section:last-child { border-bottom: none; }

        .rsec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #7a8aa8;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .rinfo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rinfo-cell label {
          font-size: 10px; color: #aab4c4; text-transform: uppercase;
          letter-spacing: 0.1em; display: block; margin-bottom: 3px;
        }
        .rinfo-cell p { font-size: 13px; color: #1a2030; font-weight: 500; margin: 0; }

        .ritem-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f5f7fa;
        }
        .ritem-row:last-child { border-bottom: none; }
        .ritem-img {
          width: 50px; height: 60px; object-fit: cover;
          border-radius: 8px; border: 1px solid #e8edf4; flex-shrink: 0;
        }
        .ritem-placeholder {
          width: 50px; height: 60px; border-radius: 8px;
          background: #f0f4f8; border: 1px solid #e8edf4;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rtotal-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #1a0a2e; margin-top: 8px;
        }
        .reason-pill {
          display: inline-block; background: #f0f4f8; color: #3a4a6a;
          font-size: 12px; font-weight: 600; padding: 6px 14px;
          border-radius: 100px; border: 1px solid #e0e8f0;
        }
        .note-box {
          background: #f8fafc; border: 1px solid #e8edf4; border-radius: 12px;
          padding: 14px; font-size: 13px; color: #4a5568; line-height: 1.6;
          font-style: italic; margin-top: 8px;
        }
      `}</style>

      <div className="rmodal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rmodal-drawer">

          {/* HEAD */}
          <div className="rmodal-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(180,160,220,0.7)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                  Return Request
                </p>
                <h2 style={{ color: "#f0f4f8", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", margin: 0, fontWeight: 600 }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(200,210,230,0.45)", fontSize: "11px", margin: "5px 0 0", fontFamily: "monospace" }}>
                  Requested: {requestedAt}
                </p>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: sc.bg, color: sc.color, fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {order.returnStatus || "Pending"}
              </span>
              {order.refundAmount > 0 && (
                <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(180,220,180,0.75)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                  Refund: ₦{Number(order.refundAmount).toLocaleString()}
                </span>
              )}
              {order.refundMethod && (
                <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(200,210,230,0.5)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                  via {order.refundMethod}
                </span>
              )}
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rmodal-section">
            <p className="rsec-title"><User size={12} /> Customer Details</p>
            <div className="rinfo-grid">
              <div className="rinfo-cell">
                <label>Full Name</label>
                <p>{order.customer?.fullName || "—"}</p>
              </div>
              <div className="rinfo-cell">
                <label>Email</label>
                <p style={{ wordBreak: "break-all", fontSize: "12px" }}>{order.customer?.email || "—"}</p>
              </div>
              <div className="rinfo-cell">
                <label>Phone</label>
                <p>{order.customer?.phone || "—"}</p>
              </div>
              <div className="rinfo-cell">
                <label>City</label>
                <p>{order.customer?.city || "—"}</p>
              </div>
              <div className="rinfo-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Address</label>
                <p>
                  {order.customer?.address || "—"}
                  {order.customer?.state ? `, ${order.customer.state}` : ""}
                  {order.customer?.country ? `, ${order.customer.country}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* RETURN REASON & NOTE */}
          <div className="rmodal-section">
            <p className="rsec-title"><FileText size={12} /> Return Reason</p>
            <span className="reason-pill">{order.reason || "—"}</span>
            {order.note && (
              <div className="note-box">"{order.note}"</div>
            )}
          </div>

          {/* RETURN ITEMS */}
          <div className="rmodal-section">
            <p className="rsec-title"><Package size={12} /> Items to Return ({order.returnItems?.length || 0})</p>
            {order.returnItems?.map((item, i) => (
              <div key={i} className="ritem-row">
                {item.image
                  ? <img src={item.image} alt={item.name} className="ritem-img" />
                  : <div className="ritem-placeholder"><Package size={16} color="#7a8aa8" /></div>
                }
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2030", margin: "0 0 3px" }}>{item.name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#7a8aa8", margin: 0 }}>
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " · "}
                    {item.color && `Colour: ${item.color}`}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2030", margin: "0 0 2px" }}>
                    ₦{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "#7a8aa8", margin: 0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            {order.refundAmount > 0 && (
              <div className="rtotal-line">
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a2030", textTransform: "uppercase", letterSpacing: "0.1em" }}>Refund Amount</span>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 600, color: "#1a0a2e" }}>
                  ₦{Number(order.refundAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};


const ConfirmDialog = ({ type, next, orderIds, onConfirm, onCancel, loading }) => {
  const isApprove = type === "approve";
  const isSettle  = type === "settle";
  const isBulk    = orderIds.length > 1;

  const iconBg  = isSettle ? "#e8f0fe" : isApprove ? "#eaf3de" : "#fcebeb";
  const btnBg   = isSettle ? "#1a56db" : isApprove ? "#1a0a2e" : "#a32d2d";
  const icon    = isSettle
    ? <ArrowRight size={24} color="#1a56db" />
    : isApprove ? <Check size={24} color="#3b6d11" /> : <X size={24} color="#a32d2d" />;

  const title = isSettle
    ? `Move to ${next}?`
    : `${isApprove ? "Approve" : "Reject"} ${isBulk ? `${orderIds.length} Returns` : "Return"}?`;

  const body = isSettle
    ? `This will mark ${isBulk ? "these returns" : "this return"} as "${next}" and remove it from the current stage.`
    : isApprove
      ? "This will approve the return request(s) and initiate the refund process."
      : "This will reject the return request(s). This action cannot be undone.";

  const btnLabel = isSettle
    ? `Yes, Move to ${next}`
    : isApprove ? "Yes, Approve" : "Yes, Reject";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(10,15,30,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "400px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.14)", animation: "rOverlayIn 0.2s ease" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#0d1020", margin: "0 0 10px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "13px", color: "#7a8aa8", margin: "0 0 28px", lineHeight: 1.6 }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #e8edf4", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#7a8aa8" }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", background: btnBg, color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {loading ? "Processing..." : btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
};


const StatusBadge = ({ status }) => {
  const map = {
    Pending:      { bg: "#fff4e6", color: "#d97706" },
    Approved:     { bg: "#eaf3de", color: "#3b6d11" },
    Rejected:     { bg: "#fcebeb", color: "#a32d2d" },
    "In Transit": { bg: "#e8f0fe", color: "#1a56db" },
    Received:     { bg: "#e0f2fe", color: "#0369a1" },
    Refunded:     { bg: "#f0fdf4", color: "#15803d" },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
      {status || "Pending"}
    </span>
  );
};


const STATUS_ENDPOINTS = {
  Pending:      { get: "/order/returns/pending" },
  Approved:     { get: "/order/returns/approved",   settle: "/order/returns/settle-approved" },
  Rejected:     { get: "/order/returns/rejected" },
  "In Transit": { get: "/order/returns/in-transit", settle: "/order/returns/settle-transit"  },
  Received:     { get: "/order/returns/received",   settle: "/order/returns/settle-received" },
  Refunded:     { get: "/order/returns/refunded" },
};


const SETTLE_META = {
  Approved:     { label: "Mark In Transit", next: "In Transit" },
  "In Transit": { label: "Mark Received",   next: "Received"   },
  Received:     { label: "Mark Refunded",   next: "Refunded"   },
};

const BASE_URL = "http://localhost:5200";


const VelouraReturnPending = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedIds, setSelectedIds]     = useState([]);
  const [viewOrder, setViewOrder]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm]             = useState(null); // { type, ids, next? }
  const [currentPage, setCurrentPage]     = useState(1);
  const [statusFilter, setStatusFilter]   = useState("Pending");
  const [pendingCount, setPendingCount]   = useState(0);
  const PER_PAGE = 10;

  const STATUS_TABS = ["Pending", "Approved", "Rejected", "In Transit", "Received", "Refunded"];


  useEffect(() => { fetchReturns(statusFilter); }, [statusFilter]);

  // Keep badge count fresh on mount
  useEffect(() => { fetchPendingCount(); }, []);

  
  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/order/returns/pending`);
      const data = res.data.returns || res.data || [];
      setPendingCount(data.length);
    } catch (err) {
      console.error("Failed to fetch pending count:", err.message);
    }
  };


  const fetchReturns = async (status) => {
    const ep = STATUS_ENDPOINTS[status]?.get;
    if (!ep) return;
    try {
      setLoading(true);
      setOrders([]);
      const res = await axios.get(`${BASE_URL}${ep}`);
      setOrders(res.data.returns || res.data || []);
    } catch (err) {
      console.error(`Failed to fetch ${status} returns:`, err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (ids) => {
    try {
      setActionLoading(true);
      await axios.post(`${BASE_URL}/order/returns/approve`, { returnIds: ids });
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedIds([]);
      setConfirm(null);
      fetchPendingCount();
    } catch (err) {
      console.error("Approve failed:", err.message);
      alert("Failed to approve return(s). Please try again.");
    } finally {
      setActionLoading(false);
    }
  };


  const handleReject = async (ids) => {
    try {
      setActionLoading(true);
      await axios.post(`${BASE_URL}/order/returns/reject`, { returnIds: ids });
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedIds([]);
      setConfirm(null);
      fetchPendingCount();
    } catch (err) {
      console.error("Reject failed:", err.message);
      alert("Failed to reject return(s). Please try again.");
    } finally {
      setActionLoading(false);
    }
  };


  const handleSettle = async (returnId) => {
    const ep = STATUS_ENDPOINTS[statusFilter]?.settle;
    if (!ep) return;
    try {
      setActionLoading(true);
      await axios.post(`${BASE_URL}${ep}`, { returnId });
      // Remove the settled record from the current list immediately
      setOrders((prev) => prev.filter((o) => o._id !== returnId));
      setSelectedIds((prev) => prev.filter((id) => id !== returnId));
      setConfirm(null);
    } catch (err) {
      console.error("Settle failed:", err.message);
      alert("Failed to advance this return. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

 
  const filtered = orders.filter((o) =>
    o.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const toggleSelect    = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((o) => o._id));
  const formatDate      = (d) => d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  // Whether the active tab has a settle action
  const settleMeta = SETTLE_META[statusFilter];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@300;400;500;700&display=swap');

        .ret-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 40%, #e8eaf6 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .ret-sidebar {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(220,215,235,0.5);
        }
        .ret-main { flex: 1; padding: 40px; }

        .ret-table-card {
          background: #fff; border-radius: 32px;
          border: 1px solid rgba(220,215,235,0.6);
          overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.03);
        }
        .r-table { width: 100%; border-collapse: collapse; }
        .r-table th {
          text-align: left; padding: 18px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #7a8aa8;
          background: #fcfcfe; border-bottom: 1px solid #f0f0f8;
          font-family: 'DM Sans', sans-serif;
        }
        .r-table td {
          padding: 18px 24px; border-bottom: 1px solid #f8f8fc;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          vertical-align: middle;
        }
        .r-table tr:hover td { background: #fafafe; }
        .r-table tr.selected td { background: #f5f0ff; }

        .raction-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, background 0.15s;
          border: none; flex-shrink: 0;
        }
        .raction-btn:hover { transform: scale(1.1); }
        .rbtn-view    { background: #f0f0f8; color: #3a3a7a; }
        .rbtn-approve { background: #eaf3de; color: #3b6d11; }
        .rbtn-reject  { background: #fcebeb; color: #a32d2d; }

        /* ── Settle pill button ── */
        .settle-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 100px; border: none;
          background: #e8f0fe; color: #1a56db;
          font-size: 11px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.03em;
          transition: background 0.15s, transform 0.15s; white-space: nowrap;
        }
        .settle-pill:hover { background: #c7d9fd; transform: scale(1.03); }

        .rglobal-btn {
          padding: 11px 22px; border-radius: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s; border: none;
        }
        .rglobal-approve { background: #1a0a2e; color: #f0eaff; }
        .rglobal-approve:hover { background: #2d1050; }
        .rglobal-approve:disabled { opacity: 0.4; cursor: not-allowed; }
        .rglobal-reject { background: white; color: #a32d2d; border: 1px solid #fcebeb !important; }
        .rglobal-reject:hover { background: #fcebeb; }
        .rglobal-reject:disabled { opacity: 0.4; cursor: not-allowed; }

        .rcheckbox-custom {
          width: 18px; height: 18px; border-radius: 6px; cursor: pointer;
          appearance: none; border: 2px solid #c8c4d8; background: white; transition: all 0.15s;
        }
        .rcheckbox-custom:checked { background: #1a0a2e; border-color: #1a0a2e; }

        .status-tab {
          padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
        }
        .status-tab.active { background: #1a0a2e; color: white; border-color: #1a0a2e; }
        .status-tab.inactive { background: white; color: #7a8aa8; border-color: #e0dff0; }
        .status-tab.inactive:hover { border-color: #1a0a2e; color: #1a0a2e; }

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes rOverlayIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      <div className="ret-layout">
        <aside className="ret-sidebar">
          <VelouraAdminNavbar currentPage="Return Orders" />
        </aside>

        <main className="ret-main">

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <p style={{ color: "#9088b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#0d1020", margin: 0 }}>
                Return Requests
              </h1>
              <p style={{ color: "#9088b8", fontSize: "13px", margin: "4px 0 0" }}>
                {pendingCount} return{pendingCount !== 1 ? "s" : ""} awaiting review
              </p>
            </div>

            {/* Bulk approve/reject only shown on Pending tab */}
            {statusFilter === "Pending" && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {selectedIds.length > 0 && (
                  <span style={{ fontSize: "12px", color: "#9088b8", marginRight: "4px" }}>
                    {selectedIds.length} selected
                  </span>
                )}
                <button
                  className="rglobal-btn rglobal-reject"
                  disabled={selectedIds.length === 0}
                  onClick={() => setConfirm({ type: "reject", ids: selectedIds })}
                >
                  <X size={15} /> Reject Selected
                </button>
                <button
                  className="rglobal-btn rglobal-approve"
                  disabled={selectedIds.length === 0}
                  onClick={() => setConfirm({ type: "approve", ids: selectedIds })}
                >
                  <Check size={15} /> Approve Selected
                </button>
              </div>
            )}
          </header>

          <div className="ret-table-card">

            {/* SEARCH + STATUS TABS */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f9f9fc", padding: "9px 16px", borderRadius: "12px", border: "1px solid #edeef8", width: "300px" }}>
                  <Search size={15} color="#9088b8" />
                  <input
                    type="text"
                    placeholder="Search customer, order ID or reason..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    style={{ border: "none", background: "transparent", marginLeft: "8px", outline: "none", width: "100%", fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                  />
                </div>
                <div style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
                  <AlertCircle size={15} />
                  {filtered.length} request{filtered.length !== 1 ? "s" : ""} found
                </div>
              </div>

              {/* Status filter tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`status-tab ${statusFilter === tab ? "active" : "inactive"}`}
                    onClick={() => {
                      setStatusFilter(tab);
                      setCurrentPage(1);
                      setSelectedIds([]);
                      setSearchTerm("");
                    }}
                  >
                    {tab}
                    {tab === "Pending" && pendingCount > 0 && (
                      <span style={{ marginLeft: "6px", background: statusFilter === "Pending" ? "rgba(255,255,255,0.25)" : "#1a0a2e", color: "white", fontSize: "10px", padding: "1px 6px", borderRadius: "100px" }}>
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <table className="r-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>
                    <input
                      type="checkbox"
                      className="rcheckbox-custom"
                      checked={paginated.length > 0 && selectedIds.length === paginated.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Items</th>
                  <th>Refund</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "56px" }}>
                      <Loader2 size={24} color="#9088b8" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => (
                    <tr key={order._id} className={selectedIds.includes(order._id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          className="rcheckbox-custom"
                          checked={selectedIds.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: "#0d1020", fontFamily: "monospace", fontSize: "13px" }}>
                        {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, color: "#1a2030", margin: "0 0 2px", fontSize: "14px" }}>
                          {order.customer?.fullName || "—"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#9088b8", margin: 0 }}>
                          {order.customer?.email || ""}
                        </p>
                      </td>
                      <td>
                        <span style={{ background: "#f0f0f8", color: "#3a3a7a", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "6px", display: "inline-block", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {order.reason || "—"}
                        </span>
                      </td>
                      <td style={{ color: "#9088b8", fontSize: "13px" }}>
                        {order.returnItems?.length || 0} item{(order.returnItems?.length || 0) !== 1 ? "s" : ""}
                      </td>
                      <td style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "#0d1020" }}>
                        {order.refundAmount > 0 ? `₦${Number(order.refundAmount).toLocaleString()}` : "—"}
                      </td>
                      <td style={{ color: "#9088b8", fontSize: "13px" }}>
                        {formatDate(order.requestedAt || order.createdAt)}
                      </td>
                      <td>
                        <StatusBadge status={order.returnStatus} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>

                          {/* VIEW — always visible */}
                          <button
                            className="raction-btn rbtn-view"
                            title="View Details"
                            onClick={() => setViewOrder(order)}
                          >
                            <Eye size={15} />
                          </button>

                          {/* APPROVE / REJECT — Pending tab only */}
                          {statusFilter === "Pending" && (
                            <>
                              <button
                                className="raction-btn rbtn-approve"
                                title="Approve Return"
                                onClick={() => setConfirm({ type: "approve", ids: [order._id] })}
                              >
                                <Check size={15} />
                              </button>
                              <button
                                className="raction-btn rbtn-reject"
                                title="Reject Return"
                                onClick={() => setConfirm({ type: "reject", ids: [order._id] })}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}

                          {/* SETTLE PILL — Approved / In Transit / Received tabs */}
                          {settleMeta && (
                            <button
                              className="settle-pill"
                              title={settleMeta.label}
                              onClick={() => setConfirm({ type: "settle", ids: [order._id], next: settleMeta.next })}
                            >
                              <ArrowRight size={12} />
                              {settleMeta.label}
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "56px", color: "#9088b8" }}>
                      {searchTerm
                        ? `No returns matching "${searchTerm}"`
                        : `No ${statusFilter.toLowerCase()} return requests — all clear! ✅`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: "20px 24px", background: "#fcfcfe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#9088b8" }}>
                {filtered.length > 0
                  ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : "No returns"}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #edeef8", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  ←
                </button>
                <span style={{ padding: "8px 14px", borderRadius: "10px", background: "#1a0a2e", color: "white", fontSize: "13px", fontWeight: 500 }}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #edeef8", background: "white", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* VIEW MODAL */}
      {viewOrder && <ReturnModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {/* CONFIRM DIALOG */}
      {confirm && (
        <ConfirmDialog
          type={confirm.type}
          next={confirm.next}
          orderIds={confirm.ids}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === "approve") return handleApprove(confirm.ids);
            if (confirm.type === "reject")  return handleReject(confirm.ids);
            if (confirm.type === "settle")  return handleSettle(confirm.ids[0]);
          }}
        />
      )}
    </>
  );
};

export default VelouraReturnPending;