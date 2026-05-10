import React, { useState, useEffect } from "react";
import {
  Search, Eye, RotateCcw, X,
  ChevronLeft, ChevronRight, Loader2,
  User, Package, CreditCard, AlertTriangle,
  Trash2
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const API = "http://localhost:5200";

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onRestore }) => {
  if (!order) return null;

  const orderDate = order.orderDate || order.createdAt
    ? new Date(order.orderDate || order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(40, 15, 15, 0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: flex-end;
          animation: overlayFadeIn 0.2s ease;
        }
        @keyframes overlayFadeIn { from { opacity: 0 } to { opacity: 1 } }
        .modal-drawer {
          width: 560px; height: 100vh; background: #ffffff;
          overflow-y: auto; display: flex; flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.12);
        }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .rmodal-head {
          background: #1f0d0d; padding: 28px 32px 24px;
          position: sticky; top: 0; z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .modal-section { padding: 24px 32px; border-bottom: 1px solid #f5f0f0; }
        .modal-section:last-child { border-bottom: none; }
        .sec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #a08080;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-cell label {
          font-size: 10px; color: #b4aaaa; text-transform: uppercase;
          letter-spacing: 0.1em; display: block; margin-bottom: 3px;
        }
        .info-cell p { font-size: 13px; color: #2e1a1a; font-weight: 500; margin: 0; }
        .item-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #faf5f5;
        }
        .item-row:last-child { border-bottom: none; }
        .total-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #1f0d0d; margin-top: 8px;
        }
        .restore-drawer-btn {
          flex: 1; padding: 13px; border-radius: 12px; border: none;
          background: #7c2d12; color: white; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s;
        }
        .restore-drawer-btn:hover { background: #6b2110; }
      `}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-drawer">

          {/* HEAD */}
          <div className="rmodal-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(220,80,80,0.7)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                  Rejected Order
                </p>
                <h2 style={{ color: "#f8f0f0", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", margin: 0, fontWeight: 600 }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(220,200,200,0.45)", fontSize: "11px", margin: "5px 0 0", fontFamily: "monospace" }}>
                  Ref: {order.paymentReference || "—"}
                </p>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Rejected
              </span>
              <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(220,200,200,0.55)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                {orderDate}
              </span>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="modal-section">
            <p className="sec-title"><User size={12} /> Customer Details</p>
            <div className="info-grid">
              <div className="info-cell"><label>Full Name</label><p>{order.customer?.fullName || "—"}</p></div>
              <div className="info-cell"><label>Email</label><p style={{ wordBreak: "break-all", fontSize: "12px" }}>{order.customer?.email || "—"}</p></div>
              <div className="info-cell"><label>Phone</label><p>{order.customer?.phone || "—"}</p></div>
              <div className="info-cell"><label>City</label><p>{order.customer?.city || "—"}</p></div>
              <div className="info-cell" style={{ gridColumn: "1 / -1" }}>
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
          <div className="modal-section">
            <p className="sec-title"><Package size={12} /> Order Items ({order.items?.length || 0})</p>
            {order.items?.map((item, i) => (
              <div key={i} className="item-row">
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: "50px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ede8e8", flexShrink: 0 }} />
                  : <div style={{ width: "50px", height: "60px", borderRadius: "8px", background: "#faf0f0", border: "1px solid #ede8e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package size={16} color="#a08080" />
                    </div>
                }
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#2e1a1a", margin: "0 0 3px" }}>{item.name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#a08080", margin: 0 }}>
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " · "}
                    {item.color && `Colour: ${item.color}`}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#2e1a1a", margin: "0 0 2px" }}>
                    ₦{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "#a08080", margin: 0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            <div className="total-line">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#2e1a1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 600, color: "#1f0d0d" }}>
                ₦{Number(order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="modal-section">
            <p className="sec-title"><CreditCard size={12} /> Payment Info</p>
            <div className="info-grid">
              <div className="info-cell"><label>Payment Status</label><p>{order.paymentStatus || "—"}</p></div>
              <div className="info-cell"><label>Total Amount</label><p>₦{Number(order.totalAmount || 0).toLocaleString()}</p></div>
              <div className="info-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Payment Reference</label>
                <p style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.paymentReference || "—"}</p>
              </div>
            </div>
          </div>

          {/* RESTORE ACTION */}
          <div className="modal-section">
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #ede8e8", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#a08080" }}>
                Close
              </button>
              <button className="restore-drawer-btn" onClick={() => onRestore([order._id])}>
                <RotateCcw size={14} /> Restore to Pending
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ type, count, onConfirm, onCancel, loading }) => {
  const isRestore = type === "restore";
  const label = isRestore ? "Restore" : "Delete";
  const icon = isRestore ? <RotateCcw size={24} color="#7c2d12" /> : <Trash2 size={24} color="#a32d2d" />;
  const iconBg = isRestore ? "#fee7d4" : "#fcebeb";
  const btnBg = isRestore ? "#7c2d12" : "#a32d2d";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(30,10,10,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "400px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.14)" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#1f0d0d", margin: "0 0 10px" }}>
          {label} {count > 1 ? `${count} Orders` : "Order"}?
        </h3>
        <p style={{ fontSize: "13px", color: "#a08080", margin: "0 0 28px", lineHeight: 1.6 }}>
          {isRestore
            ? "This will move the order(s) back to Pending and All Orders for review."
            : "This will permanently delete the order(s) from the rejected archive. This cannot be undone."}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #ede8e8", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#a08080" }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", background: btnBg, color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Loader2 size={14} style={{ animation: "rspin 1s linear infinite" }} />}
            {loading ? "Processing..." : `Yes, ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const VelouraRejected = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewOrder, setViewOrder]     = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm]         = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchRejected(); }, []);

  const fetchRejected = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/order/rejected`);
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

  
  const handleRestore = async (ids) => {
    try {
      setActionLoading(true);
      await axios.post(`${API}/order/restore-rejected`, { orderIds: ids });
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedIds([]);
      setConfirm(null);
      setViewOrder(null);
    } catch (err) {
      console.error("Restore failed:", err.message);
      alert("Failed to restore order(s). Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  
  const handleDelete = async (ids) => {
    try {
      setActionLoading(true);
      await axios.post(`${API}/order/delete-rejected`, { orderIds: ids });
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedIds([]);
      setConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert("Failed to delete order(s). Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@300;400;500;700&display=swap');

        .rejected-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #f9eeee 0%, #fdf5f5 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .rejected-sidebar {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(232,213,213,0.5);
        }
        .rejected-main { flex: 1; padding: 40px; overflow-y: auto; }

        .rejected-table-card {
          background: #fff; border-radius: 32px;
          border: 1px solid rgba(232,213,213,0.6);
          overflow: hidden; box-shadow: 0 10px 40px rgba(163,45,45,0.04);
        }
        .r-table { width: 100%; border-collapse: collapse; }
        .r-table th {
          text-align: left; padding: 18px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #a08080;
          background: #fdfafa; border-bottom: 1px solid #f5eded;
          font-family: 'DM Sans', sans-serif;
        }
        .r-table td {
          padding: 18px 24px; border-bottom: 1px solid #fdf8f8;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          vertical-align: middle;
        }
        .r-table tr:hover td { background: #fdf7f7; }
        .r-table tr.r-selected td { background: #fef0f0; }

        .r-action-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, background 0.15s;
          border: none; flex-shrink: 0;
        }
        .r-action-btn:hover { transform: scale(1.1); }
        .btn-view    { background: #f5f0f0; color: #5a2e2e; }
        .btn-restore { background: #fee7d4; color: #7c2d12; }
        .btn-delete  { background: #fcebeb; color: #a32d2d; }

        .r-global-btn {
          padding: 11px 22px; border-radius: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s; border: none;
        }
        .r-global-restore { background: #7c2d12; color: #fef3f2; }
        .r-global-restore:hover { background: #6b2110; }
        .r-global-restore:disabled { opacity: 0.4; cursor: not-allowed; }
        .r-global-delete { background: white; color: #a32d2d; border: 1px solid #fcebeb !important; }
        .r-global-delete:hover { background: #fcebeb; }
        .r-global-delete:disabled { opacity: 0.4; cursor: not-allowed; }

        .r-checkbox {
          width: 18px; height: 18px; border-radius: 6px; cursor: pointer;
          appearance: none; border: 2px solid #d8cccc; background: white; transition: all 0.15s;
        }
        .r-checkbox:checked { background: #7c2d12; border-color: #7c2d12; }

        @keyframes rspin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="rejected-layout">
        <aside className="rejected-sidebar">
          <VelouraAdminNavbar currentPage="Rejected Orders" />
        </aside>

        <main className="rejected-main">

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <p style={{ color: "#a08080", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#1f0d0d", margin: 0 }}>
                Rejected Orders
              </h1>
              <p style={{ color: "#a08080", fontSize: "13px", margin: "4px 0 0" }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} in rejection archive
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selectedIds.length > 0 && (
                <span style={{ fontSize: "12px", color: "#a08080", marginRight: "4px" }}>
                  {selectedIds.length} selected
                </span>
              )}
              <button
                className="r-global-btn r-global-delete"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirm({ type: "delete", ids: selectedIds })}
              >
                <Trash2 size={15} /> Delete Selected
              </button>
              <button
                className="r-global-btn r-global-restore"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirm({ type: "restore", ids: selectedIds })}
              >
                <RotateCcw size={15} /> Restore Selected
              </button>
            </div>
          </header>

          <div className="rejected-table-card">

            {/* SEARCH BAR */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f5eded", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#fdf8f8", padding: "9px 16px", borderRadius: "12px", border: "1px solid #f0e8e8", width: "300px" }}>
                <Search size={15} color="#a08080" />
                <input
                  type="text"
                  placeholder="Search customer, order ID or ref..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: "none", background: "transparent", marginLeft: "8px", outline: "none", width: "100%", fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                />
              </div>
              <div style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
                <AlertTriangle size={15} />
                {filtered.length} rejected order{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* TABLE */}
            <table className="r-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>
                    <input
                      type="checkbox"
                      className="r-checkbox"
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
                      <Loader2 size={24} color="#a08080" style={{ animation: "rspin 1s linear infinite", display: "inline-block" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => (
                    <tr key={order._id} className={selectedIds.includes(order._id) ? "r-selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          className="r-checkbox"
                          checked={selectedIds.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: "#1f0d0d", fontFamily: "monospace", fontSize: "13px" }}>
                        {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, color: "#2e1a1a", margin: "0 0 2px", fontSize: "14px" }}>
                          {order.customer?.fullName || "—"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#a08080", margin: 0 }}>
                          {order.customer?.email || ""}
                        </p>
                      </td>
                      <td style={{ color: "#a08080", fontSize: "13px" }}>
                        {formatDate(order.createdAt || order.orderDate)}
                      </td>
                      <td style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "#1f0d0d" }}>
                        ₦{Number(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {order.paymentStatus || "Rejected"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          {/* VIEW */}
                          <button className="r-action-btn btn-view" title="View Details" onClick={() => setViewOrder(order)}>
                            <Eye size={15} />
                          </button>
                          {/* RESTORE */}
                          <button className="r-action-btn btn-restore" title="Restore to Pending" onClick={() => setConfirm({ type: "restore", ids: [order._id] })}>
                            <RotateCcw size={15} />
                          </button>
                          {/* DELETE */}
                          <button className="r-action-btn btn-delete" title="Delete Permanently" onClick={() => setConfirm({ type: "delete", ids: [order._id] })}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "56px", color: "#a08080" }}>
                      {searchTerm ? `No orders matching "${searchTerm}"` : "No rejected orders in the archive ✅"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: "20px 24px", background: "#fdfafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#a08080" }}>
                {filtered.length > 0
                  ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : "No orders"}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #f0e8e8", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  ←
                </button>
                <span style={{ padding: "8px 14px", borderRadius: "10px", background: "#1f0d0d", color: "white", fontSize: "13px", fontWeight: 500 }}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #f0e8e8", background: "white", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
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
          onRestore={(ids) => setConfirm({ type: "restore", ids })}
        />
      )}

      {/* CONFIRM DIALOG */}
      {confirm && (
        <ConfirmDialog
          type={confirm.type}
          count={confirm.ids.length}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() =>
            confirm.type === "restore"
              ? handleRestore(confirm.ids)
              : handleDelete(confirm.ids)
          }
        />
      )}
    </>
  );
};

export default VelouraRejected;