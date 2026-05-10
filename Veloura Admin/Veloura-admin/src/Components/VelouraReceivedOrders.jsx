import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Eye, Download, Loader2,
  User, Package, CreditCard, CheckCircle2, X,
  ChevronLeft, ChevronRight, InboxIcon
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5200";
const PER_PAGE = 10;

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const fmtLong = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

// ─── ORDER DETAIL MODAL ────────────────────────────────────────────────────
const OrderModal = ({ order, onClose }) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!order) return null;

  return (
    <>
      <style>{`
        .mo-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8, 18, 8, 0.65);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: flex-end;
          animation: mo-fade 0.2s ease;
        }
        @keyframes mo-fade { from { opacity: 0 } to { opacity: 1 } }
        .mo-drawer {
          width: min(580px, 100vw); height: 100vh;
          background: #fff; overflow-y: auto;
          display: flex; flex-direction: column;
          animation: mo-slide 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: -24px 0 80px rgba(0,0,0,0.18);
        }
        @keyframes mo-slide { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .mo-head {
          background: #0a1a0a; padding: 28px 32px 22px;
          position: sticky; top: 0; z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mo-section { padding: 22px 32px; border-bottom: 1px solid #f0f5f0; }
        .mo-section:last-child { border-bottom: none; padding-bottom: 36px; }
        .mo-label {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: #7a9a7a;
          display: flex; align-items: center; gap: 7px; margin-bottom: 14px;
        }
        .mo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mo-cell label {
          font-size: 9px; color: #aabcaa; text-transform: uppercase;
          letter-spacing: 0.12em; display: block; margin-bottom: 3px;
        }
        .mo-cell p { font-size: 13px; color: #182618; font-weight: 500; margin: 0; }
        .mo-item {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 0; border-bottom: 1px solid #f5f8f5;
        }
        .mo-item:last-child { border-bottom: none; }
        .mo-img {
          width: 52px; height: 64px; object-fit: cover;
          border-radius: 10px; border: 1px solid #e8ede8; flex-shrink: 0;
        }
        .mo-img-ph {
          width: 52px; height: 64px; border-radius: 10px;
          background: #f0f5f0; border: 1px solid #e8ede8;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mo-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #0a1a0a; margin-top: 8px;
        }
      `}</style>

      <div className="mo-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="mo-drawer" role="dialog" aria-modal="true">

          {/* HEAD */}
          <div className="mo-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(180,148,90,0.65)", fontSize: "9.5px", letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 6px", fontWeight: 700 }}>
                  Received Order
                </p>
                <h2 style={{ color: "#edf4ed", fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: 0, fontWeight: 600, letterSpacing: "-0.01em" }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(180,210,180,0.38)", fontSize: "11px", margin: "4px 0 0", fontFamily: "monospace" }}>
                  Ref: {order.paymentReference || "—"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ background: "rgba(255,255,255,0.07)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: "14px", display: "flex", gap: "7px", flexWrap: "wrap" }}>
              <span style={{ background: "#e3f2e7", color: "#1a7832", fontSize: "9.5px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {order.paymentStatus || "Paid"}
              </span>
              <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(200,220,200,0.5)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                Ordered: {fmtLong(order.orderDate || order.createdAt)}
              </span>
              <span style={{ background: "rgba(30,120,52,0.22)", color: "#72cc8a", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                Received: {fmtLong(order.receivedAt)}
              </span>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="mo-section">
            <p className="mo-label"><User size={11} /> Customer Details</p>
            <div className="mo-grid">
              <div className="mo-cell"><label>Full Name</label><p>{order.customer?.fullName || "—"}</p></div>
              <div className="mo-cell"><label>Email</label><p style={{ wordBreak: "break-all", fontSize: "12px" }}>{order.customer?.email || "—"}</p></div>
              <div className="mo-cell"><label>Phone</label><p>{order.customer?.phone || "—"}</p></div>
              <div className="mo-cell"><label>City</label><p>{order.customer?.city || "—"}</p></div>
              <div className="mo-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Delivery Address</label>
                <p>
                  {[order.customer?.address, order.customer?.state, order.customer?.country]
                    .filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="mo-section">
            <p className="mo-label"><Package size={11} /> Order Items ({order.items?.length || 0})</p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="mo-item">
                {item.image
                  ? <img src={item.image} alt={item.name} className="mo-img" />
                  : <div className="mo-img-ph"><Package size={16} color="#88a088" /></div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#182618", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name || "—"}
                  </p>
                  <p style={{ fontSize: "11px", color: "#88a088", margin: 0 }}>
                    {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#182618", margin: "0 0 2px" }}>
                    ₦{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "#88a088", margin: 0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            <div className="mo-total">
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#182618", textTransform: "uppercase", letterSpacing: "0.12em" }}>Total</span>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: 600, color: "#0a1a0a" }}>
                ₦{Number(order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="mo-section">
            <p className="mo-label"><CreditCard size={11} /> Payment Info</p>
            <div className="mo-grid">
              <div className="mo-cell"><label>Payment Status</label><p>{order.paymentStatus || "—"}</p></div>
              <div className="mo-cell"><label>Total Amount</label><p>₦{Number(order.totalAmount || 0).toLocaleString()}</p></div>
              <div className="mo-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Payment Reference</label>
                <p style={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>{order.paymentReference || "—"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

const VelouraReceivedOrders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [viewOrder, setViewOrder]     = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReceived = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/order/received`);
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      setError("Failed to load received orders. Please try again.");
      console.error("Fetch received orders:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReceived(); }, [fetchReceived]);

  const handleExport = () => {
    const rows = [
      ["Order ID", "Customer", "Email", "Phone", "City", "Total Amount", "Payment Ref", "Payment Status", "Order Date", "Received Date"],
      ...orders.map((o) => [
        o.orderId || o._id,
        o.customer?.fullName || "",
        o.customer?.email || "",
        o.customer?.phone || "",
        o.customer?.city || "",
        o.totalAmount || 0,
        o.paymentReference || "",
        o.paymentStatus || "",
        o.orderDate || o.createdAt || "",
        o.receivedAt || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `veloura-received-orders-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filtered = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.orderId?.toLowerCase().includes(q) ||
      o.paymentReference?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .ro-layout {
          display: flex; min-height: 100vh;
          background: #eef6ee;
          font-family: 'DM Sans', sans-serif;
        }
        .ro-sidebar {
          width: 260px; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(14px);
          border-right: 1px solid rgba(200,220,200,0.4);
        }
        .ro-main { flex: 1; padding: 40px 44px; min-width: 0; }

        .ro-card {
          background: #fff;
          border-radius: 28px;
          border: 1px solid rgba(210,228,210,0.7);
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(10,26,10,0.04), 0 1px 4px rgba(0,0,0,0.02);
        }

        .ro-table { width: 100%; border-collapse: collapse; }
        .ro-table th {
          text-align: left; padding: 16px 20px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em; color: #7a9a7a;
          background: #fafdfa; border-bottom: 1px solid #edf4ed;
        }
        .ro-table td {
          padding: 16px 20px; border-bottom: 1px solid #f5faf5;
          font-size: 13.5px; vertical-align: middle;
        }
        .ro-table tbody tr:last-child td { border-bottom: none; }
        .ro-table tbody tr { transition: background 0.12s; }
        .ro-table tbody tr:hover td { background: #f8fcf8; }

        .ro-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #e3f5e8; color: #1a7832;
          font-size: 9.5px; font-weight: 800;
          padding: 4px 9px; border-radius: 6px;
          text-transform: uppercase; letter-spacing: 0.07em;
        }

        .ro-view-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none;
          background: #f0f5f0; color: #2a4a2a;
          transition: background 0.15s, transform 0.12s, color 0.15s;
        }
        .ro-view-btn:hover { background: #0a1a0a; color: #fff; transform: scale(1.08); }

        .ro-search-wrap {
          display: flex; align-items: center;
          background: #f4f9f4; padding: 9px 15px;
          border-radius: 13px; border: 1px solid #e5ede5;
          width: 310px; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ro-search-wrap:focus-within {
          border-color: #6aaa6a;
          box-shadow: 0 0 0 3px rgba(106,170,106,0.12);
        }
        .ro-search-wrap input {
          border: none; background: transparent; outline: none;
          margin-left: 8px; width: 100%;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #182618;
        }
        .ro-search-wrap input::placeholder { color: #aabcaa; }

        .ro-export-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 20px; border-radius: 14px; border: none;
          background: #0a1a0a; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.12s;
        }
        .ro-export-btn:hover { background: #183018; transform: translateY(-1px); }
        .ro-export-btn:active { transform: translateY(0); }

        .ro-pg-btn {
          width: 34px; height: 34px; border-radius: 10px;
          border: 1px solid #e5ede5; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.12s;
          font-size: 13px; color: #2a4a2a;
        }
        .ro-pg-btn:hover:not(:disabled) { background: #f0f5f0; }
        .ro-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes ro-spin { to { transform: rotate(360deg) } }
        .ro-spin { animation: ro-spin 0.9s linear infinite; }
      `}</style>

      <div className="ro-layout">
        <aside className="ro-sidebar">
          <VelouraAdminNavbar currentPage="Received Orders" />
        </aside>

        <main className="ro-main">

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "34px" }}>
            <div>
              <p style={{ color: "#7a9a7a", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", margin: "0 0 6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", color: "#0a1a0a", margin: "0 0 4px", lineHeight: 1.1 }}>
                Received Orders
              </h1>
              <p style={{ color: "#7a9a7a", fontSize: "13px", margin: 0 }}>
                {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} successfully delivered`}
              </p>
            </div>
            <button className="ro-export-btn" onClick={handleExport} disabled={orders.length === 0}>
              <Download size={14} /> Export CSV
            </button>
          </header>

          {/* ERROR STATE */}
          {error && (
            <div style={{ background: "#fff3f3", border: "1px solid #fdd", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", color: "#c0392b", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {error}
              <button onClick={fetchReceived} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                Retry
              </button>
            </div>
          )}

          <div className="ro-card">

            {/* TOOLBAR */}
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #edf4ed", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div className="ro-search-wrap">
                <Search size={14} color="#7a9a7a" />
                <input
                  type="text"
                  placeholder="Search name, order ID, ref or email…"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div style={{ color: "#1a7832", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
                <CheckCircle2 size={14} />
                {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* TABLE */}
            <div style={{ overflowX: "auto" }}>
              <table className="ro-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Order Date</th>
                    <th>Received Date</th>
                    <th>Total</th>
                    <th>Ref</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "60px" }}>
                        <Loader2 size={26} color="#7a9a7a" className="ro-spin" style={{ display: "inline-block" }} />
                      </td>
                    </tr>
                  ) : paginated.length > 0 ? paginated.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: "#0a1a0a", fontFamily: "monospace", fontSize: "12.5px" }}>
                          {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, color: "#182618", margin: "0 0 2px" }}>
                          {order.customer?.fullName || "—"}
                        </p>
                        <p style={{ fontSize: "11.5px", color: "#7a9a7a", margin: 0 }}>
                          {order.customer?.email || ""}
                        </p>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#7a9a7a", fontWeight: 500 }}>
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td style={{ color: "#7a9a7a", fontSize: "12.5px" }}>
                        {fmt(order.orderDate || order.createdAt)}
                      </td>
                      <td style={{ color: "#1a7832", fontSize: "12.5px", fontWeight: 500 }}>
                        {fmt(order.receivedAt)}
                      </td>
                      <td>
                        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "19px", fontWeight: 600, color: "#0a1a0a" }}>
                          ₦{Number(order.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#aabcaa" }}>
                          {order.paymentReference?.slice(-12) || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="ro-badge">
                          <CheckCircle2 size={9} /> Received
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button
                            className="ro-view-btn"
                            title="View Details"
                            onClick={() => setViewOrder(order)}
                            aria-label={`View order ${order.orderId}`}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "64px 24px" }}>
                        <InboxIcon size={32} color="#c8d8c8" style={{ marginBottom: "12px" }} />
                        <p style={{ color: "#aabcaa", fontSize: "13px", margin: 0 }}>
                          {searchTerm ? `No orders matching "${searchTerm}"` : "No received orders yet."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {!loading && filtered.length > PER_PAGE && (
              <div style={{ padding: "16px 20px", background: "#fafdfa", borderTop: "1px solid #edf4ed", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12.5px", color: "#7a9a7a" }}>
                  {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="ro-pg-btn" onClick={() => setCurrentPage((p) => p - 1)} disabled={safePage === 1}>
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} style={{ fontSize: "13px", color: "#aabcaa", padding: "0 4px" }}>…</span>
                      ) : (
                        <button
                          key={p}
                          className="ro-pg-btn"
                          onClick={() => setCurrentPage(p)}
                          style={safePage === p ? { background: "#0a1a0a", color: "#fff", borderColor: "#0a1a0a" } : {}}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button className="ro-pg-btn" onClick={() => setCurrentPage((p) => p + 1)} disabled={safePage >= totalPages}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {viewOrder && <OrderModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </>
  );
};

export default VelouraReceivedOrders;