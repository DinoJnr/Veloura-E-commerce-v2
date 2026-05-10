import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp, TrendingDown, RotateCcw, ArrowLeftRight,
  Download, Eye, X, ChevronLeft, ChevronRight,
  Loader2, Package, Search, Filter
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const API = "http://localhost:5200";

const fmt  = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";


const ReceiptModal = ({ order, type, onClose }) => {
  if (!order) return null;

  const typeLabel = {
    received:        { label: "Sale Receipt",           color: "#0a7c5c", bg: "#ecfdf5", border: "#6ee7b7" },
    rejectedRefunds: { label: "Rejected Refund Receipt", color: "#b91c1c", bg: "#fef2f2", border: "#fca5a5" },
    returnRefunds:   { label: "Return Refund Receipt",   color: "#92400e", bg: "#fffbeb", border: "#fcd34d" },
  }[type] || { label: "Receipt", color: "#0a1e28", bg: "#f8fbfc", border: "#e0edf2" };

  const orderId  = order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`;
  const printRef = useRef();

  const handleDownload = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Receipt – ${orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; padding: 40px; color: #0a1e28; }
          .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #0a1e28; padding-bottom: 20px; }
          .brand { font-size: 28px; letter-spacing: 0.2em; font-weight: 300; }
          .type  { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: ${typeLabel.color}; margin-top: 4px; }
          .meta  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 24px 0; }
          .meta-cell label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #7a9aaa; display: block; margin-bottom: 2px; }
          .meta-cell p { font-size: 13px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7a9aaa; border-bottom: 1px solid #e0edf2; }
          td { padding: 12px 10px; border-bottom: 1px solid #f5f9fa; font-size: 13px; }
          .total-row td { border-top: 2px solid #0a1e28; font-weight: 700; font-size: 16px; padding-top: 14px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #7a9aaa; }
        </style>
      </head><body>
        <div class="header">
          <div class="brand">VELOURA</div>
          <div class="type">${typeLabel.label}</div>
        </div>
        <div class="meta">
          <div class="meta-cell"><label>Order ID</label><p>${orderId}</p></div>
          <div class="meta-cell"><label>Date</label><p>${fmtDate(order.orderDate || order.createdAt)}</p></div>
          <div class="meta-cell"><label>Customer</label><p>${order.customer?.fullName || "—"}</p></div>
          <div class="meta-cell"><label>Email</label><p>${order.customer?.email || "—"}</p></div>
          <div class="meta-cell" style="grid-column:1/-1"><label>Payment Ref</label><p style="font-family:monospace">${order.paymentReference || "—"}</p></div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Size/Colour</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.name || "—"}</td>
                <td style="color:#7a9aaa">${[item.size, item.color].filter(Boolean).join(" · ") || "—"}</td>
                <td style="text-align:center">${item.qty || 1}</td>
                <td style="text-align:right">${fmt(item.price)}</td>
                <td style="text-align:right">${fmt(Number(item.price || 0) * (item.qty || 1))}</td>
              </tr>`).join("")}
          </tbody>
          <tfoot><tr class="total-row"><td colspan="4">Total</td><td style="text-align:right">${fmt(order.totalAmount)}</td></tr></tfoot>
        </table>
        <div class="footer">Veloura Atelier · Lagos, Nigeria · support@veloura.com<br/>© ${new Date().getFullYear()} Veloura. All rights reserved.</div>
        <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <>
      <style>{`
        .txn-overlay {
          position:fixed;inset:0;z-index:1000;background:rgba(10,30,40,0.55);
          backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:flex-end;
          animation:txnFadeIn 0.2s ease;
        }
        @keyframes txnFadeIn { from{opacity:0} to{opacity:1} }
        .txn-drawer {
          width:540px;height:100vh;background:#fff;overflow-y:auto;
          display:flex;flex-direction:column;
          animation:txnSlide 0.3s cubic-bezier(0.22,1,0.36,1);
          box-shadow:-20px 0 60px rgba(0,0,0,0.12);
        }
        @keyframes txnSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .txn-drawer-head {
          background:linear-gradient(145deg,#0a1e28 0%,#0d2535 100%);
          padding:28px 32px 24px;position:sticky;top:0;z-index:10;
        }
        .txn-sec { padding:22px 32px; border-bottom:1px solid #f0f5f7; }
        .txn-sec:last-child { border-bottom:none; }
        .txn-sec-title {
          font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
          color:#7a9aaa;display:flex;align-items:center;gap:8px;margin-bottom:14px;
        }
        .txn-meta { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .txn-meta-cell label { font-size:10px;color:#9ab0ba;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:2px; }
        .txn-meta-cell p { font-size:13px;color:#1a2e38;font-weight:500;margin:0; }
        .txn-item-row { display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #f5f9fa; }
        .txn-item-row:last-child { border-bottom:none; }
        .txn-total { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:2px solid #0a1e28;margin-top:6px; }
      `}</style>
      <div className="txn-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="txn-drawer" ref={printRef}>

          {/* HEAD */}
          <div className="txn-drawer-head">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ color:"rgba(100,200,180,0.6)", fontSize:"10px", letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 5px" }}>
                  Veloura · {typeLabel.label}
                </p>
                <h2 style={{ color:"#e8f4f8", fontFamily:"Georgia,serif", fontSize:"24px", margin:0, fontWeight:600 }}>
                  {orderId}
                </h2>
                <p style={{ color:"rgba(160,210,220,0.4)", fontSize:"11px", margin:"5px 0 0", fontFamily:"monospace" }}>
                  {order.paymentReference || "—"}
                </p>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={handleDownload} style={{ background:"rgba(255,255,255,0.1)", border:"none", width:"36px", height:"36px", borderRadius:"10px", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center" }} title="Download Receipt">
                  <Download size={15} />
                </button>
                <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:"36px", height:"36px", borderRadius:"10px", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div style={{ marginTop:"12px" }}>
              <span style={{ background:typeLabel.bg, color:typeLabel.color, border:`1px solid ${typeLabel.border}`, fontSize:"10px", fontWeight:700, padding:"4px 10px", borderRadius:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {typeLabel.label}
              </span>
              <span style={{ marginLeft:"8px", background:"rgba(255,255,255,0.07)", color:"rgba(180,210,220,0.5)", fontSize:"11px", padding:"4px 10px", borderRadius:"6px" }}>
                {fmtDate(order.orderDate || order.createdAt)}
              </span>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="txn-sec">
            <p className="txn-sec-title">Customer</p>
            <div className="txn-meta">
              <div className="txn-meta-cell"><label>Full Name</label><p>{order.customer?.fullName || "—"}</p></div>
              <div className="txn-meta-cell"><label>Email</label><p style={{ fontSize:"12px", wordBreak:"break-all" }}>{order.customer?.email || "—"}</p></div>
              <div className="txn-meta-cell"><label>Phone</label><p>{order.customer?.phone || "—"}</p></div>
              <div className="txn-meta-cell"><label>City</label><p>{order.customer?.city || "—"}</p></div>
              <div className="txn-meta-cell" style={{ gridColumn:"1/-1" }}>
                <label>Address</label>
                <p>{[order.customer?.address, order.customer?.state, order.customer?.country].filter(Boolean).join(", ") || "—"}</p>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="txn-sec">
            <p className="txn-sec-title"><Package size={12} /> Items ({order.items?.length || 0})</p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="txn-item-row">
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width:"46px", height:"54px", objectFit:"cover", borderRadius:"7px", border:"1px solid #e8f0f2", flexShrink:0 }} />
                  : <div style={{ width:"46px", height:"54px", borderRadius:"7px", background:"#f0f7fa", border:"1px solid #e0edf2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Package size={14} color="#7a9aaa" />
                    </div>
                }
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"13px", fontWeight:600, color:"#1a2e38", margin:"0 0 2px" }}>{item.name || "—"}</p>
                  <p style={{ fontSize:"11px", color:"#7a9aaa", margin:0 }}>
                    {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:"13px", fontWeight:600, color:"#1a2e38", margin:"0 0 2px" }}>{fmt(Number(item.price || 0) * (item.qty || 1))}</p>
                  <p style={{ fontSize:"11px", color:"#7a9aaa", margin:0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            <div className="txn-total">
              <span style={{ fontSize:"12px", fontWeight:700, color:"#1a2e38", textTransform:"uppercase", letterSpacing:"0.1em" }}>Total</span>
              <span style={{ fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:600, color:"#0a1e28" }}>{fmt(order.totalAmount)}</span>
            </div>
          </div>

          {/* DOWNLOAD BTN */}
          <div className="txn-sec">
            <button onClick={handleDownload} style={{ width:"100%", padding:"13px", borderRadius:"12px", border:"none", background:"linear-gradient(135deg,#0a1e28 0%,#0d2535 100%)", color:"white", cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 16px rgba(10,30,40,0.2)" }}>
              <Download size={14} /> Download Receipt
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, amount, count, icon: Icon, accent, onClick, active }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? "#0a1e28" : "#fff",
      border: active ? "none" : "1px solid rgba(180,210,220,0.5)",
      borderRadius:"24px", padding:"28px 26px", cursor:"pointer",
      transition:"all 0.25s", flex:1, minWidth:"200px",
      boxShadow: active ? "0 12px 40px rgba(10,30,40,0.2)" : "0 4px 20px rgba(10,50,70,0.05)",
      transform: active ? "translateY(-2px)" : "none",
    }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"18px" }}>
      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background: active ? "rgba(255,255,255,0.1)" : `${accent}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={18} color={active ? "#fff" : accent} />
      </div>
      <span style={{ fontSize:"11px", fontWeight:600, padding:"4px 10px", borderRadius:"20px", background: active ? "rgba(255,255,255,0.1)" : `${accent}12`, color: active ? "rgba(255,255,255,0.7)" : accent }}>
        {count} orders
      </span>
    </div>
    <p style={{ margin:"0 0 4px", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, color: active ? "rgba(255,255,255,0.5)" : "#7a9aaa" }}>
      {label}
    </p>
    <p style={{ margin:0, fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:600, color: active ? "#fff" : "#0a1e28" }}>
      {fmt(amount)}
    </p>
  </div>
);


const VelouraTransaction = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("received");
  const [search, setSearch]         = useState("");
  const [viewOrder, setViewOrder]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab, search]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/transaction/summary`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch transaction summary:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key:"received",        label:"Sales",           icon:TrendingUp,    accent:"#0a7c5c" },
    { key:"rejectedRefunds", label:"Rejected Refunds", icon:TrendingDown,  accent:"#dc2626" },
    { key:"returnRefunds",   label:"Return Refunds",   icon:RotateCcw,     accent:"#d97706" },
  ];

  const currentList = data?.receipts?.[activeTab] || [];
  const filtered = currentList.filter((o) =>
    o.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    o.paymentReference?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const s = data?.summary;

  
  const netPositive = (s?.netRevenue || 0) >= 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .txn-layout { display:flex;min-height:100vh;background:linear-gradient(135deg,#eef5f8 0%,#f4f9fb 100%);font-family:'DM Sans',sans-serif; }
        .txn-sidebar { width:260px;flex-shrink:0;position:sticky;top:0;height:100vh;background:rgba(255,255,255,0.45);backdrop-filter:blur(10px);border-right:1px solid rgba(180,210,220,0.4); }
        .txn-main { flex:1;padding:40px;overflow-y:auto; }

        .txn-table-card { background:#fff;border-radius:24px;border:1px solid rgba(180,210,220,0.5);overflow:hidden;box-shadow:0 10px 40px rgba(10,50,70,0.05); }
        .txn-table { width:100%;border-collapse:collapse; }
        .txn-table th { text-align:left;padding:16px 22px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#7a9aaa;background:#f8fbfc;border-bottom:1px solid #edf3f5; }
        .txn-table td { padding:16px 22px;border-bottom:1px solid #f5f9fa;font-size:14px;vertical-align:middle; }
        .txn-table tr:hover td { background:#f5fbfc; }

        .txn-tab { padding:9px 18px;border-radius:12px;border:1px solid transparent;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#7a9aaa;display:flex;align-items:center;gap:7px;transition:all 0.2s; }
        .txn-tab.active { background:#0a1e28;color:#fff;border-color:#0a1e28;box-shadow:0 4px 14px rgba(10,30,40,0.2); }
        .txn-tab:not(.active):hover { background:#f0f7fa;color:#1a2e38;border-color:#e0edf2; }

        .txn-view-btn { width:32px;height:32px;border-radius:50%;background:#f0f5f7;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#2a5066;transition:transform 0.15s,background 0.15s; }
        .txn-view-btn:hover { transform:scale(1.1);background:#e0edf2; }

        @keyframes txnSpin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="txn-layout">
        <aside className="txn-sidebar">
          <VelouraAdminNavbar currentPage="Transactions" />
        </aside>

        <main className="txn-main">

          {/* HEADER */}
          <header style={{ marginBottom:"36px" }}>
            <p style={{ color:"#7a9aaa", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.2em", margin:"0 0 6px" }}>
              Veloura Admin
            </p>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"38px", color:"#0a1e28", margin:"0 0 4px" }}>
              Transaction Ledger
            </h1>
            <p style={{ color:"#7a9aaa", fontSize:"13px", margin:0 }}>
              Full financial overview across all order buckets
            </p>
          </header>

          {/* STAT CARDS */}
          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"140px" }}>
              <Loader2 size={28} color="#7a9aaa" style={{ animation:"txnSpin 1s linear infinite" }} />
            </div>
          ) : (
            <>
              <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"16px" }}>
                <StatCard
                  label="Grossed — Sales"
                  amount={s?.grossedReceived}
                  count={s?.totalOrders}
                  icon={TrendingUp}
                  accent="#0a7c5c"
                  active={activeTab === "received"}
                  onClick={() => setActiveTab("received")}
                />
                <StatCard
                  label="Grossed — Rejected Refunds"
                  amount={s?.grossedRejectedRefunds}
                  count={s?.totalRejectedRefunds}
                  icon={TrendingDown}
                  accent="#dc2626"
                  active={activeTab === "rejectedRefunds"}
                  onClick={() => setActiveTab("rejectedRefunds")}
                />
                <StatCard
                  label="Grossed — Return Refunds"
                  amount={s?.grossedReturnRefunds}
                  count={s?.totalReturnRefunds}
                  icon={RotateCcw}
                  accent="#d97706"
                  active={activeTab === "returnRefunds"}
                  onClick={() => setActiveTab("returnRefunds")}
                />
              </div>

              {/* NET REVENUE BANNER */}
              <div style={{ background: netPositive ? "linear-gradient(135deg,#0a7c5c 0%,#0d9a70 100%)" : "linear-gradient(135deg,#dc2626 0%,#ef4444 100%)", borderRadius:"20px", padding:"22px 28px", marginBottom:"32px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow: netPositive ? "0 8px 32px rgba(10,124,92,0.25)" : "0 8px 32px rgba(220,38,38,0.25)" }}>
                <div>
                  <p style={{ margin:"0 0 4px", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.18em", color:"rgba(255,255,255,0.6)", fontWeight:600 }}>
                    Net Revenue
                  </p>
                  <p style={{ margin:0, fontFamily:"Georgia,serif", fontSize:"32px", fontWeight:600, color:"#fff" }}>
                    {fmt(s?.netRevenue)}
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ margin:"0 0 4px", fontSize:"11px", color:"rgba(255,255,255,0.6)" }}>Sales − Refunds</p>
                  <p style={{ margin:0, fontSize:"13px", color:"rgba(255,255,255,0.8)", fontFamily:"monospace" }}>
                    {fmt(s?.grossedReceived)} − {fmt((s?.grossedRejectedRefunds || 0) + (s?.grossedReturnRefunds || 0))}
                  </p>
                </div>
                <ArrowLeftRight size={32} color="rgba(255,255,255,0.3)" />
              </div>
            </>
          )}

          {/* TABLE */}
          <div className="txn-table-card">

            {/* TOOLBAR */}
            <div style={{ padding:"18px 22px", borderBottom:"1px solid #edf3f5", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
              {/* Tabs */}
              <div style={{ display:"flex", gap:"8px" }}>
                {tabs.map((t) => (
                  <button key={t.key} className={`txn-tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                    <t.icon size={13} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ display:"flex", alignItems:"center", background:"#f5fafc", padding:"8px 14px", borderRadius:"12px", border:"1px solid #e0edf2", minWidth:"260px" }}>
                <Search size={14} color="#7a9aaa" />
                <input
                  type="text"
                  placeholder="Search customer, order ID or ref..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border:"none", background:"transparent", marginLeft:"8px", outline:"none", width:"100%", fontFamily:"DM Sans,sans-serif", fontSize:"13px" }}
                />
              </div>
            </div>

            {/* TABLE BODY */}
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign:"center" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign:"center", padding:"56px" }}>
                      <Loader2 size={24} color="#7a9aaa" style={{ animation:"txnSpin 1s linear infinite", display:"inline-block" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? paginated.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight:700, color:"#0a1e28", fontFamily:"monospace", fontSize:"13px" }}>
                      {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                    </td>
                    <td>
                      <p style={{ fontWeight:600, color:"#1a2e38", margin:"0 0 2px" }}>{order.customer?.fullName || "—"}</p>
                      <p style={{ fontSize:"12px", color:"#7a9aaa", margin:0 }}>{order.customer?.email || ""}</p>
                    </td>
                    <td style={{ color:"#7a9aaa", fontSize:"13px" }}>{fmtDate(order.orderDate || order.createdAt)}</td>
                    <td>
                      <span style={{ background:"#f0f7fa", color:"#2a5066", fontSize:"12px", fontWeight:600, padding:"4px 10px", borderRadius:"8px" }}>
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td style={{ fontFamily:"Georgia,serif", fontSize:"18px", fontWeight:600, color:"#0a1e28" }}>
                      {fmt(order.totalAmount)}
                    </td>
                    <td style={{ textAlign:"center" }}>
                      <button className="txn-view-btn" title="View Receipt" onClick={() => setViewOrder({ order, type: activeTab })}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign:"center", padding:"56px", color:"#7a9aaa" }}>
                      {search ? `No results for "${search}"` : "No records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding:"18px 22px", background:"#f8fbfc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:"13px", color:"#7a9aaa" }}>
                {filtered.length > 0
                  ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : "No records"}
              </span>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ padding:"7px 12px", borderRadius:"10px", border:"1px solid #e0edf2", background:"white", cursor:currentPage === 1 ? "not-allowed" : "pointer", opacity:currentPage === 1 ? 0.4 : 1, fontSize:"13px" }}>
                  ←
                </button>
                <span style={{ padding:"7px 14px", borderRadius:"10px", background:"#0a1e28", color:"white", fontSize:"13px", fontWeight:500 }}>
                  {currentPage}
                </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                  style={{ padding:"7px 12px", borderRadius:"10px", border:"1px solid #e0edf2", background:"white", cursor:currentPage >= totalPages ? "not-allowed" : "pointer", opacity:currentPage >= totalPages ? 0.4 : 1, fontSize:"13px" }}>
                  →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* RECEIPT MODAL */}
      {viewOrder && (
        <ReceiptModal
          order={viewOrder.order}
          type={viewOrder.type}
          onClose={() => setViewOrder(null)}
        />
      )}
    </>
  );
};

export default VelouraTransaction;