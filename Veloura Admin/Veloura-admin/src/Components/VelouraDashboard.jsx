import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, ShoppingBag, RotateCcw, ArrowUpRight,
  MoreHorizontal, Eye, Tag, Package, Star,
  RefreshCw, AlertCircle, CheckCircle2, Clock,
  Download, Loader2,
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";


const API = "http://localhost:5200";

const PALETTE = ["#c9a96e", "#2c2416", "#8a7355", "#d4b896", "#e8e0d5", "#9a8f7e"];

const STATUS_STYLES = {
  processing: { bg: "#fef3e2", color: "#a07c45", label: "Processing" },
  shipped:    { bg: "#e6f4f1", color: "#1d7a65", label: "Shipped"    },
  delivered:  { bg: "#eaf3de", color: "#3b6d11", label: "Delivered"  },
  cancelled:  { bg: "#fcebeb", color: "#a32d2d", label: "Cancelled"  },
  pending:    { bg: "#f0f4ff", color: "#4f46e5", label: "Pending"    },
  paid:       { bg: "#eaf3de", color: "#3b6d11", label: "Paid"       },
};

const ALERT_COLORS = {
  warning: { bg: "#fef3e2", color: "#a07c45" },
  success: { bg: "#eaf3de", color: "#3b6d11" },
  info:    { bg: "#e6f1fb", color: "#185fa5" },
};


const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const fmtRevenue = (val) => {
  if (val === null || val === undefined) return "—";
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `₦${(val / 1_000).toFixed(0)}K`;
  return `₦${val.toLocaleString()}`;
};


const Sparkline = ({ data, color = "#c9a96e" }) => {
  if (!data || data.length < 2) return null;
  const w = 80; const h = 30;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  ).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};


const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "100%", minHeight: "4px",
            height: `${(d.value / max) * 68}px`,
            background: i === data.length - 1 ? "#c9a96e" : "rgba(201,169,110,0.25)",
          }} />
          <span style={{ fontSize: "9px", color: "#9a8f7e", letterSpacing: "0.04em" }}>
            {(d.month || "").slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  );
};


const DonutChart = ({ data = [] }) => {
  const size = 110; const r = 40; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map((c, i) => {
    const dash = ((c.pct || 0) / 100) * circ;
    const s = { ...c, dash, gap: circ - dash, offset, color: PALETTE[i % PALETTE.length] };
    offset += dash;
    return s;
  });
  const topPct   = data.slice(0, 2).reduce((s, c) => s + (c.pct || 0), 0);
  const topNames = data.slice(0, 2).map((c) => (c.name || "").slice(0, 3).toUpperCase()).join("+");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {slices.length > 0 ? slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`} />
      )) : (
        /* placeholder ring while loading */
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ebe3" strokeWidth="18" />
      )}
      <text x={cx} y={cy - 5} textAnchor="middle"
        style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fill: "#2c2416", fontWeight: 600 }}>
        {topPct > 0 ? `${topPct}%` : "—"}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", fill: "#9a8f7e", letterSpacing: "0.06em" }}>
        {topNames || "NO DATA"}
      </text>
    </svg>
  );
};


const Skel = ({ w, h }) => (
  <div className="skel" style={{ width: w, height: h, borderRadius: "6px" }} />
);


const VelouraDashboard = () => {
  const [activeTab,   setActiveTab]   = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [grossRevenue, setGrossRevenue] = useState(null);
  const [totalOrders,  setTotalOrders]  = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [kpiLoading,   setKpiLoading]   = useState(true);
  const [returnRate,  setReturnRate]  = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [categories,  setCategories]  = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [liveAlerts,    setLiveAlerts]    = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [topProducts,   setTopProducts]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [prodsLoading,  setProdsLoading]  = useState(true);

 
  const fetchKpis = useCallback(async () => {
    try {
      setKpiLoading(true);
      const [revRes, ordRes] = await Promise.all([
        axios.get(`${API}/admin/gross-revenue`),
        axios.get(`${API}/admin/total-orders`),
      ]);
      setGrossRevenue(revRes.data.grossRevenue ?? 0);
      setTotalOrders(ordRes.data.totalOrders ?? 0);
      setRevenueChart(revRes.data.monthlyRevenue || []);
    } catch (err) {
      console.error("[fetchKpis]", err.message);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await axios.get(`${API}/admin/recent-orders`);
      setRecentOrders(res.data.orders || []);
    } catch (err) {
      console.error("[fetchRecentOrders]", err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchTopProducts = useCallback(async () => {
    try {
      setProdsLoading(true);
      const res = await axios.get(`${API}/admin/top-products`);
      setTopProducts(res.data.products || []);
    } catch (err) {
      console.error("[fetchTopProducts]", err.message);
    } finally {
      setProdsLoading(false);
    }
  }, []);

  const fetchReturnRate = useCallback(async () => {
    try {
      setRateLoading(true);
      const res = await axios.get(`${API}/admin/return-rate`);
      setReturnRate(res.data.rate ?? null);
    } catch (err) {
      console.error("[fetchReturnRate]", err.message);
    } finally {
      setRateLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCatsLoading(true);
      const res = await axios.get(`${API}/admin/sales-by-category`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("[fetchCategories]", err.message);
    } finally {
      setCatsLoading(false);
    }
  }, []);

  const fetchLiveAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const res = await axios.get(`${API}/admin/live-alerts`);
      setLiveAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("[fetchLiveAlerts]", err.message);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchKpis();
    fetchRecentOrders();
    fetchTopProducts();
    fetchReturnRate();
    fetchCategories();
    fetchLiveAlerts();
  };

  useEffect(() => {
    fetchKpis();
    fetchRecentOrders();
    fetchTopProducts();
    fetchReturnRate();
    fetchCategories();
    fetchLiveAlerts();
  }, [fetchKpis, fetchRecentOrders, fetchTopProducts, fetchReturnRate, fetchCategories, fetchLiveAlerts]);


  const sparkData = revenueChart.length
    ? revenueChart.map((d) => d.value)
    : [20, 30, 25, 40, 35, 50];

  const filteredOrders = orderFilter === "all"
    ? recentOrders
    : recentOrders.filter((o) => (o.paymentStatus || "").toLowerCase() === orderFilter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #e3f2e4 0%, #f1f8e9 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .dash-sidebar {
          width: 260px; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(8px);
          border-right: 1px solid rgba(232,224,213,0.5);
        }
        .dash-scroll { flex: 1; height: 100vh; overflow-y: auto; padding: 32px 32px 64px; }

        .d-card, .kpi-card {
          background: #fff;
          border: 1px solid rgba(232,224,213,0.6);
          border-radius: 24px;
          transition: box-shadow 0.2s;
        }
        .d-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.04); }
        .kpi-card { padding: 24px; }

        .serif { font-family: 'Cormorant Garamond', serif; }

        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 10px 20px; font-size: 12px;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .filter-pill {
          background: none; border: 1px solid #e8e0d5; cursor: pointer;
          font-family: 'DM Sans', sans-serif; padding: 5px 14px;
          font-size: 11px; letter-spacing: 0.06em; border-radius: 20px;
          text-transform: uppercase; transition: all 0.15s;
        }
        .filter-pill:hover { border-color: #c9a96e; color: #a07c45; }
        .filter-pill.active { background: #2c2416; color: #f0e8da; border-color: #2c2416; }
        .action-btn {
          background: none; border: 1px solid #e8e0d5; cursor: pointer;
          font-family: 'DM Sans', sans-serif; display: flex; align-items: center;
          gap: 6px; padding: 8px 16px; font-size: 11px; color: #5a4e3e;
          letter-spacing: 0.06em; transition: all 0.15s; border-radius: 10px;
        }
        .action-btn:hover { border-color: #c9a96e; color: #a07c45; }

        .skel {
          background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes d-spin { to { transform: rotate(360deg) } }
        .d-spin { animation: d-spin 0.9s linear infinite; display: inline-block; }

        .order-row:hover td { background: #fdf9f3; }
        .prod-row:hover td  { background: #fdf9f3; }
      `}</style>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <VelouraAdminNavbar currentPage="Dashboard" />
        </aside>

        <div className="dash-scroll">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {/* PAGE HEADER */}
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p style={{ fontSize: "11px", color: "#9a8f7e", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 300, marginBottom: "6px" }}>
                  Veloura Admin · Overview
                </p>
                <h1 className="serif" style={{ fontSize: "38px", color: "#1a1814", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1 }}>
                  Command Centre
                </h1>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="action-btn" onClick={handleRefresh}>
                  <RefreshCw size={12} /> Refresh
                </button>
                <button className="action-btn">
                  <Download size={12} /> Export Report
                </button>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", borderBottom: "1px solid #e8e0d5", marginBottom: "28px" }}>
              {["overview"].map((tab) => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                  style={{
                    color: activeTab === tab ? "#2c2416" : "#9a8f7e",
                    borderBottom: activeTab === tab ? "2px solid #c9a96e" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* ── KPI CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>

              {/* GROSS REVENUE */}
              <div className="kpi-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "8px" }}>
                      Gross Revenue
                    </p>
                    {kpiLoading
                      ? <Skel w="120px" h="32px" />
                      : <p className="serif" style={{ fontSize: "28px", color: "#1a1814", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {fmtRevenue(grossRevenue)}
                        </p>
                    }
                  </div>
                  <div style={{ width: "36px", height: "36px", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "10px" }}>
                    <TrendingUp size={15} color="#c9a96e" />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpRight size={12} color="#3b6d11" />
                    <span style={{ fontSize: "11px", color: "#9a8f7e", fontWeight: 300 }}>total from received orders</span>
                  </div>
                  <Sparkline data={sparkData} color="#c9a96e" />
                </div>
              </div>

              {/* ORDERS PLACED */}
              <div className="kpi-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "8px" }}>
                      Orders Placed
                    </p>
                    {kpiLoading
                      ? <Skel w="80px" h="32px" />
                      : <p className="serif" style={{ fontSize: "28px", color: "#1a1814", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {totalOrders !== null ? totalOrders.toLocaleString() : "—"}
                        </p>
                    }
                  </div>
                  <div style={{ width: "36px", height: "36px", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "10px" }}>
                    <ShoppingBag size={15} color="#c9a96e" />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpRight size={12} color="#3b6d11" />
                    <span style={{ fontSize: "11px", color: "#9a8f7e", fontWeight: 300 }}>all-time orders placed</span>
                  </div>
                  <Sparkline data={sparkData} color="#c9a96e" />
                </div>
              </div>

              {/* RETURN RATE — now live */}
              <div className="kpi-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "8px" }}>
                      Return Rate
                    </p>
                    {rateLoading
                      ? <Skel w="80px" h="32px" />
                      : <p className="serif" style={{ fontSize: "28px", color: "#1a1814", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {returnRate !== null ? `${returnRate}%` : "—"}
                        </p>
                    }
                  </div>
                  <div style={{ width: "36px", height: "36px", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "10px" }}>
                    <RotateCcw size={15} color="#c9a96e" />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#9a8f7e", fontWeight: 300 }}>refunds ÷ received orders</span>
                </div>
              </div>

            </div>

            {/* ── CHARTS ROW ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px 240px", gap: "16px", marginBottom: "24px" }}>

              {/* MONTHLY REVENUE BAR */}
              <div className="d-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "4px" }}>Monthly Revenue</p>
                    <p className="serif" style={{ fontSize: "22px", color: "#1a1814", fontWeight: 600 }}>
                      {fmtRevenue(grossRevenue)}
                      <span style={{ fontSize: "13px", color: "#3b6d11", fontWeight: 400, fontFamily: "'DM Sans',sans-serif", marginLeft: "8px" }}>↑ live</span>
                    </p>
                  </div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8f7e" }}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                {revenueChart.length > 0
                  ? <MiniBarChart data={revenueChart} />
                  : <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", opacity: 0.3 }}>
                      {[28,34,31,39,44,58,41,37,43,48,52,62].map((v, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <div style={{ width: "100%", height: `${(v / 62) * 68}px`, background: i === 11 ? "#c9a96e" : "rgba(201,169,110,0.25)", minHeight: "4px" }} />
                          <span style={{ fontSize: "9px", color: "#9a8f7e" }}>
                            {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                }
              </div>

              {/* SALES BY CATEGORY — live */}
              <div className="d-card" style={{ padding: "24px" }}>
                <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "16px" }}>
                  Sales by Category
                </p>
                {catsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <Loader2 size={22} color="#c9a96e" className="d-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#9a8f7e", textAlign: "center", padding: "20px 0" }}>No data yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <DonutChart data={categories} />
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {categories.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "8px", height: "8px", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                            <span style={{ fontSize: "11px", color: "#5a4e3e" }}>{c.name}</span>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#2c2416" }}>{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE ALERTS — live */}
              <div className="d-card" style={{ padding: "24px" }}>
                <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "16px" }}>
                  Live Alerts
                </p>
                {alertsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    <Loader2 size={22} color="#c9a96e" className="d-spin" />
                  </div>
                ) : liveAlerts.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px 0" }}>
                    <CheckCircle2 size={20} color="#3b6d11" />
                    <p style={{ fontSize: "12px", color: "#9a8f7e", textAlign: "center" }}>All clear — no alerts</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {liveAlerts.map((a, i) => {
                      const { bg, color } = ALERT_COLORS[a.type] || ALERT_COLORS.info;
                      const Icon = a.type === "warning" ? AlertCircle
                                 : a.type === "success" ? CheckCircle2
                                 : Clock;
                      return (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px", background: bg, borderRadius: "8px" }}>
                          <Icon size={13} style={{ color, marginTop: "1px", flexShrink: 0 }} />
                          <p style={{ fontSize: "11px", color: "#2c2416", lineHeight: 1.4 }}>{a.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
{/* ── RECENT ORDERS TABLE ── */}
<div className="d-card" style={{ marginBottom: "24px" }}>
  <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0ebe3", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
    <div>
      <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "2px" }}>Recent Orders</p>
      <p className="serif" style={{ fontSize: "18px", color: "#1a1814", fontWeight: 600 }}>Order Intelligence</p>
    </div>
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {["all", "paid", "pending", "processing"].map((f) => (
        <button key={f} className={`filter-pill ${orderFilter === f ? "active" : ""}`} onClick={() => setOrderFilter(f)}>
          {f}
        </button>
      ))}
    </div>
  </div>

  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid #f0ebe3" }}>
          {["Order ID", "Customer", "Items", "Total", "Status", "Date", ""].map((h, i) => (
            <th key={i} style={{ padding: "12px 20px", textAlign: "left", fontSize: "9px", color: "#9a8f7e", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ordersLoading ? (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 size={22} color="#c9a96e" className="d-spin" />
            </td>
          </tr>
        ) : filteredOrders.length > 0 ? filteredOrders.map((o, i) => {
     const key = (o.paymentStatus || "pending").toLowerCase();
  const s = STATUS_STYLES[key] || STATUS_STYLES.pending;

 
  const hasOrderId = o.orderId && typeof o.orderId === 'string';
  const displayId = hasOrderId ? o.orderId : `#${o._id?.toString().slice(-8).toUpperCase()}`;
          return (
            <tr key={o._id || i} className="order-row" style={{ borderBottom: "1px solid #f7f4ef", cursor: "pointer" }}>
       <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ 
            fontSize: "12px", 
            fontWeight: 800, 
            color: hasOrderId ? "#3da066" : "#e74c3c", 
            fontFamily: "monospace",
            letterSpacing: "0.5px"
          }}>
            {displayId}
          </span>
          {!hasOrderId && (
            <span style={{ fontSize: "8px", color: "#e74c3c", fontWeight: "bold" }}>
              (Field 'orderId' missing in API)
            </span>
          )}
        </div>
      </td>
              <td style={{ padding: "14px 20px" }}>
                <p style={{ fontSize: "12px", color: "#2c2416", margin: "0 0 2px", fontWeight: 500 }}>{o.customer?.fullName || "—"}</p>
                <p style={{ fontSize: "11px", color: "#9a8f7e", margin: 0 }}>{o.customer?.email || ""}</p>
              </td>
              <td style={{ padding: "14px 20px" }}>
                <span style={{ fontSize: "11px", color: "#7a6e5f" }}>
                  {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? "s" : ""}
                </span>
              </td>
              <td style={{ padding: "14px 20px" }}>
                <span className="serif" style={{ fontSize: "14px", color: "#1a1814", fontWeight: 600 }}>
                  ₦{Number(o.totalAmount || 0).toLocaleString()}
                </span>
              </td>
              <td style={{ padding: "14px 20px" }}>
                <span style={{ padding: "4px 10px", background: s.bg, color: s.color, fontSize: "10px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: "4px" }}>
                  {s.label}
                </span>
              </td>
              <td style={{ padding: "14px 20px" }}>
                <span style={{ fontSize: "11px", color: "#9a8f7e" }}>{fmt(o.orderDate || o.createdAt)}</span>
              </td>
              <td style={{ padding: "14px 20px" }}>
                <Eye size={13} color="#c9a96e" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/order/${o._id}`)} />
              </td>
            </tr>
          );
        }) : (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "40px", fontSize: "13px", color: "#9a8f7e" }}>
              No orders found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

            {/* ── TOP PRODUCTS + CONVERSION FUNNEL ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>

              {/* TOP PRODUCTS */}
              <div className="d-card">
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0ebe3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "2px" }}>Best Performers</p>
                    <p className="serif" style={{ fontSize: "18px", color: "#1a1814", fontWeight: 600 }}>Top Products</p>
                  </div>
                  <button className="action-btn"><Tag size={11} /> Manage Inventory</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f0ebe3" }}>
                        {["Product", "Category", "Stock", "Price", "Status", "Rating"].map((h) => (
                          <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "9px", color: "#9a8f7e", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prodsLoading ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "48px" }}>
                            <Loader2 size={22} color="#c9a96e" className="d-spin" />
                          </td>
                        </tr>
                      ) : topProducts.length > 0 ? topProducts.map((p, i) => (
                        <tr key={i} className="prod-row" style={{ borderBottom: "1px solid #f7f4ef" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} style={{ width: "28px", height: "28px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                                : <div style={{ width: "28px", height: "28px", background: "rgba(201,169,110,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "6px" }}>
                                    <Package size={12} color="#c9a96e" />
                                  </div>
                              }
                              <span style={{ fontSize: "12px", color: "#1a1814" }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.category}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 500, color: p.stock <= 5 ? "#a32d2d" : p.stock <= 20 ? "#a07c45" : "#3b6d11" }}>
                              {p.stock <= 5 ? "⚠ " : ""}{p.stock} left
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span className="serif" style={{ fontSize: "14px", color: "#1a1814", fontWeight: 600 }}>
                              ₦{Number(p.price || 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              padding: "3px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 500,
                              background: p.status === "active" ? "#eaf3de" : "#fef3e2",
                              color: p.status === "active" ? "#3b6d11" : "#a07c45",
                              textTransform: "uppercase", letterSpacing: "0.06em",
                            }}>
                              {p.status || "active"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Star size={11} color="#c9a96e" fill="#c9a96e" />
                              <span style={{ fontSize: "12px", color: "#2c2416" }}>—</span>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "40px", fontSize: "13px", color: "#9a8f7e" }}>No products found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONVERSION FUNNEL */}
              <div className="d-card" style={{ padding: "20px" }}>
                <p style={{ fontSize: "10px", color: "#9a8f7e", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: "16px" }}>Conversion Funnel</p>
                {[
                  { label: "Visitors",    value: 18420, pct: 100 },
                  { label: "Add to Cart", value: 4210,  pct: 23  },
                  { label: "Checkout",    value: 2840,  pct: 15  },
                  { label: "Purchased",   value: totalOrders || 0, pct: totalOrders ? Math.round((totalOrders / 18420) * 100) : 10 },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "11px", color: "#5a4e3e" }}>{s.label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: "#2c2416" }}>
                        {kpiLoading && s.label === "Purchased" ? "…" : s.value.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "#f0ebe3", width: "100%", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${s.pct}%`, background: "#c9a96e", borderRadius: "2px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VelouraDashboard;