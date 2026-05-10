import React, { useState } from "react";
import { 
  Search, CheckCircle2, Play, 
  MoreVertical, ChevronLeft, ChevronRight, ShoppingBag 
} from "lucide-react";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const VelouraAcceptedOrders = () => {
  const [orders, setOrders] = useState([
    { id: "#VL-09820", date: "Oct 12, 2025", customer: "Chisom Eze", items: "2 Items", total: "₦134,000" },
    { id: "#VL-09815", date: "Oct 13, 2025", customer: "Bolanle Raheem", items: "1 Item", total: "₦56,000" },
    { id: "#VL-09799", date: "Oct 13, 2025", customer: "Sade Adu", items: "3 Items", total: "₦192,500" },
  ]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@300;400;500;700&display=swap');
        
        .orders-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f2e4 0%, #f1f8e9 100%);
          font-family: 'DM Sans', sans-serif;
        }

        .sidebar-wrapper {
          width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
          background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px);
          border-right: 1px solid rgba(232, 224, 213, 0.5);
        }

        .main-content { flex: 1; padding: 40px; max-width: 1200px; margin: 0 auto; }

        .veloura-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .brand-section h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          color: #2c2416;
          margin: 0;
        }

        .order-table-card {
          background: #ffffff;
          border-radius: 32px;
          border: 1px solid rgba(232, 224, 213, 0.6);
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.02);
        }

        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th {
          text-align: left; padding: 20px 24px; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #88a088;
          background: #fcfdfc; border-bottom: 1px solid #f0f4f0;
        }

        .orders-table td { padding: 20px 24px; border-bottom: 1px solid #f8faf8; font-size: 15px; }

        .btn-move-next {
          background: #2c2416;
          color: #f1f8e9;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-move-next:hover { opacity: 0.9; transform: translateY(-1px); }

        .item-count {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #88a088;
          font-size: 13px;
        }
      `}</style>

      <div className="orders-layout">
        <aside className="sidebar-wrapper">
          <VelouraAdminNavbar currentPage="Orders" />
        </aside>

        <main className="main-content">
          <header className="veloura-header">
            <div className="brand-section">
              <p style={{ color: "#88a088", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px" }}>Veloura</p>
              <h1>Accepted Orders</h1>
            </div>
            
            <button style={{ background: 'white', border: '1px solid #edf2ed', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '600' }}>
               Move All to Processing
            </button>
          </header>

          <div className="order-table-card">
            <div style={{ padding: '24px', borderBottom: '1px solid #f0f4f0' }}>
               <div style={{ display: 'flex', alignItems: 'center', background: '#f9fbf9', padding: '10px 16px', borderRadius: '14px', border: '1px solid #edf2ed', width: '300px' }}>
                  <Search size={18} color="#88a088" />
                  <input type="text" placeholder="Find an order..." style={{ border: 'none', background: 'transparent', marginLeft: '8px', outline: 'none', width: '100%' }} />
               </div>
            </div>

            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Purchased</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Next Step</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#2c2416' }}>{order.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: '#88a088' }}>{order.date}</div>
                    </td>
                    <td>
                      <div className="item-count">
                        <ShoppingBag size={14} />
                        {order.items}
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{order.total}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-move-next">
                          Start Processing <Play size={14} fill="currentColor"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
};

export default VelouraAcceptedOrders;