import { useState, useRef } from "react";


const BASE_URL = "http://localhost:5200/order";


const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@600;700;800&family=Manrope:wght@300;400;500;600&display=swap');`;


const DELIVERY_CHAIN = [
  { key: "processed",  label: "Processed",  icon: "📦", desc: "Order confirmed & packed" },
  { key: "transit",    label: "In Transit", icon: "🚛", desc: "Moving to dispatch hub" },
  { key: "dispatched", label: "Dispatched", icon: "🛵", desc: "Out with courier" },
  { key: "received",   label: "Received",   icon: "🏠", desc: "Delivered to customer" },
];

const RETURN_CHAIN = [
  { key: "return_approved", label: "Approved",    icon: "✅", desc: "Return request approved" },
  { key: "return_transit",  label: "In Transit",  icon: "🚛", desc: "Item on its way back to warehouse" },
  { key: "return_received", label: "Received",    icon: "🏬", desc: "Item received at warehouse" },
  { key: "refunded",        label: "Refunded",    icon: "💸", desc: "Refund processed to customer" },
];


const STAGE_MAP = {
  // delivery
  processed:      { chain: "delivery", step: 0 },
  transit:        { chain: "delivery", step: 1 },
  dispatched:     { chain: "delivery", step: 2 },
  received:       { chain: "delivery", step: 3 },
  // return
  return_approved: { chain: "return", step: 0 },
  return_transit:  { chain: "return", step: 1 },
  return_received: { chain: "return", step: 2 },
  refunded:        { chain: "return", step: 3 },
};

function getChain(mode) { return mode === "return" ? RETURN_CHAIN : DELIVERY_CHAIN; }
function isComplete(order) { return order.step === getChain(order.mode).length - 1; }

const DELIVERY_ADVANCE = [
  { fromStep: 0, endpoint: "transit",  buildBody: (id) => ({ orderIds: [id] }) },
  { fromStep: 1, endpoint: "dispatch", buildBody: (id) => ({ orderIds: [id] }) },
  { fromStep: 2, endpoint: "received", buildBody: (id) => ({ orderIds: [id] }) },
];

const RETURN_ADVANCE = [
  { fromStep: 0, endpoint: "returns/settle-approved", buildBody: (id) => ({ returnId: id }) },
  { fromStep: 1, endpoint: "returns/settle-transit",  buildBody: (id) => ({ returnId: id }) },
  { fromStep: 2, endpoint: "returns/settle-received", buildBody: (id) => ({ returnId: id }) },
];
/* ─── NORMALISE ─── */
function normalise(raw, stageLabel) {
  const mapped = STAGE_MAP[stageLabel] || { chain: "delivery", step: 0 };
  const rawCustomer = raw.customer || raw.customerName || raw.user || {};
  const customerName = typeof rawCustomer === "string"
    ? rawCustomer
    : rawCustomer.fullName || rawCustomer.name || "Customer";
  const co = typeof rawCustomer === "object" ? rawCustomer : {};

  return {
    _id:      raw._id || raw.id,
    id:       raw.orderId || raw._id || raw.id || "—",
    customer: customerName,
    email:    co.email   || "—",
    phone:    co.phone   || "—",
    address:  [co.address, co.city, co.state, co.country].filter(Boolean).join(", ") || "—",
    product:  raw.productName || raw.product || raw.items?.[0]?.name || raw.returnItems?.[0]?.name || "—",
    reason:   raw.reason || null,
    mode:     mapped.chain,   // "delivery" | "return"
    step:     mapped.step,    // 0-3
  };
}

/* ─── STYLES ─── */
const css = `
${FONT}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
--bg:#0D0F18;--s1:#151824;--s2:#1C1F30;--s3:#232638;
--border:rgba(255,255,255,0.07);--accent-d:#5B8DEF;--accent-r:#C77DFF;--green:#3DDC84;
--amber:#FFB547;--red:#FF6B6B;--text:#EDF0F7;--muted:#6C7080;
--syne:'Syne',sans-serif;--mono:'DM Mono',monospace;--body:'Manrope',sans-serif;
}
.shell{min-height:100vh;max-width:480px;margin:0 auto;position:relative;padding-bottom:40px;color:var(--text);font-family:var(--body);-webkit-font-smoothing:antialiased}
.shell::before{content:'';position:fixed;top:-100px;right:-80px;width:400px;height:400px;background:radial-gradient(circle,var(--glow,rgba(91,141,239,0.07)) 0%,transparent 70%);pointer-events:none;z-index:0}
.header{position:sticky;top:0;z-index:100;background:rgba(13,15,24,0.93);backdrop-filter:blur(18px);border-bottom:1px solid var(--border);padding:0 16px;display:flex;align-items:center;justify-content:space-between;height:58px}
.brand{display:flex;align-items:center;gap:9px}
.brand-icon{width:30px;height:30px;background:linear-gradient(135deg,var(--accent-d),#3D5AF1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.brand-name{font-family:var(--syne);font-size:15px;font-weight:800;letter-spacing:-.3px}
.brand-name span{color:var(--accent-d)}
.hdr-right{display:flex;align-items:center;gap:8px}
.role-badge{font-family:var(--mono);font-size:10px;color:var(--amber);background:rgba(255,181,71,0.1);border:1px solid rgba(255,181,71,0.2);padding:4px 10px;border-radius:20px;letter-spacing:.3px}
.avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#3D5AF1,#7B2FBE);display:flex;align-items:center;justify-content:center;font-family:var(--syne);font-size:11px;font-weight:700;color:#fff}
.content{padding:18px 16px;position:relative;z-index:1}
.page-title{font-family:var(--syne);font-size:21px;font-weight:800;letter-spacing:-.4px;margin-bottom:3px}
.page-sub{font-size:12px;color:var(--muted);margin-bottom:18px}
.search-wrap{position:relative;margin-bottom:6px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none}
.search-input{width:100%;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:10px 12px 10px 36px;font-family:var(--mono);font-size:13px;color:var(--text);outline:none;transition:border-color .2s;letter-spacing:.3px}
.search-input::placeholder{color:var(--muted);font-family:var(--body);letter-spacing:0}
.search-input:focus{border-color:rgba(91,141,239,0.4)}
.search-hint{font-size:11px;color:var(--muted);margin-bottom:16px;padding-left:2px;font-family:var(--mono);min-height:18px}
.order-card{background:var(--s1);border:1px solid var(--border);border-radius:18px;margin-bottom:10px;overflow:hidden;animation:fadeUp .35s ease both;transition:border-color .25s}
.order-card.selected-d{border-color:rgba(91,141,239,0.5)}
.order-card.selected-r{border-color:rgba(199,125,255,0.5)}
.card-head{padding:14px 16px 12px;cursor:pointer}
.card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
.card-id{font-family:var(--mono);font-size:11px;margin-bottom:2px}
.card-id.delivery{color:var(--accent-d)}
.card-id.return{color:var(--accent-r)}
.card-customer{font-family:var(--syne);font-size:14px;font-weight:700}
.card-product{font-size:11px;color:var(--muted);margin-top:2px}
.mode-badge{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:20px;white-space:nowrap;letter-spacing:.3px;flex-shrink:0}
.mode-delivery{color:var(--accent-d);background:rgba(91,141,239,0.12);border:1px solid rgba(91,141,239,0.2)}
.mode-return{color:var(--accent-r);background:rgba(199,125,255,0.12);border:1px solid rgba(199,125,255,0.2)}
.mini-chain{display:flex;align-items:center;gap:0;margin-bottom:6px;margin-top:10px}
.mini-dot{width:8px;height:8px;border-radius:50%;background:var(--s3);border:1.5px solid var(--border);flex-shrink:0;transition:all .3s}
.mini-dot.done{background:var(--green);border-color:var(--green);box-shadow:0 0 6px rgba(61,220,132,.5)}
.mini-dot.active-d{background:var(--accent-d);border-color:var(--accent-d);box-shadow:0 0 6px rgba(91,141,239,.6);animation:pulse-d 1.5s infinite}
.mini-dot.active-r{background:var(--accent-r);border-color:var(--accent-r);box-shadow:0 0 6px rgba(199,125,255,.6);animation:pulse-r 1.5s infinite}
.mini-line{flex:1;height:2px;background:var(--border);transition:background .3s}
.mini-line.done{background:var(--green)}
.current-step-label{font-family:var(--mono);font-size:11px;color:var(--muted)}
.current-step-label span{color:var(--text)}
.expand-hint{font-size:10px;color:var(--muted);text-align:right;margin-top:2px;font-family:var(--mono)}
.expand-panel{background:var(--s2);border-top:1px solid var(--border);padding:16px}
.chain-steps{display:flex;flex-direction:column;gap:0}
.chain-step{display:flex;align-items:stretch;gap:12px}
.step-left{display:flex;flex-direction:column;align-items:center;width:28px;flex-shrink:0}
.step-circle{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;transition:all .3s;position:relative;z-index:1}
.step-circle.done{background:rgba(61,220,132,.15);border-color:var(--green)}
.step-circle.active-d{background:rgba(91,141,239,.15);border-color:var(--accent-d);box-shadow:0 0 12px rgba(91,141,239,.4);animation:pulse-d 1.5s infinite}
.step-circle.active-r{background:rgba(199,125,255,.15);border-color:var(--accent-r);box-shadow:0 0 12px rgba(199,125,255,.4);animation:pulse-r 1.5s infinite}
.step-connector{flex:1;width:2px;background:var(--border);margin:.5px auto;transition:background .3s}
.step-connector.done{background:var(--green)}
.step-right{padding:2px 0 18px;flex:1}
.step-label{font-family:var(--syne);font-size:13px;font-weight:700;margin-bottom:2px}
.step-desc{font-size:11px;color:var(--muted);line-height:1.5}
.action-area{margin-top:16px;padding-top:14px;border-top:1px solid var(--border)}
.btn-row{display:flex;gap:8px;flex-wrap:wrap}
.btn{font-family:var(--mono);font-size:12px;padding:10px 16px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;font-weight:500;letter-spacing:.2px;flex:1;min-width:120px}
.btn-advance-d{background:var(--accent-d);color:#fff}
.btn-advance-d:hover{background:#4A7DE8;transform:translateY(-1px)}
.btn-advance-r{background:var(--accent-r);color:#0D0F18}
.btn-advance-r:hover{filter:brightness(1.1);transform:translateY(-1px)}
.complete-banner{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;margin-top:4px;font-size:12px;font-family:var(--mono);background:rgba(61,220,132,.08);border:1px solid rgba(61,220,132,.2);color:var(--green)}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease}
.modal{background:var(--s1);border:1px solid var(--border);border-radius:24px 24px 0 0;padding:24px 20px 36px;width:100%;max-width:480px;animation:slideUp .3s cubic-bezier(.4,0,.2,1)}
.modal-handle{width:36px;height:4px;background:var(--border);border-radius:100px;margin:0 auto 20px}
.modal-title{font-family:var(--syne);font-size:17px;font-weight:800;margin-bottom:6px}
.modal-sub{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6}
.arrow-viz{display:flex;align-items:center;gap:8px;padding:10px 0;margin-bottom:20px}
.av-step{flex:1;background:var(--s2);border-radius:10px;padding:8px 10px;text-align:center}
.av-label{font-size:10px;color:var(--muted);margin-bottom:2px;text-transform:uppercase;letter-spacing:.4px}
.av-val{font-family:var(--syne);font-size:12px;font-weight:700}
.av-arrow{font-size:18px;color:var(--muted);flex-shrink:0}
.modal-btns{display:flex;gap:10px}
.modal-confirm-d{flex:1;padding:13px;border-radius:12px;border:none;cursor:pointer;font-family:var(--mono);font-size:13px;font-weight:500;background:var(--accent-d);color:#fff}
.modal-confirm-r{flex:1;padding:13px;border-radius:12px;border:none;cursor:pointer;font-family:var(--mono);font-size:13px;font-weight:500;background:var(--accent-r);color:#0D0F18}
.modal-cancel{flex:0 0 80px;padding:13px;border-radius:12px;background:var(--s2);border:1px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:13px;cursor:pointer}
.modal-cancel:hover{color:var(--text)}
.empty{text-align:center;padding:50px 20px;color:var(--muted);font-family:var(--mono);font-size:13px}
.empty-icon{font-size:36px;margin-bottom:10px}
.err-text{color:var(--red);font-size:11px;margin-top:6px}
.spinner-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;padding:50px 20px;font-family:var(--mono);font-size:12px;color:var(--muted)}
.spinner{width:22px;height:22px;border:2px solid var(--s3);border-top-color:var(--accent-d);border-radius:50%;animation:spin .7s linear infinite}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes pulse-d{0%,100%{box-shadow:0 0 8px rgba(91,141,239,.4)}50%{box-shadow:0 0 18px rgba(91,141,239,.8)}}
@keyframes pulse-r{0%,100%{box-shadow:0 0 8px rgba(199,125,255,.4)}50%{box-shadow:0 0 18px rgba(199,125,255,.8)}}
@keyframes spin{to{transform:rotate(360deg)}}
`;


export default function StaffOrderUpdater() {
  const [order, setOrder]       = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState("idle");
  const [modal, setModal]       = useState(false);
  const [toast, setToast]       = useState(null);
  const [hint, setHint]         = useState("Type an order number to begin");
  const debounceRef             = useRef(null);

 
  async function fetchOrder(rawQ) {
    setStatus("loading");
    setOrder(null);
    setExpanded(false);

    try {
      const res = await fetch(`${BASE_URL}/staff/search?q=${encodeURIComponent(rawQ.trim())}`);
      if (res.status === 404) { setStatus("notfound"); return; }
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const json = await res.json();
    
      setOrder(normalise(json.order, json.stageLabel));
      setStatus("found");
    } catch (err) {
      console.error("fetchOrder:", err);
      setStatus("error");
    }
  }

  
  async function confirmAdvance() {
    if (!order) return;
    setModal(false);

    const advanceList = order.mode === "return" ? RETURN_ADVANCE : DELIVERY_ADVANCE;
    const map = advanceList.find(m => m.fromStep === order.step);
    if (!map) return;

    try {
      const res = await fetch(`${BASE_URL}/${map.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(map.buildBody(order._id)),
      });
      if (!res.ok) throw new Error("Failed");
      setOrder(prev => ({ ...prev, step: prev.step + 1 }));
      showToast("✅ Status advanced successfully");
    } catch {
      showToast("❌ Could not advance — please try again");
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }


  function onSearchChange(e) {
    const val = e.target.value.trim();
    clearTimeout(debounceRef.current);
    setOrder(null);
    setExpanded(false);

    if (val.length < 2) {
      setHint("Type an order number to begin");
      setStatus("idle");
      return;
    }

    setHint("Searching...");
    debounceRef.current = setTimeout(() => {
      setHint("");
      fetchOrder(val);
    }, 500);
  }

  /* ── RENDER HELPERS ── */
  function renderMiniChain(o) {
    const chain    = getChain(o.mode);
    const isReturn = o.mode === "return";
    return chain.map((s, i) => (
      <span key={s.key} style={{ display: "flex", alignItems: "center", flex: i < chain.length - 1 ? 1 : 0 }}>
        <span className={`mini-dot ${i < o.step ? "done" : i === o.step ? (isReturn ? "active-r" : "active-d") : ""}`} />
        {i < chain.length - 1 && <span className={`mini-line ${i < o.step ? "done" : ""}`} />}
      </span>
    ));
  }

  function renderFullChain(o) {
    const chain    = getChain(o.mode);
    const isReturn = o.mode === "return";
    return chain.map((s, idx) => (
      <div className="chain-step" key={s.key}>
        <div className="step-left">
          <div className={`step-circle ${idx < o.step ? "done" : idx === o.step ? (isReturn ? "active-r" : "active-d") : ""}`}>
            {s.icon}
          </div>
          {idx < chain.length - 1 && (
            <div className={`step-connector ${idx < o.step ? "done" : ""}`} />
          )}
        </div>
        <div className="step-right">
          <div className="step-label">{s.label}</div>
          <div className="step-desc">{s.desc}</div>
        </div>
      </div>
    ));
  }

  const chain     = order ? getChain(order.mode) : [];
  const done      = order ? isComplete(order) : false;
  const nextLabel = order && !done ? chain[order.step + 1]?.label : null;
  const isReturn  = order?.mode === "return";

  return (
    <div className="min-h-screen w-full" style={{ background: "#0D0F18" }}>
      <style>{css}</style>
      <div className="shell">

        {/* HEADER */}
        <header className="header">
          <div className="brand">
            <div className="brand-icon">📦</div>
            <span className="brand-name">Veloura<span>Logistics</span></span>
          </div>
          <div className="hdr-right">
            <div className="role-badge">STAFF</div>
            <div className="avatar">ST</div>
          </div>
        </header>

        <div className="content">
          <div className="page-title">Order Updater</div>
          <div className="page-sub">Search by order ID to update delivery or return status</div>

          {/* SEARCH */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Enter ORD number e.g. 9821"
              autoComplete="off"
              spellCheck="false"
              onChange={onSearchChange}
            />
          </div>
          <div className="search-hint">{hint}</div>

          {/* STATES */}
          {status === "loading" && (
            <div className="spinner-wrap">
              <div className="spinner" />
              <span>Looking up order...</span>
            </div>
          )}
          {status === "notfound" && (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div>No order found</div>
              <div className="err-text">Check the order number and try again</div>
            </div>
          )}
          {status === "error" && (
            <div className="empty">
              <div className="empty-icon">⚠️</div>
              <div className="err-text">Network error — check your connection</div>
            </div>
          )}
          {status === "idle" && (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div>Search an order ID above to load its current status</div>
            </div>
          )}

          {/* ORDER CARD */}
          {order && (
            <div className={`order-card ${expanded ? (isReturn ? "selected-r" : "selected-d") : ""}`}>
              <div className="card-head" onClick={() => setExpanded(e => !e)}>
                <div className="card-top">
                  <div>
                    <div className={`card-id ${isReturn ? "return" : "delivery"}`}>
                      #{String(order.id).replace(/^#/, "")}
                    </div>
                    <div className="card-customer">{order.customer}</div>
                    {order.reason
                      ? <div className="card-product">↩ {order.reason}</div>
                      : <div className="card-product">{order.product}</div>
                    }
                    {order.email   !== "—" && <div className="card-product">✉ {order.email}</div>}
                    {order.phone   !== "—" && <div className="card-product">📞 {order.phone}</div>}
                    {order.address !== "—" && <div className="card-product">📍 {order.address}</div>}
                  </div>
                  <div className={`mode-badge ${isReturn ? "mode-return" : "mode-delivery"}`}>
                    {isReturn ? "↩ Return" : "🚚 Delivery"}
                  </div>
                </div>
                <div className="mini-chain">{renderMiniChain(order)}</div>
                <div className="current-step-label">
                  Status: <span>{chain[order.step]?.label}</span>
                </div>
                <div className="expand-hint">{expanded ? "▲ close" : "▼ manage"}</div>
              </div>

              {expanded && (
                <div className="expand-panel">
                  <div className="chain-steps">{renderFullChain(order)}</div>
                  <div className="action-area">
                    {done ? (
                      <div className="complete-banner">
                        {isReturn ? "💸 Refund processed — return cycle complete" : "✅ Order fully delivered — no further action needed"}
                      </div>
                    ) : (
                      <div className="btn-row">
                        <button
                          className={`btn ${isReturn ? "btn-advance-r" : "btn-advance-d"}`}
                          onClick={() => setModal(true)}
                        >
                          Advance to {nextLabel} →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL */}
        {modal && order && (
          <div className="overlay" onClick={() => setModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-title">Advance Status</div>
              <div className="modal-sub">
                This will move the {isReturn ? "return" : "order"} to the next stage. Cannot be undone from the staff panel.
              </div>
              <div className="arrow-viz">
                <div className="av-step">
                  <div className="av-label">From</div>
                  <div className="av-val">{chain[order.step]?.label}</div>
                </div>
                <div className="av-arrow">→</div>
                <div className="av-step">
                  <div className="av-label">To</div>
                  <div className="av-val">{chain[order.step + 1]?.label}</div>
                </div>
              </div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setModal(false)}>Cancel</button>
                <button
                  className={isReturn ? "modal-confirm-r" : "modal-confirm-d"}
                  onClick={confirmAdvance}
                >
                  Advance →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 12,
            padding: "10px 18px", fontSize: 12, fontFamily: "var(--mono)",
            display: "flex", alignItems: "center", gap: 8, zIndex: 300,
            animation: "fadeUp .25s ease", whiteSpace: "nowrap",
          }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}