import React, { useState, useEffect } from "react";
import {
  Search, Eye, X,
  ChevronLeft, ChevronRight, Loader2,
  User, Package, CreditCard, AlertTriangle,
  RotateCcw, BadgeCheck
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const API = "http://localhost:5200";

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onRefund, refundedIds }) => {
  if (!order) return null;

  const isRefunded = refundedIds.includes(order._id);

  const orderDate = order.orderDate || order.createdAt
    ? new Date(order.orderDate || order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <>
      <style>{`
        .rfd-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(10, 30, 40, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: flex-end;
          animation: rfdOverlayIn 0.2s ease;
        }
        @keyframes rfdOverlayIn { from { opacity: 0 } to { opacity: 1 } }
        .rfd-drawer {
          width: 560px; height: 100vh; background: #ffffff;
          overflow-y: auto; display: flex; flex-direction: column;
          animation: rfdSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.12);
        }
        @keyframes rfdSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .rfd-modal-head {
          background: linear-gradient(145deg, #0a1e28 0%, #0d2535 100%);
          padding: 28px 32px 24px;
          position: sticky; top: 0; z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .rfd-section { padding: 24px 32px; border-bottom: 1px solid #f0f5f7; }
        .rfd-section:last-child { border-bottom: none; }
        .rfd-sec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #7a9aaa;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .rfd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rfd-info-cell label {
          font-size: 10px; color: #9ab0ba; text-transform: uppercase;
          letter-spacing: 0.1em; display: block; margin-bottom: 3px;
        }
        .rfd-info-cell p { font-size: 13px; color: #1a2e38; font-weight: 500; margin: 0; }
        .rfd-item-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f5f9fa;
        }
        .rfd-item-row:last-child { border-bottom: none; }
        .rfd-total-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #0a1e28; margin-top: 8px;
        }
        .rfd-refund-btn {
          flex: 1; padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #0a7c5c 0%, #0d9a70 100%);
          color: white; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(10,124,92,0.3);
        }
        .rfd-refund-btn:hover { background: linear-gradient(135deg, #096b4f 0%, #0b8862 100%); transform: translateY(-1px); }
        .rfd-refund-btn:disabled { background: #c8e6df; color: #6abba0; cursor: not-allowed; box-shadow: none; transform: none; }
        .rfd-refunded-badge {
          flex: 1; padding: 13px; border-radius: 12px;
          background: #ecfdf5; border: 1.5px solid #6ee7b7;
          color: #065f46; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
      `}</style>

      <div className="rfd-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rfd-drawer">

          {/* HEAD */}
          <div className="rfd-modal-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(100,200,180,0.6)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                  Refund Management
                </p>
                <h2 style={{ color: "#e8f4f8", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", margin: 0, fontWeight: 600 }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(160,210,220,0.4)", fontSize: "11px", margin: "5px 0 0", fontFamily: "monospace" }}>
                  Ref: {order.paymentReference || "—"}
                </p>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
              {isRefunded ? (
                <span style={{ background: "#d1fae5", color: "#065f46", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ✓ Refunded
                </span>
              ) : (
                <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Awaiting Refund
                </span>
              )}
              <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(180,210,220,0.5)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                {orderDate}
              </span>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rfd-section">
            <p className="rfd-sec-title"><User size={12} /> Customer Details</p>
            <div className="rfd-info-grid">
              <div className="rfd-info-cell"><label>Full Name</label><p>{order.customer?.fullName || "—"}</p></div>
              <div className="rfd-info-cell"><label>Email</label><p style={{ wordBreak: "break-all", fontSize: "12px" }}>{order.customer?.email || "—"}</p></div>
              <div className="rfd-info-cell"><label>Phone</label><p>{order.customer?.phone || "—"}</p></div>
              <div className="rfd-info-cell"><label>City</label><p>{order.customer?.city || "—"}</p></div>
              <div className="rfd-info-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Dispatch Address</label>
                <p>
                  {order.customer?.address || "—"}
                  {order.customer?.state ? `, ${order.customer.state}` : ""}
                  {order.customer?.country ? `, ${order.customer.country}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="rfd-section">
            <p className="rfd-sec-title"><Package size={12} /> Order Items ({order.items?.length || 0})</p>
            {order.items?.map((item, i) => (
              <div key={i} className="rfd-item-row">
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: "50px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8f0f2", flexShrink: 0 }} />
                  : <div style={{ width: "50px", height: "60px", borderRadius: "8px", background: "#f0f7fa", border: "1px solid #e0edf2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package size={16} color="#7a9aaa" />
                    </div>
                }
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e38", margin: "0 0 3px" }}>{item.name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#7a9aaa", margin: 0 }}>
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " · "}
                    {item.color && `Colour: ${item.color}`}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e38", margin: "0 0 2px" }}>
                    ₦{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "#7a9aaa", margin: 0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            <div className="rfd-total-line">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a2e38", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Refund</span>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 600, color: "#0a1e28" }}>
                ₦{Number(order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="rfd-section">
            <p className="rfd-sec-title"><CreditCard size={12} /> Payment Info</p>
            <div className="rfd-info-grid">
              <div className="rfd-info-cell"><label>Payment Status</label><p>{order.paymentStatus || "—"}</p></div>
              <div className="rfd-info-cell"><label>Total Amount</label><p>₦{Number(order.totalAmount || 0).toLocaleString()}</p></div>
              <div className="rfd-info-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Payment Reference</label>
                <p style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.paymentReference || "—"}</p>
              </div>
            </div>
          </div>

          {/* REFUND ACTION */}
          <div className="rfd-section">
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #e0edf2", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#7a9aaa" }}>
                Close
              </button>
              {isRefunded ? (
                <div className="rfd-refunded-badge">
                  <BadgeCheck size={16} /> Refund Processed
                </div>
              ) : (
                <button className="rfd-refund-btn" onClick={() => onRefund(order)}>
                  <RotateCcw size={14} /> Process Refund
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ count, onConfirm, onCancel, loading }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(10,30,40,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "420px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.14)" }}>
      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <RotateCcw size={24} color="#065f46" />
      </div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", color: "#0a1e28", margin: "0 0 10px" }}>
        Process Refund{count > 1 ? `s` : ""}?
      </h3>
      <p style={{ fontSize: "13px", color: "#7a9aaa", margin: "0 0 8px", lineHeight: 1.65 }}>
        This will move the order{count > 1 ? "s" : ""} to the Refund Archive and send a refund confirmation email to the customer{count > 1 ? "s" : ""}.
      </p>
      <p style={{ fontSize: "12px", color: "#b0c8d0", margin: "0 0 28px" }}>
        {count > 1 ? `${count} orders selected` : "1 order selected"}
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #e0edf2", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#7a9aaa" }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", background: loading ? "#a7d9c8" : "linear-gradient(135deg, #0a7c5c 0%, #0d9a70 100%)", color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: loading ? "none" : "0 4px 16px rgba(10,124,92,0.3)" }}
        >
          {loading && <Loader2 size={14} style={{ animation: "rfdspin 1s linear infinite" }} />}
          {loading ? "Processing..." : "Yes, Refund"}
        </button>
      </div>
    </div>
  </div>
);


const VelouraRefund = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedIds, setSelectedIds]   = useState([]);
  const [viewOrder, setViewOrder]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm]           = useState(null); 
  const [refundedIds, setRefundedIds]   = useState([]); 
  const [currentPage, setCurrentPage]   = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchRejected(); }, []);

  const fetchRejected = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/order/rejectedrefund`);
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error("Failed to fetch rejected orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const filtered = orders.filter((o) =>
    o.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  
  const toggleSelect    = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((o) => o._id));



  const handleRefund = async (orderIds) => {
    try {
      setActionLoading(true);
      await axios.post(`${API}/order/refund-rejected`, { orderIds });
      setOrders((prev) => prev.filter((o) => !orderIds.includes(o._id)));
      setRefundedIds((prev) => [...prev, ...orderIds]);
      setSelectedIds([]);
      setConfirm(null);
      setViewOrder(null);
    } catch (err) {
      console.error("Refund failed:", err.message);
      alert("Failed to process refund(s). Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  
  const triggerRefundSingle = (order) => {
    setViewOrder(null);
    setConfirm({ orderIds: [order._id] });
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .rfd-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #eef5f8 0%, #f4f9fb 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .rfd-sidebar {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255,255,255,0.45); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(180,210,220,0.4);
        }
        .rfd-main { flex: 1; padding: 40px; overflow-y: auto; }

        .rfd-table-card {
          background: #fff; border-radius: 32px;
          border: 1px solid rgba(180,210,220,0.5);
          overflow: hidden; box-shadow: 0 10px 40px rgba(10,50,70,0.05);
        }
        .rfd-table { width: 100%; border-collapse: collapse; }
        .rfd-table th {
          text-align: left; padding: 18px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #7a9aaa;
          background: #f8fbfc; border-bottom: 1px solid #edf3f5;
          font-family: 'DM Sans', sans-serif;
        }
        .rfd-table td {
          padding: 18px 24px; border-bottom: 1px solid #f5f9fa;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          vertical-align: middle;
        }
        .rfd-table tr:hover td { background: #f5fbfc; }
        .rfd-table tr.rfd-selected td { background: #edfaf5; }

        .rfd-action-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, background 0.15s;
          border: none; flex-shrink: 0;
        }
        .rfd-action-btn:hover { transform: scale(1.1); }
        .btn-view    { background: #f0f5f7; color: #2a5066; }
        .btn-refund  { background: #d1fae5; color: #065f46; }
        .btn-refunded { background: #ecfdf5; color: #6abba0; cursor: default !important; }

        .rfd-global-btn {
          padding: 11px 22px; border-radius: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s; border: none;
        }
        .rfd-global-refund {
          background: linear-gradient(135deg, #0a7c5c 0%, #0d9a70 100%);
          color: white; box-shadow: 0 4px 16px rgba(10,124,92,0.2);
        }
        .rfd-global-refund:hover { background: linear-gradient(135deg, #096b4f, #0b8862); transform: translateY(-1px); }
        .rfd-global-refund:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .rfd-checkbox {
          width: 18px; height: 18px; border-radius: 6px; cursor: pointer;
          appearance: none; border: 2px solid #b8d0da; background: white; transition: all 0.15s;
        }
        .rfd-checkbox:checked { background: #0a7c5c; border-color: #0a7c5c; }

        @keyframes rfdspin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="rfd-layout">
        <aside className="rfd-sidebar">
          <VelouraAdminNavbar currentPage="Refunds" />
        </aside>

        <main className="rfd-main">

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <p style={{ color: "#7a9aaa", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#0a1e28", margin: 0 }}>
                Refund Management
              </h1>
              <p style={{ color: "#7a9aaa", fontSize: "13px", margin: "4px 0 0" }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} pending refund
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selectedIds.length > 0 && (
                <span style={{ fontSize: "12px", color: "#7a9aaa", marginRight: "4px" }}>
                  {selectedIds.length} selected
                </span>
              )}
              <button
                className="rfd-global-btn rfd-global-refund"
                disabled={selectedIds.length === 0 || actionLoading}
                onClick={() => setConfirm({ orderIds: selectedIds })}
              >
                <RotateCcw size={15} /> Refund Selected
              </button>
            </div>
          </header>

          <div className="rfd-table-card">

            {/* SEARCH BAR */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #edf3f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#f5fafc", padding: "9px 16px", borderRadius: "12px", border: "1px solid #e0edf2", width: "300px" }}>
                <Search size={15} color="#7a9aaa" />
                <input
                  type="text"
                  placeholder="Search customer, order ID or ref..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: "none", background: "transparent", marginLeft: "8px", outline: "none", width: "100%", fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                />
              </div>
              <div style={{ color: "#0a7c5c", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
                <AlertTriangle size={15} />
                {filtered.length} order{filtered.length !== 1 ? "s" : ""} to refund
              </div>
            </div>

            {/* TABLE */}
            <table className="rfd-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>
                    <input
                      type="checkbox"
                      className="rfd-checkbox"
                      checked={paginated.length > 0 && selectedIds.length === paginated.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Rejected On</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "56px" }}>
                      <Loader2 size={24} color="#7a9aaa" style={{ animation: "rfdspin 1s linear infinite", display: "inline-block" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => {
                    const isRefunded = refundedIds.includes(order._id);
                    return (
                      <tr key={order._id} className={selectedIds.includes(order._id) ? "rfd-selected" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="rfd-checkbox"
                            checked={selectedIds.includes(order._id)}
                            onChange={() => toggleSelect(order._id)}
                            disabled={isRefunded}
                          />
                        </td>
                        <td style={{ fontWeight: 700, color: "#0a1e28", fontFamily: "monospace", fontSize: "13px" }}>
                          {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                        </td>
                        <td>
                          <p style={{ fontWeight: 600, color: "#1a2e38", margin: "0 0 2px", fontSize: "14px" }}>
                            {order.customer?.fullName || "—"}
                          </p>
                          <p style={{ fontSize: "12px", color: "#7a9aaa", margin: 0 }}>
                            {order.customer?.email || ""}
                          </p>
                        </td>
                        <td style={{ color: "#7a9aaa", fontSize: "13px" }}>
                          {formatDate(order.createdAt || order.orderDate)}
                        </td>
                        <td style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "#0a1e28" }}>
                          ₦{Number(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td>
                          {isRefunded ? (
                            <span style={{ background: "#d1fae5", color: "#065f46", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              ✓ Refunded
                            </span>
                          ) : (
                            <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {order.paymentStatus || "Rejected"}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            {/* VIEW */}
                            <button className="rfd-action-btn btn-view" title="View Details" onClick={() => setViewOrder(order)}>
                              <Eye size={15} />
                            </button>
                            {/* REFUND / REFUNDED */}
                            {isRefunded ? (
                              <button className="rfd-action-btn btn-refunded" title="Already Refunded" disabled>
                                <BadgeCheck size={15} />
                              </button>
                            ) : (
                              <button
                                className="rfd-action-btn btn-refund"
                                title="Process Refund"
                                onClick={() => setConfirm({ orderIds: [order._id] })}
                              >
                                <RotateCcw size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "56px", color: "#7a9aaa" }}>
                      {searchTerm ? `No orders matching "${searchTerm}"` : "No orders pending refund ✅"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: "20px 24px", background: "#f8fbfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#7a9aaa" }}>
                {filtered.length > 0
                  ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : "No orders"}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e0edf2", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  ←
                </button>
                <span style={{ padding: "8px 14px", borderRadius: "10px", background: "#0a1e28", color: "white", fontSize: "13px", fontWeight: 500 }}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e0edf2", background: "white", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* VIEW MODAL */}
      {viewOrder && (
        <OrderModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onRefund={triggerRefundSingle}
          refundedIds={refundedIds}
        />
      )}

      {/* CONFIRM DIALOG */}
      {confirm && (
        <ConfirmDialog
          count={confirm.orderIds.length}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => handleRefund(confirm.orderIds)}
        />
      )}
    </>
  );
};

export default VelouraRefund;