import { useState, useRef } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  RefreshCcw,
  Box,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "http://localhost:5200/order";


const FONT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`;

const DELIVERY_STEPS = [
  { key: "processed",  label: "Confirmed",   icon: <Package size={16} />,      desc: "Packed and ready" },
  { key: "transit",    label: "In Transit",  icon: <Truck size={16} />,        desc: "Moving to hub" },
  { key: "dispatched", label: "Dispatched",  icon: <Truck size={16} />,        desc: "On the way to you" },
  { key: "received",   label: "Delivered",   icon: <CheckCircle2 size={16} />, desc: "Package delivered" },
];

const RETURN_STEPS = [
  { key: "return_approved", label: "Return Initiated", icon: <RefreshCcw size={16} />,   desc: "Request approved" },
  { key: "return_transit",  label: "Return Transit",   icon: <Truck size={16} />,        desc: "Heading back to us" },
  { key: "return_received", label: "Returned",         icon: <CheckCircle2 size={16} />, desc: "Item received at warehouse" },
  { key: "refunded",        label: "Refunded",         icon: <CheckCircle2 size={16} />, desc: "Refund processed to your account" },
];

const RETURN_REASONS = [
  "Wrong item received", "Item is damaged", "Changed my mind",
  "Poor quality", "Size too small", "Size too large",
];

const RETURN_STAGE_KEYS = ["return_approved", "return_transit", "return_received", "refunded"];

const formatNaira = (amt) =>
  amt != null ? "₦" + Number(amt).toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "—";

function resolveDeliveryStep(stageLabel) {
  const idx = DELIVERY_STEPS.findIndex(s => s.key === stageLabel);
  return idx === -1 ? 0 : idx;
}

function resolveReturnStep(stageLabel) {
  const idx = RETURN_STEPS.findIndex(s => s.key === stageLabel);
  return idx === -1 ? 0 : idx;
}

function chipStyle(stageLabel) {
  const map = {
    processed:       { color: "#1D4ED8", bg: "#DBEAFE" },
    transit:         { color: "#92400E", bg: "#FEF3C7" },
    dispatched:      { color: "#92400E", bg: "#FEF3C7" },
    received:        { color: "#065F46", bg: "#D1FAE5" },
    return_approved: { color: "#6D28D9", bg: "#EDE9FE" },
    return_transit:  { color: "#6D28D9", bg: "#EDE9FE" },
    return_received: { color: "#6D28D9", bg: "#EDE9FE" },
    refunded:        { color: "#065F46", bg: "#D1FAE5" },
  };
  return map[stageLabel] || { color: "#374151", bg: "#F3F4F6" };
}

function chipText(stageLabel) {
  const labels = {
    processed:       "CONFIRMED",
    transit:         "IN TRANSIT",
    dispatched:      "DISPATCHED",
    received:        "DELIVERED",
    return_approved: "RETURN INITIATED",
    return_transit:  "RETURN TRANSIT",
    return_received: "RETURNED",
    refunded:        "REFUNDED",
  };
  return labels[stageLabel] || stageLabel.toUpperCase();
}

function normalise(raw, stageLabel) {
  const rawCustomer = raw.customer || raw.customerName || raw.user || {};
  const customerName =
    typeof rawCustomer === "string"
      ? rawCustomer
      : rawCustomer.fullName || rawCustomer.name || "Customer";
  const customerObj = typeof rawCustomer === "object" ? rawCustomer : {};

  const isReturn = RETURN_STAGE_KEYS.includes(stageLabel);

  const products = (raw.items || raw.products || []).map((p, i) => ({
    id:        String(p._id || p.id || i),
    productId: p._id || p.productId,
    name:      p.productName || p.name || "Product",
    variant:   p.variant || p.color || "",
    size:      p.size || "",
    color:     p.color || "",
    qty:       p.quantity || p.qty || 1,
    price:     p.price || p.unitPrice || 0,
    image:     p.image || p.imageUrl || "",
    img:       p.emoji || "📦",
  }));

  return {
    _raw:             raw,
    _id:              raw._id || raw.id,
    id:               raw.orderId || raw._id || raw.id || "—",
    paymentReference: raw.paymentReference || raw.payRef || "",
    date:             raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "—",
    courier:          raw.courier || raw.courierName || raw.logisticsProvider || "—",
    trackingNo:       raw.trackingNumber || raw.trackingNo || "—",
    deliveredOn:      raw.deliveredAt
      ? new Date(raw.deliveredAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : null,
    eta:              raw.eta || raw.estimatedDelivery || "—",
    address:          typeof customerObj.address === "string"
      ? [customerObj.address, customerObj.city, customerObj.state, customerObj.country].filter(Boolean).join(", ")
      : "—",
    paymentMethod:    raw.paymentMethod || raw.payment || "—",
    stageLabel,
    isReturn,
    stepIndex:        resolveDeliveryStep(stageLabel),
    returnIndex:      resolveReturnStep(stageLabel),
    subtotal:         raw.subtotal || 0,
    shipping:         raw.shippingFee || raw.shipping || 0,
    discount:         raw.discount || 0,
    total:            raw.total || raw.totalAmount || 0,
    customer:         customerName,
    email:            customerObj.email || "",
    phone:            customerObj.phone || "",
    rawCustomerObj:   customerObj,
    products,
  };
}

/* ─── CSS ─── */
const css = `${FONT}
  html,body{background:#F4F7F5;font-family:'Plus Jakarta Sans',sans-serif;color:#1C1917;margin:0}
  .hdr{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between;padding:12px 20px}
  .hdr-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1C1917}
  .page{padding:20px;max-width:600px;margin:0 auto}
  .back-btn{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #E5E1DA;border-radius:100px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:20px;transition:0.2s}
  .ocard{background:#fff;border:1px solid #E5E1DA;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.03)}
  .ctop{padding:20px}
  .c-id{font-family:'JetBrains Mono',monospace;font-size:12px;color:#2D5A43;font-weight:600}
  .c-date{font-size:12px;color:#A8A29E}
  .c-chip{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:4px 10px;border-radius:100px}
  .mini-steps{display:flex;align-items:center;margin-bottom:12px}
  .md{width:10px;height:10px;border-radius:50%;border:2px solid #D6D0C8;background:#F4F2EE}
  .md.done{background:#065F46;border-color:#065F46}
  .md.now{background:#2D5A43;border-color:#2D5A43;box-shadow:0 0 0 4px rgba(45,90,67,0.15)}
  .ml{height:2px;background:#E5E1DA;flex:1;margin:0 4px}
  .ml.done{background:#065F46}
  .step-now{font-size:14px;font-weight:700}
  .step-eta{font-size:12px;color:#A8A29E}
  .cbody{border-top:1px solid #F0EFEA;padding:20px;background:#FCFBFA}
  .slabel{font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A29E;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
  .cour-row{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid #E5E1DA;border-radius:16px;padding:14px;margin-bottom:20px}
  .tstep{display:flex;gap:16px;margin-bottom:4px}
  .ts-left{display:flex;flex-direction:column;align-items:center;width:32px}
  .ts-circ{width:32px;height:32px;border-radius:50%;border:2px solid #E5E1DA;background:#fff;display:flex;align-items:center;justify-content:center;z-index:1}
  .ts-circ.done{background:#D1FAE5;border-color:#065F46;color:#065F46}
  .ts-circ.active{background:#FEF3C7;border-color:#92400E;color:#92400E}
  .ts-line{width:2px;flex:1;background:#E5E1DA;margin:4px 0}
  .ts-line.done{background:#065F46}
  .ts-right{padding-bottom:24px}
  .ts-lbl{font-size:14px;font-weight:700;color:#78716C}
  .ts-lbl.done{color:#1C1917}
  .ts-lbl.active{color:#1C1917}
  .ts-desc{font-size:12px;color:#A8A29E;margin-top:2px}
  .ts-time{font-family:'JetBrains Mono',monospace;font-size:11px;color:#065F46;margin-top:4px}
  .prow{display:flex;gap:12px;padding:12px;background:#fff;border:1px solid #E5E1DA;border-radius:14px;margin-bottom:8px;align-items:center}
  .pimg{font-size:24px}
  .pname{font-size:13px;font-weight:600}
  .pprice{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600}
  .cobox{background:#fff;border:1px solid #E5E1DA;border-radius:16px;padding:16px;margin-top:16px}
  .co-r{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}
  .co-vt{font-weight:700;font-size:15px}
  .ret-btn{width:100%;padding:16px;border-radius:14px;background:#FEF2F2;border:1px solid #FEE2E2;color:#B91C1C;font-weight:700;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;margin-top:20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;box-sizing:border-box}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:flex-end}
  .modal{background:#fff;width:100%;border-radius:24px 24px 0 0;padding:20px;max-height:90vh;overflow-y:auto}
  .m-handle{width:40px;height:4px;background:#E5E1DA;border-radius:10px;margin:0 auto 20px}
  .ropt{padding:12px;border:1px solid #E5E1DA;border-radius:12px;text-align:center;font-size:12px;cursor:pointer;transition:all 0.15s}
  .ropt.sel{border-color:#2D5A43;background:#E0F2E9;color:#2D5A43;font-weight:600}
  .note-ta{width:100%;border:1.5px solid #E5E1DA;border-radius:14px;padding:14px;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;resize:none;outline:none;color:#1C1917;background:#FAFAF9;box-sizing:border-box;transition:border-color 0.2s;line-height:1.6}
  .note-ta:focus{border-color:#2D5A43;background:#fff}
  .note-ta::placeholder{color:#C5BFB8}
  .char-count{font-size:11px;color:#A8A29E;text-align:right;margin-top:4px;font-family:'JetBrains Mono',monospace}
  .m-confirm{flex:1;background:#1C1917;color:#fff;padding:16px;border-radius:14px;font-weight:700;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .m-confirm:disabled{opacity:0.3;cursor:not-allowed}
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1C1917;color:#fff;padding:12px 24px;border-radius:100px;font-size:14px;z-index:200;white-space:nowrap}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
  .info-cell{background:#fff;border:1px solid #E5E1DA;border-radius:14px;padding:12px}
  .info-cell-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:#A8A29E;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
  .info-cell-val{font-size:13px;font-weight:600;color:#1C1917}
  .ret-err{margin-top:10px;color:#B91C1C;font-size:12px;text-align:center;font-family:'JetBrains Mono',monospace}
  .ret-success{display:flex;flex-direction:column;align-items:center;padding:32px 20px;text-align:center;gap:10px}
  .ret-success-icon{font-size:52px}
  .ret-success-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700}
  .ret-success-sub{font-size:13px;color:#A8A29E;max-width:260px;line-height:1.6}
  .ret-ref{font-family:'JetBrains Mono',monospace;font-size:11px;color:#065F46;background:#D1FAE5;border:1px solid #A7F3D0;padding:6px 14px;border-radius:100px}
`;


export default function VelouraOrderTracking() {
  const [inputVal, setInputVal]                 = useState("");
  const [order, setOrder]                       = useState(null);
  const [searchStatus, setSearchStatus]         = useState("idle");
  const [retModal, setRetModal]                 = useState(false);
  const [retPhase, setRetPhase]                 = useState("form");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [reason, setReason]                     = useState(null);
  const [note, setNote]                         = useState("");
  const [retErr, setRetErr]                     = useState("");
  const [returnRef, setReturnRef]               = useState("");
  const [toast, setToast]                       = useState(null);
  const MAX_NOTE = 300;

  /* ── Track order ── */
  async function handleTrack(val) {
    const q = (val || inputVal).trim();
    if (!q) return;
    setSearchStatus("loading");
    setOrder(null);
    try {
      const res = await fetch(`${BASE_URL}/staff/search?q=${encodeURIComponent(q)}`);
      if (res.status === 404) { setSearchStatus("notfound"); return; }
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setOrder(normalise(json.order, json.stageLabel));
      setSearchStatus("found");
    } catch (err) {
      console.error(err);
      setSearchStatus("error");
    }
  }

  /* ── Open return modal ── */
  function openReturn() {
    setRetPhase("form");
    setReason(null);
    setNote("");
    setSelectedProducts([]);
    setRetErr("");
    setReturnRef("");
    setRetModal(true);
  }

  function toggleProd(id) {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function buildReturnPayload() {
    const o = order;
    const c = o.rawCustomerObj;

    const returnItems = o.products
      .filter(p => selectedProducts.includes(p.id))
      .map(p => ({
        productId: p.productId,
        name:      p.name,
        price:     p.price,
        qty:       p.qty,
        size:      p.size  || "",
        color:     p.color || "",
        image:     p.image || "",
      }));

    return {
      orderId:          o.id,
      paymentReference: o.paymentReference,
      customer: {
        fullName: c.fullName || o.customer || "",
        email:    c.email    || o.email    || "",
        phone:    c.phone    || o.phone    || "",
        address:  c.address  || "",
        city:     c.city     || "",
        state:    c.state    || "",
        country:  c.country  || "",
      },
      returnItems,
      reason,
      note,
    };
  }

  async function submitReturn() {
    setRetPhase("submitting");
    setRetErr("");
    try {
      const payload = buildReturnPayload();
      const res = await fetch(`${BASE_URL}/return/request`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Server error ${res.status}`);
      }
      const data = await res.json();
      setReturnRef(data.returnId || data._id || "REQ-" + Date.now());
      setRetPhase("success");
    } catch (err) {
      console.error("Return submit:", err);
      setRetErr(err.message || "Something went wrong. Please try again.");
      setRetPhase("form");
    }
  }

  function closeReturnModal() {
    setRetModal(false);
    if (retPhase === "success") {
      setToast("Return request submitted successfully!");
      setTimeout(() => setToast(null), 3500);
    }
  }

  /* ── Order detail renderer ── */
  function renderDetail(o) {
    const inRet = o.isReturn;
    const chain = inRet ? RETURN_STEPS : DELIVERY_STEPS;
    const ai    = inRet ? o.returnIndex : o.stepIndex;
    const cs    = chipStyle(o.stageLabel);

    const TERMINAL_KEYS = ["received", "return_received", "refunded"];

    return (
      <motion.div
        key="detail"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="page"
      >
        <button className="back-btn" onClick={() => { setOrder(null); setSearchStatus("idle"); setInputVal(""); }}>
          <ChevronLeft size={16} /> Track another
        </button>

        <div className="ocard">
          <div className="ctop">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div className="c-id">{o.id}</div>
                <div className="c-date">{o.date}</div>
              </div>
              <div className="c-chip" style={{ color: cs.color, background: cs.bg }}>
                {chipText(o.stageLabel)}
              </div>
            </div>

            <div className="mini-steps">
              {chain.map((s, i) => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", flex: i < chain.length - 1 ? 1 : "none" }}>
                  <div className={`md ${i <= ai ? "done" : ""} ${i === ai ? "now" : ""}`} />
                  {i < chain.length - 1 && <div className={`ml ${i < ai ? "done" : ""}`} />}
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <div>
                <div className="step-now">{chain[ai]?.label}</div>
                <div className="step-eta">
                  {inRet
                    ? o.stageLabel === "refunded" ? "Refund completed" : "Processing return"
                    : o.deliveredOn ? `Delivered ${o.deliveredOn}` : `ETA: ${o.eta}`
                  }
                </div>
              </div>
              {o.total > 0 && <div className="co-vt">{formatNaira(o.total)}</div>}
            </div>
          </div>

          <div className="cbody">
            {o.courier !== "—" && (
              <div className="cour-row">
                <Truck size={20} style={{ color: "#A8A29E" }} />
                <div style={{ flex: 1 }}>
                  <div className="slabel" style={{ marginBottom: 0 }}>Courier</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.courier}</div>
                </div>
                {o.trackingNo !== "—" && (
                  <div style={{ textAlign: "right" }}>
                    <div className="slabel" style={{ marginBottom: 0 }}>Tracking No</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12 }}>{o.trackingNo}</div>
                  </div>
                )}
              </div>
            )}

            <div className="info-grid">
              {o.address !== "—" && (
                <div className="info-cell" style={{ gridColumn: "span 2" }}>
                  <div className="info-cell-label">Delivery Address</div>
                  <div className="info-cell-val" style={{ fontSize: 12, fontWeight: 500 }}>{o.address}</div>
                </div>
              )}
              {o.paymentMethod !== "—" && (
                <div className="info-cell" style={{ gridColumn: "span 2" }}>
                  <div className="info-cell-label">Payment</div>
                  <div className="info-cell-val">{o.paymentMethod}</div>
                </div>
              )}
            </div>

            <div className="slabel">{inRet ? "Return Timeline" : "Delivery Timeline"}</div>
            <div style={{ marginBottom: 24 }}>
              {chain.map((s, i) => {
                const isDone   = i < ai;
                const isActive = i === ai;
                return (
                  <div key={s.key} className="tstep">
                    <div className="ts-left">
                      <div className={`ts-circ ${isDone ? "done" : isActive ? "active" : ""}`}>
                        {isDone ? <CheckCircle2 size={14} /> : s.icon}
                      </div>
                      {i < chain.length - 1 && <div className={`ts-line ${isDone ? "done" : ""}`} />}
                    </div>
                    <div className="ts-right">
                      <div className={`ts-lbl ${isDone ? "done" : isActive ? "active" : ""}`}>{s.label}</div>
                      <div className="ts-desc">{s.desc}</div>
                      {isDone && <div className="ts-time">✓ Completed</div>}
                      {isActive && (
                        TERMINAL_KEYS.includes(s.key)
                          ? <div className="ts-time">✓ Completed</div>
                          : <div className="ts-time" style={{ color: "#92400E" }}>● In progress</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {o.products.length > 0 && (
              <>
                <div className="slabel">Items in this order</div>
                {o.products.map(p => (
                  <div key={p.id} className="prow">
                    <div className="pimg">{p.img}</div>
                    <div style={{ flex: 1 }}>
                      <div className="pname">{p.name}</div>
                      <div style={{ fontSize: 10, color: "#A8A29E" }}>
                        {p.variant && `${p.variant} · `}qty {p.qty}
                      </div>
                    </div>
                    <div className="pprice">{formatNaira(p.price)}</div>
                  </div>
                ))}
              </>
            )}

            {o.total > 0 && (
              <div className="cobox">
                <div className="co-r"><span>Subtotal</span><span>{formatNaira(o.subtotal)}</span></div>
                <div className="co-r"><span>Shipping</span><span>{formatNaira(o.shipping)}</span></div>
                {o.discount > 0 && (
                  <div className="co-r" style={{ color: "#065F46" }}>
                    <span>Discount</span><span>− {formatNaira(o.discount)}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #E5E1DA", marginTop: 8, paddingTop: 10 }} className="co-r co-vt">
                  <span>Total</span><span>{formatNaira(o.total)}</span>
                </div>
              </div>
            )}

            {/* Return button — only when fully delivered and not already in return flow */}
            {!inRet && o.stageLabel === "received" && (
              <button className="ret-btn" onClick={openReturn}>
                <RefreshCcw size={16} /> Request Return
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ════════ RENDER ════════ */
  return (
    <>
      <style>{css}</style>

      <header className="hdr">
        <div
          style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
          onClick={() => { setOrder(null); setSearchStatus("idle"); setInputVal(""); }}
        >
          <div style={{ width:32, height:32, background:"#1C1917", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Box size={18} color="#fff" />
          </div>
          <span className="hdr-name">Veloura</span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {searchStatus !== "found" || !order ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page"
            style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh" }}
          >
            <div style={{ fontSize: 48, marginBottom: 24 }}>📦</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Track Your Order
            </h2>
            <p style={{ color: "#A8A29E", fontSize: 14, textAlign: "center", marginBottom: 32, maxWidth: 300 }}>
              Enter your Order ID to see real-time delivery status.
            </p>

            <div style={{ width:"100%", background:"#fff", padding:24, borderRadius:24, border:"1px solid #E5E1DA", boxShadow:"0 4px 20px rgba(0,0,0,0.03)" }}>
              <div className="slabel">Order ID</div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  style={{ flex:1, border:"1px solid #E5E1DA", borderRadius:12, padding:"12px 16px", fontFamily:"monospace", fontSize:14, outline:"none", color:"#1C1917" }}
                  placeholder="e.g. VEL-9821 or ORD-8498"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTrack()}
                />
                <button
                  style={{ background:"#1C1917", color:"#fff", padding:"12px 20px", borderRadius:12, fontWeight:700, fontSize:14, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
                  onClick={() => handleTrack()}
                  disabled={searchStatus === "loading"}
                >
                  {searchStatus === "loading"
                    ? <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} />
                    : "Track"
                  }
                </button>
              </div>

              {searchStatus === "notfound" && (
                <div style={{ marginTop:12, color:"#B91C1C", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                  <AlertCircle size={13} /> Order not found. Please check the order ID and try again.
                </div>
              )}
              {searchStatus === "error" && (
                <div style={{ marginTop:12, color:"#B91C1C", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                  <AlertCircle size={13} /> Something went wrong. Please try again.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          renderDetail(order)
        )}
      </AnimatePresence>

      {/* ══════════════════ RETURN MODAL ══════════════════ */}
      <AnimatePresence>
        {retModal && order && (
          <div className="overlay" onClick={closeReturnModal}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="m-handle" />

              {retPhase === "success" ? (
                <div className="ret-success">
                  <div className="ret-success-icon">✅</div>
                  <div className="ret-success-title">Return Submitted!</div>
                  <div className="ret-success-sub">
                    Your request has been received. We'll review it within 1–2 business days.
                  </div>
                  {returnRef && <div className="ret-ref">Ref: {returnRef}</div>}
                  <button
                    style={{ marginTop:12, padding:"12px 32px", borderRadius:12, border:"1px solid #E5E1DA", background:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                    onClick={closeReturnModal}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:4 }}>
                    Return Items
                  </h2>
                  <p style={{ fontSize:12, color:"#A8A29E", marginBottom:24 }}>
                    Select which products from{" "}
                    <span style={{ fontFamily:"monospace", fontWeight:700, color:"#57534E" }}>{order.id}</span>{" "}
                    you wish to return.
                  </p>

                  <div className="slabel">Select Items</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
                    {order.products.map(p => {
                      const isSel = selectedProducts.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProd(p.id)}
                          className="prow"
                          style={{ cursor:"pointer", border: isSel ? "2px solid #1C1917" : "1px solid #E5E1DA" }}
                        >
                          <div className="pimg">{p.img}</div>
                          <div style={{ flex: 1 }}>
                            <div className="pname">{p.name}</div>
                            <div style={{ fontSize:12, color:"#A8A29E" }}>
                              {p.variant && `${p.variant} · `}{formatNaira(p.price)} · qty {p.qty}
                            </div>
                          </div>
                          <div style={{
                            width:20, height:20, borderRadius:"50%", border:"2px solid",
                            borderColor: isSel ? "#1C1917" : "#D6D3D1",
                            background:  isSel ? "#1C1917" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                          }}>
                            {isSel && <CheckCircle2 size={12} color="#fff" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="slabel">Reason for Return</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
                    {RETURN_REASONS.map(r => (
                      <div key={r} onClick={() => setReason(r)} className={`ropt ${reason === r ? "sel" : ""}`}>
                        {r}
                      </div>
                    ))}
                  </div>

                  <div className="slabel">
                    Additional Notes{" "}
                    <span style={{ fontSize:10, color:"#C5BFB8", fontStyle:"italic" }}>(optional)</span>
                  </div>
                  <textarea
                    className="note-ta"
                    rows={3}
                    placeholder="Tell us more about the issue..."
                    value={note}
                    maxLength={MAX_NOTE}
                    onChange={e => setNote(e.target.value)}
                  />
                  <div className="char-count">{note.length} / {MAX_NOTE}</div>

                  {retErr && <div className="ret-err">{retErr}</div>}

                  <div style={{ display:"flex", gap:12, marginTop:20 }}>
                    <button
                      style={{ flex:1, padding:16, border:"1px solid #E5E1DA", borderRadius:14, fontWeight:700, background:"#fff", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                      onClick={closeReturnModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="m-confirm"
                      disabled={!reason || selectedProducts.length === 0 || retPhase === "submitting"}
                      onClick={submitReturn}
                    >
                      {retPhase === "submitting"
                        ? <><Loader2 size={14} style={{ animation:"spin 0.7s linear infinite" }} /> Submitting…</>
                        : `Confirm Return (${selectedProducts.length})`
                      }
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0 }}
          className="toast"
        >
          ✅ {toast}
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}