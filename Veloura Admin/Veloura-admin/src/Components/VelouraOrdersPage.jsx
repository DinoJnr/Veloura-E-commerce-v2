import React, { useState, useEffect } from "react";
import {
  Search, Eye, ChevronLeft, ChevronRight,
  Filter, X, User, MapPin, Package,
  CreditCard, Calendar, Hash, Phone,
  Mail, ChevronDown, Check, Loader2
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_FLOW = ["Pending", "Accept", "Processing", "In Transit", "Dispatched", "Received"];

const STATUS_STYLES = {
  Pending:    { bg: "#fff4e6", color: "#d97706" },
  Accept:     { bg: "#eef2ff", color: "#4f46e5" },
  Processing: { bg: "#fef3e2", color: "#a07c45" },
  "In Transit": { bg: "#e0f2fe", color: "#0369a1" },
  Dispatched: { bg: "#e6f4f1", color: "#1d7a65" },
  Received:   { bg: "#eaf3de", color: "#3b6d11" },
  Success:    { bg: "#eaf3de", color: "#3b6d11" },
  Flagged:    { bg: "#fce8e8", color: "#b91c1c" },
};

const getStatusStyle = (status) => {
  if (!status) return { bg: "#f3f4f6", color: "#374151" };
  const key = Object.keys(STATUS_STYLES).find(k =>
    status.toLowerCase().includes(k.toLowerCase())
  );
  return STATUS_STYLES[key] || { bg: "#f3f4f6", color: "#374151" };
};

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.paymentStatus || "Pending");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await axios.patch(
        `http://localhost:5200/order/update-status/${order._id}`,
        { paymentStatus: selectedStatus }
      );
      setUpdated(true);
      onStatusUpdate(order._id, selectedStatus);
      setTimeout(() => setUpdated(false), 2000);
    } catch (err) {
      console.error("Status update failed:", err.message);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      });

  const statusStyle = getStatusStyle(selectedStatus);

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 20, 15, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: flex-end;
          animation: overlayIn 0.25s ease;
        }
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }

        .modal-drawer {
          width: 580px; height: 100vh; background: #ffffff;
          overflow-y: auto; position: relative;
          animation: drawerIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex; flex-direction: column;
        }
        @keyframes drawerIn { from { transform: translateX(100%) } to { transform: translateX(0) } }

        .modal-header {
          position: sticky; top: 0; z-index: 10;
          background: #0d1f0f;
          padding: 28px 32px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .modal-body { padding: 28px 32px; flex: 1; }

        .detail-section {
          margin-bottom: 28px;
          padding-bottom: 28px;
          border-bottom: 1px solid #f0f4f0;
        }
        .detail-section:last-child { border-bottom: none; margin-bottom: 0; }

        .section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #88a088; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .detail-item label {
          font-size: 10px; color: #aab4aa; text-transform: uppercase;
          letter-spacing: 0.12em; display: block; margin-bottom: 3px;
        }
        .detail-item p {
          font-size: 13px; color: #1a2e1a; font-weight: 500; margin: 0;
        }

        .item-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0; border-bottom: 1px solid #f5f8f5;
        }
        .item-row:last-child { border-bottom: none; }

        .item-image {
          width: 52px; height: 62px; border-radius: 8px;
          background: #f0f4f0; object-fit: cover; flex-shrink: 0;
          border: 1px solid #e8ede8;
        }
        .item-image-placeholder {
          width: 52px; height: 62px; border-radius: 8px;
          background: #f0f4f0; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #e8ede8;
        }

        .status-dropdown-wrapper { position: relative; }
        .status-dropdown-btn {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #e8ede8; border-radius: 12px;
          background: #f9fbf9; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          transition: border-color 0.2s;
        }
        .status-dropdown-btn:hover { border-color: #3da066; }

        .status-dropdown-list {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: white; border: 1px solid #e8ede8; border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08); z-index: 100;
          overflow: hidden;
        }
        .status-option {
          padding: 10px 16px; cursor: pointer; font-size: 13px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .status-option:hover { background: #f5f8f5; }

        .update-btn {
          width: 100%; padding: 14px; border-radius: 12px;
          background: #0d1f0f; color: white; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 600; cursor: pointer; margin-top: 12px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s;
        }
        .update-btn:hover { background: #1a3d1a; }
        .update-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .update-btn.success { background: #3da066; }

        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #0d1f0f; margin-top: 8px;
        }
      `}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-drawer">

          {/* ── MODAL HEADER ── */}
          <div className="modal-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(201,169,110,0.8)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                  Order Dossier
                </p>
                <h2 style={{ color: "#f0f8f0", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", margin: 0, fontWeight: 600 }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(200,220,200,0.5)", fontSize: "12px", margin: "6px 0 0", fontFamily: "monospace" }}>
                  Ref: {order.paymentReference || "—"}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Status + Date chips */}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {order.paymentStatus || "Pending"}
              </span>
              <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(200,220,200,0.6)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                {orderDate}
              </span>
            </div>
          </div>

          {/* ── MODAL BODY ── */}
          <div className="modal-body">

            {/* CUSTOMER INFO */}
            <div className="detail-section">
              <p className="section-label">
                <User size={12} /> Customer Details
              </p>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{order.customer?.fullName || "—"}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p style={{ wordBreak: "break-all" }}>{order.customer?.email || "—"}</p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p>{order.customer?.phone || "—"}</p>
                </div>
                <div className="detail-item">
                  <label>City</label>
                  <p>{order.customer?.city || "—"}</p>
                </div>
                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Dispatch Address</label>
                  <p>{order.customer?.address || "—"}{order.customer?.state ? `, ${order.customer.state}` : ""}{order.customer?.country ? `, ${order.customer.country}` : ""}</p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="detail-section">
              <p className="section-label">
                <Package size={12} /> Order Items ({order.items?.length || 0})
              </p>
              {order.items && order.items.length > 0 ? (
                <>
                  {order.items.map((item, i) => (
                    <div key={i} className="item-row">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="item-image" />
                      ) : (
                        <div className="item-image-placeholder">
                          <Package size={18} color="#88a088" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e1a", margin: "0 0 4px" }}>
                          {item.name || "Unnamed Product"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#88a088", margin: 0 }}>
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " · "}
                          {item.color && `Colour: ${item.color}`}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e1a", margin: "0 0 2px" }}>
                          ₦{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}
                        </p>
                        <p style={{ fontSize: "11px", color: "#88a088", margin: 0 }}>
                          Qty: {item.qty || 1}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="total-row">
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Total
                    </span>
                    <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 600, color: "#0d1f0f" }}>
                      ₦{Number(order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <p style={{ color: "#88a088", fontSize: "13px" }}>No items found.</p>
              )}
            </div>

            {/* PAYMENT INFO */}
            <div className="detail-section">
              <p className="section-label">
                <CreditCard size={12} /> Payment Info
              </p>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Payment Status</label>
                  <p>{order.paymentStatus || "—"}</p>
                </div>
                <div className="detail-item">
                  <label>Total Amount</label>
                  <p>₦{Number(order.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Payment Reference</label>
                  <p style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    {order.paymentReference || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS UPDATE */}
            <div className="detail-section">
              <p className="section-label">
                <Hash size={12} /> Update Order Status
              </p>
              <div className="status-dropdown-wrapper">
                <button
                  className="status-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusStyle(selectedStatus).color, display: "inline-block" }} />
                    <span style={{ color: "#1a2e1a" }}>{selectedStatus}</span>
                  </div>
                  <ChevronDown size={14} color="#88a088" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>

                {dropdownOpen && (
                  <div className="status-dropdown-list">
                    {STATUS_FLOW.map((s) => (
                      <div
                        key={s}
                        className="status-option"
                        onClick={() => { setSelectedStatus(s); setDropdownOpen(false); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusStyle(s).color, display: "inline-block" }} />
                          <span>{s}</span>
                        </div>
                        {selectedStatus === s && <Check size={13} color="#3da066" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`update-btn ${updated ? "success" : ""}`}
                onClick={handleStatusUpdate}
                disabled={updating || updated}
              >
                {updating ? (
                  <><Loader2 size={14} className="animate-spin" /> Updating...</>
                ) : updated ? (
                  <><Check size={14} /> Status Updated!</>
                ) : (
                  "Save Status Update"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};


const VelouraOrdersPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5200/order/all");
        setOrders(res.data.orders || res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, paymentStatus: newStatus } : o
      )
    );
    if (selectedOrder?._id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, paymentStatus: newStatus }));
    }
  };


  const filtered = orders.filter((order) => {
    const matchFilter =
      activeFilter === "All" || order.paymentStatus === activeFilter;
    const matchSearch =
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filterOptions = ["All", "Pending", "Accept", "Processing", "In Transit", "Dispatched", "Received"];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@300;400;500;700&display=swap');

        .orders-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #e3f2e4 0%, #f1f8e9 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .sidebar-wrapper {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(232,224,213,0.5);
        }
        .main-content { flex: 1; padding: 40px; }
        .order-card-container {
          background: #ffffff; border-radius: 32px;
          border: 1px solid rgba(232,224,213,0.6);
          box-shadow: 0 10px 40px rgba(0,0,0,0.02); overflow: hidden;
        }
        .filter-scroll {
          display: flex; gap: 8px; overflow-x: auto; padding: 16px 24px;
          border-bottom: 1px solid #f0f4f0; scrollbar-width: none;
        }
        .filter-pill {
          white-space: nowrap; padding: 8px 16px; border-radius: 12px;
          font-size: 13px; border: 1px solid transparent; cursor: pointer;
          transition: all 0.2s ease; color: #88a088; background: transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .filter-pill.active { background: #2c2416; color: #f1f8e9; border-color: #2c2416; }
        .filter-pill:hover:not(.active) { background: rgba(201,169,110,0.1); color: #2c2416; }
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th {
          text-align: left; padding: 16px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #88a088;
          background: #fcfdfc; font-family: 'DM Sans', sans-serif;
        }
        .orders-table td {
          padding: 18px 24px; border-bottom: 1px solid #f8faf8;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
        }
        .orders-table tr:hover td { background: #fafcfa; }
        .status-badge {
          padding: 4px 12px; border-radius: 6px; font-size: 11px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em;
        }
        .search-container {
          padding: 24px; display: flex;
          justify-content: space-between; align-items: center;
        }
        .search-input {
          display: flex; align-items: center; background: #f9fbf9;
          border: 1px solid #edf2ed; padding: 10px 16px;
          border-radius: 14px; width: 300px;
        }
        .search-input input {
          border: none; background: transparent; outline: none;
          margin-left: 8px; width: 100%; font-family: 'DM Sans', sans-serif;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          color: #c9a96e; padding: 6px; border-radius: 8px;
          transition: background 0.15s;
        }
        .eye-btn:hover { background: rgba(201,169,110,0.1); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="orders-layout">
        <aside className="sidebar-wrapper">
          <VelouraAdminNavbar currentPage="Orders" />
        </aside>

        <main className="main-content">
          <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#88a088", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", margin: 0, color: "#0d1f0f" }}>
                Order Management
              </h1>
              <p style={{ color: "#88a088", fontSize: "14px", marginTop: "4px" }}>
                Tracking {orders.length} total shipments
              </p>
            </div>
            <button style={{ background: "#2c2416", color: "white", padding: "12px 24px", borderRadius: "14px", border: "none", cursor: "pointer", fontWeight: "500", fontFamily: "DM Sans, sans-serif" }}>
              Download Report
            </button>
          </header>

          <div className="order-card-container">
            {/* SEARCH */}
            <div className="search-container">
              <div className="search-input">
                <Search size={18} color="#88a088" />
                <input
                  type="text"
                  placeholder="Search customer, order ID or reference..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <button style={{ padding: "10px", borderRadius: "12px", border: "1px solid #edf2ed", background: "white", cursor: "pointer" }}>
                <Filter size={18} color="#88a088" />
              </button>
            </div>

            {/* FILTER PILLS */}
            <div className="filter-scroll">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  className={`filter-pill ${activeFilter === opt ? "active" : ""}`}
                  onClick={() => { setActiveFilter(opt); setCurrentPage(1); }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* TABLE */}
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "48px" }}>
                      <Loader2 size={24} color="#88a088" style={{ animation: "spin 1s linear infinite" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => {
                    const s = getStatusStyle(order.paymentStatus);
                    return (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 700, color: "#1a1814", fontFamily: "monospace", fontSize: "13px" }}>
                          {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                        </td>
                        <td style={{ fontWeight: 500 }}>{order.customer?.fullName || "—"}</td>
                        <td style={{ color: "#88a088" }}>{formatDate(order.orderDate || order.createdAt)}</td>
                        <td style={{ fontWeight: 600, fontFamily: "Cormorant Garamond, serif", fontSize: "16px" }}>
                          ₦{Number(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                            {order.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="eye-btn"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "48px", color: "#88a088" }}>
                      No orders found{activeFilter !== "All" ? ` with status "${activeFilter}"` : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfdfc" }}>
              <span style={{ fontSize: "13px", color: "#88a088" }}>
                {filtered.length > 0
                  ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} orders`
                  : "No orders"}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px", borderRadius: "10px", border: "1px solid #edf2ed", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ padding: "8px 14px", borderRadius: "10px", background: "#2c2416", color: "white", fontSize: "13px", fontWeight: 500 }}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  style={{ padding: "8px", borderRadius: "10px", border: "1px solid #edf2ed", background: "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default VelouraOrdersPage;