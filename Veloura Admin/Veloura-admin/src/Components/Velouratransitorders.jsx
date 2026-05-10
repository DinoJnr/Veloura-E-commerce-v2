import React, { useState, useEffect } from "react";
import {
  Search, Eye, X, Loader2,
  User, Package, CreditCard, MapPin
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";


const OrderModal = ({ order, onClose }) => {
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
          background: rgba(15, 30, 15, 0.6);
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
        .modal-head {
          background: #0d1f0f; padding: 28px 32px 24px;
          position: sticky; top: 0; z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .modal-section { padding: 24px 32px; border-bottom: 1px solid #f0f5f0; }
        .modal-section:last-child { border-bottom: none; }
        .sec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #88a088;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-cell label {
          font-size: 10px; color: #aab4aa; text-transform: uppercase;
          letter-spacing: 0.1em; display: block; margin-bottom: 3px;
        }
        .info-cell p { font-size: 13px; color: #1a2e1a; font-weight: 500; margin: 0; }
        .item-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0; border-bottom: 1px solid #f5f8f5;
        }
        .item-row:last-child { border-bottom: none; }
        .item-img {
          width: 50px; height: 60px; object-fit: cover;
          border-radius: 8px; border: 1px solid #e8ede8; flex-shrink: 0;
        }
        .item-placeholder {
          width: 50px; height: 60px; border-radius: 8px;
          background: #f0f5f0; border: 1px solid #e8ede8;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .total-line {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-top: 2px solid #0d1f0f; margin-top: 8px;
        }
      `}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-drawer">

          {/* HEAD */}
          <div className="modal-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "rgba(201,169,110,0.7)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
                  Transit Order
                </p>
                <h2 style={{ color: "#f0f8f0", fontFamily: "Cormorant Garamond, serif", fontSize: "26px", margin: 0, fontWeight: 600 }}>
                  {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                </h2>
                <p style={{ color: "rgba(200,220,200,0.45)", fontSize: "11px", margin: "5px 0 0", fontFamily: "monospace" }}>
                  Ref: {order.paymentReference || "—"}
                </p>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
              <span style={{ background: "#fff4e6", color: "#d97706", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {order.paymentStatus || "—"}
              </span>
              <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(200,220,200,0.55)", fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}>
                {orderDate}
              </span>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="modal-section">
            <p className="sec-title"><User size={12} /> Customer Details</p>
            <div className="info-grid">
              <div className="info-cell">
                <label>Full Name</label>
                <p>{order.customer?.fullName || "—"}</p>
              </div>
              <div className="info-cell">
                <label>Email</label>
                <p style={{ wordBreak: "break-all", fontSize: "12px" }}>{order.customer?.email || "—"}</p>
              </div>
              <div className="info-cell">
                <label>Phone</label>
                <p>{order.customer?.phone || "—"}</p>
              </div>
              <div className="info-cell">
                <label>City</label>
                <p>{order.customer?.city || "—"}</p>
              </div>
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
                  ? <img src={item.image} alt={item.name} className="item-img" />
                  : <div className="item-placeholder"><Package size={16} color="#88a088" /></div>
                }
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2e1a", margin: "0 0 3px" }}>{item.name || "—"}</p>
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
                  <p style={{ fontSize: "11px", color: "#88a088", margin: 0 }}>Qty: {item.qty || 1}</p>
                </div>
              </div>
            ))}
            <div className="total-line">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a2e1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 600, color: "#0d1f0f" }}>
                ₦{Number(order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="modal-section">
            <p className="sec-title"><CreditCard size={12} /> Payment Info</p>
            <div className="info-grid">
              <div className="info-cell">
                <label>Payment Status</label>
                <p>{order.paymentStatus || "—"}</p>
              </div>
              <div className="info-cell">
                <label>Total Amount</label>
                <p>₦{Number(order.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="info-cell" style={{ gridColumn: "1 / -1" }}>
                <label>Payment Reference</label>
                <p style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.paymentReference || "—"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

const DispatchConfirmDialog = ({ orderIds, onConfirm, onCancel, loading }) => {
  const isBulk = orderIds.length > 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(15,30,15,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "400px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.14)" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fdf4e7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <MapPin size={24} color="#c9a96e" />
        </div>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#0d1f0f", margin: "0 0 10px" }}>
          Dispatch {isBulk ? `${orderIds.length} Orders` : "Order"}?
        </h3>
        <p style={{ fontSize: "13px", color: "#88a088", margin: "0 0 28px", lineHeight: 1.6 }}>
          This will move the {isBulk ? "orders" : "order"} to <strong style={{ color: "#c9a96e" }}>Dispatched</strong> and remove {isBulk ? "them" : "it"} from Transit. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1px solid #e8ede8", background: "white", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, color: "#88a088" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", background: "#c9a96e", color: "white", cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <MapPin size={14} />}
            {loading ? "Dispatching..." : "Yes, Mark as Dispatched"}
          </button>
        </div>
      </div>
    </div>
  );
};

const VelouraTransitOrders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedIds, setSelectedIds]     = useState([]);
  const [viewOrder, setViewOrder]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm]             = useState(null); // { ids: [] }
  const [currentPage, setCurrentPage]     = useState(1);
  const PER_PAGE = 10;


  useEffect(() => { fetchTransit(); }, []);

  const fetchTransit = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5200/order/transit");
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error("Failed to fetch transit orders:", err.message);
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


  const toggleSelect = (id) =>
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((o) => o._id));


  const handleDispatch = async (ids) => {
    try {
      setActionLoading(true);
      await axios.post("http://localhost:5200/order/dispatch", { orderIds: ids });
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedIds([]);
      setConfirm(null);
    } catch (err) {
      console.error("Dispatch failed:", err.message);
      alert("Failed to dispatch order(s). Please try again.");
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

        .transit-layout {
          display: flex; min-height: 100vh;
          background: linear-gradient(135deg, #e3f2e4 0%, #f1f8e9 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .transit-sidebar {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(232,224,213,0.5);
        }
        .transit-main { flex: 1; padding: 40px; }

        .transit-table-card {
          background: #fff; border-radius: 32px;
          border: 1px solid rgba(232,224,213,0.6);
          overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.02);
        }
        .p-table { width: 100%; border-collapse: collapse; }
        .p-table th {
          text-align: left; padding: 18px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #88a088;
          background: #fcfdfc; border-bottom: 1px solid #f0f4f0;
          font-family: 'DM Sans', sans-serif;
        }
        .p-table td {
          padding: 18px 24px; border-bottom: 1px solid #f8faf8;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          vertical-align: middle;
        }
        .p-table tr:hover td { background: #fafcfa; }
        .p-table tr.selected td { background: #fdf9f0; }

        .action-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, background 0.15s;
          border: none; flex-shrink: 0;
        }
        .action-btn:hover { transform: scale(1.1); }
        .btn-view     { background: #f0f4f0; color: #2e4a2e; }
        .btn-dispatch { background: #fdf4e7; color: #c9a96e; }
        .btn-dispatch:hover { background: #c9a96e !important; color: white !important; }

        .global-btn {
          padding: 11px 22px; border-radius: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s; border: none;
        }
        .global-dispatch { background: #c9a96e; color: white; }
        .global-dispatch:hover { background: #b8935a; }
        .global-dispatch:disabled { opacity: 0.4; cursor: not-allowed; }

        .checkbox-custom {
          width: 18px; height: 18px; border-radius: 6px; cursor: pointer;
          appearance: none; border: 2px solid #ccd8cc; background: white; transition: all 0.15s;
        }
        .checkbox-custom:checked { background: #c9a96e; border-color: #c9a96e; }

        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="transit-layout">
        <aside className="transit-sidebar">
          <VelouraAdminNavbar currentPage="Transit Orders" />
        </aside>

        <main className="transit-main">

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <p style={{ color: "#88a088", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
                Veloura Admin
              </p>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", color: "#0d1f0f", margin: 0 }}>
                Orders in Transit
              </h1>
              <p style={{ color: "#88a088", fontSize: "13px", margin: "4px 0 0" }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} out for delivery
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selectedIds.length > 0 && (
                <span style={{ fontSize: "12px", color: "#88a088", marginRight: "4px" }}>
                  {selectedIds.length} selected
                </span>
              )}
              <button
                className="global-btn global-dispatch"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirm({ ids: selectedIds })}
              >
                <MapPin size={15} /> Mark as Dispatched
              </button>
            </div>
          </header>

          <div className="transit-table-card">

            {/* SEARCH BAR */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f4f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#f9fbf9", padding: "9px 16px", borderRadius: "12px", border: "1px solid #edf2ed", width: "300px" }}>
                <Search size={15} color="#88a088" />
                <input
                  type="text"
                  placeholder="Search customer, order ID or ref..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: "none", background: "transparent", marginLeft: "8px", outline: "none", width: "100%", fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                />
              </div>
              <div style={{ color: "#c9a96e", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
                <MapPin size={15} />
                {filtered.length} order{filtered.length !== 1 ? "s" : ""} in transit
              </div>
            </div>

            {/* TABLE */}
            <table className="p-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={paginated.length > 0 && selectedIds.length === paginated.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Ref</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "56px" }}>
                      <Loader2 size={24} color="#88a088" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => (
                    <tr
                      key={order._id}
                      className={selectedIds.includes(order._id) ? "selected" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={selectedIds.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: "#0d1f0f", fontFamily: "monospace", fontSize: "13px" }}>
                        {order.orderId || `#${order._id?.toString().slice(-8).toUpperCase()}`}
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, color: "#1a2e1a", margin: "0 0 2px", fontSize: "14px" }}>
                          {order.customer?.fullName || "—"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#88a088", margin: 0 }}>
                          {order.customer?.email || ""}
                        </p>
                      </td>
                      <td style={{ color: "#88a088", fontSize: "13px" }}>
                        {formatDate(order.orderDate || order.createdAt)}
                      </td>
                      <td style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "#0d1f0f" }}>
                        ₦{Number(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "11px", color: "#aab4aa" }}>
                        {order.paymentReference?.slice(-12) || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                          {/* VIEW */}
                          <button
                            className="action-btn btn-view"
                            title="View Details"
                            onClick={() => setViewOrder(order)}
                          >
                            <Eye size={15} />
                          </button>
                          {/* DISPATCH */}
                          <button
                            className="action-btn btn-dispatch"
                            title="Mark as Dispatched"
                            onClick={() => setConfirm({ ids: [order._id] })}
                          >
                            <MapPin size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "56px", color: "#88a088" }}>
                      {searchTerm ? `No orders matching "${searchTerm}"` : "No orders in transit — all delivered! 📦"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ padding: "20px 24px", background: "#fcfdfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#88a088" }}>
                {filtered.length > 0
                  ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : "No orders"}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #edf2ed", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  ←
                </button>
                <span style={{ padding: "8px 14px", borderRadius: "10px", background: "#2c2416", color: "white", fontSize: "13px", fontWeight: 500 }}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #edf2ed", background: "white", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1, fontFamily: "DM Sans, sans-serif", fontSize: "13px" }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* VIEW MODAL */}
      {viewOrder && <OrderModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {/* DISPATCH CONFIRM DIALOG */}
      {confirm && (
        <DispatchConfirmDialog
          orderIds={confirm.ids}
          loading={actionLoading}
          onCancel={() => setConfirm(null)}
          onConfirm={() => handleDispatch(confirm.ids)}
        />
      )}
    </>
  );
};

export default VelouraTransitOrders;