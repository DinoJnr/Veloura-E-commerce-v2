import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Package, 
  RefreshCcw, MessageSquare, CreditCard, Settings, 
  User, Menu, X, ChevronDown, ListOrdered, LogOut
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, badge, onClick, subItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button 
        onClick={() => {
          if (subItems.length > 0) setIsOpen(!isOpen);
          if (onClick) onClick();
        }}
        className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group
        ${active ? 'bg-[#eef9f2] text-[#3da066]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#3da066]'}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={active ? 'text-[#3da066]' : 'group-hover:text-[#3da066]'} />
          <span className="font-semibold text-[14px]">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {badge && <span className="bg-[#3da066] text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
          {subItems.length > 0 && (
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>
      
      {isOpen && subItems.length > 0 && (
        <div className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-[#eef9f2]">
          {subItems.map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action}
              className="text-left py-2 px-4 text-[13px] text-gray-400 hover:text-[#3da066] transition-colors font-medium"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const VelouraAdminNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    // Clear all Veloura-specific keys
    localStorage.removeItem("veloura_token");
    localStorage.removeItem("veloura_user");
    // Belt-and-suspenders: clear everything session-related
    sessionStorage.clear();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const orderFlowSubItems = [
    { name: 'Overview Master', action: () => { navigate("/admin/orders"); setIsMobileMenuOpen(false); } },
    { name: 'Pending', action: () => { navigate("/admin/pendngorders"); setIsMobileMenuOpen(false); } },
    { name: 'Processing', action: () => { navigate("/admin/processing"); setIsMobileMenuOpen(false); } },
    { name: 'In Transit', action: () => { navigate("/admin/transit"); setIsMobileMenuOpen(false); } },
    { name: 'Dispatched', action: () => { navigate("/admin/dispatched"); setIsMobileMenuOpen(false); } },
    { name: 'Received', action: () => { navigate("/admin/recieved"); setIsMobileMenuOpen(false); } },
    { name: 'Rejected', action: () => { navigate("/admin/rejected"); setIsMobileMenuOpen(false); } },
    { name: 'Refund', action: () => { navigate("/admin/refund"); setIsMobileMenuOpen(false); } },
  ];

  return (
    <>
      {/* ── LOGOUT CONFIRMATION MODAL ─────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 w-[320px] mx-4 flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={24} className="text-red-500" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Sign out?</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                You will be signed out of the Veloura admin panel. Any unsaved changes will be lost.
              </p>
            </div>

            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-gray-100 p-6 overflow-y-auto custom-scrollbar">
        
        <div className="mb-10 flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <div className="w-9 h-9 bg-[#3da066] rounded-xl flex items-center justify-content:center text-white shadow-lg shadow-green-100">
            <span className="font-bold text-lg mx-auto">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 leading-tight">Veloura.</h1>
            <p className="text-[10px] text-gray-400 font-medium">MANAGEMENT SYSTEM</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-bold mb-3 px-3">Admin Panel</p>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={isActive("/admin/dashboard")} 
            onClick={() => navigate("/admin/dashboard")}
          />
          <SidebarItem 
            icon={PlusCircle} 
            label="Add Product" 
            active={isActive("/admin/addproduct")} 
            onClick={() => navigate("/admin/addproduct")}
          />
          <SidebarItem 
            icon={Package} 
            label="Products Catalog" 
            active={isActive("/admin/products") || isActive("/admin/viewproduct")} 
            onClick={() => navigate("/admin/products")}
          />

          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-bold mt-8 mb-3 px-3">Logistics</p>
          <SidebarItem 
            icon={ListOrdered} 
            label="Order Flow" 
            active={location.pathname.startsWith("/admin/order") && !location.pathname.includes("return")}
            subItems={orderFlowSubItems}
          />
          <SidebarItem 
            icon={RefreshCcw} 
            label="Return Center" 
            active={isActive("/admin/return-pending")}
            subItems={[
              { name: 'Return Process', action: () => { navigate("/admin/return-pending"); setIsMobileMenuOpen(false); } },
            ]}
          />

          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-bold mt-8 mb-3 px-3">Service</p>
          <SidebarItem 
            icon={MessageSquare} 
            label="Inquiries" 
            active={isActive("/admin/pending-inquries")}
            subItems={[
              { name: 'Inquiry Pending', action: () => { navigate("/admin/pending-inquries"); setIsMobileMenuOpen(false); } }
            ]} 
          />
          <SidebarItem 
            icon={CreditCard} 
            label="Transactions" 
            active={isActive("/admin/transaction")}
            subItems={[
              { name: 'All Transactions', action: () => { navigate("/admin/transaction"); setIsMobileMenuOpen(false); } }
            ]} 
          />

          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-bold mt-8 mb-3 px-3">Account</p>
          <SidebarItem 
            icon={Settings} 
            label="System Settings" 
            active={isActive("/admin/setting")}
            onClick={() => navigate("/admin/setting")}
          />
        </nav>

        {/* ── Profile + Logout ── */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between px-2">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate("/admin/profile")}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
              ${isActive("/admin/profile") 
                ? 'bg-[#3da066] border-[#3da066]' 
                : 'bg-[#eef9f2] border-[#3da066]/10 group-hover:border-[#3da066]/30'}`}>
              <User size={20} className={isActive("/admin/profile") ? "text-white" : "text-[#3da066]"} />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${isActive("/admin/profile") ? "text-[#3da066]" : "text-gray-800"}`}>
                Filip Legierski
              </span>
              <span className="text-[11px] text-gray-400">Super Admin</span>
            </div>
          </div>

          {/* Logout button */}
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ────────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => navigate("/admin/dashboard")}>
          <div className="w-7 h-7 bg-[#3da066] rounded-lg flex items-center justify-center text-white text-xs font-bold">V</div>
          <h1 className="font-bold text-gray-800 text-lg">Veloura.</h1>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE NAV DRAWER ─────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-[280px] h-full bg-white p-6 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Admin Menu</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { navigate("/admin/dashboard"); setIsMobileMenuOpen(false); }} className="text-left py-2 font-semibold text-gray-600">Dashboard</button>
              <button onClick={() => { navigate("/admin/addproduct"); setIsMobileMenuOpen(false); }} className="text-left py-2 font-semibold text-gray-600">Add Product</button>
              <button onClick={() => { navigate("/admin/products"); setIsMobileMenuOpen(false); }} className="text-left py-2 font-semibold text-gray-600">Products</button>
              <div className="border-t my-2 pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Logistics & Service</p>
                {orderFlowSubItems.map((item, idx) => (
                  <button key={idx} onClick={item.action} className="block w-full text-left py-2 pl-4 text-sm text-gray-500">{item.name}</button>
                ))}
                <button onClick={() => { navigate("/admin/return-pending"); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 pl-4 text-sm text-gray-500">Return Center</button>
                <button onClick={() => { navigate("/admin/pending-inquries"); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 pl-4 text-sm text-gray-500">Pending Inquiries</button>
                <button onClick={() => { navigate("/admin/transaction"); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 pl-4 text-sm text-gray-500">Transactions</button>
              </div>
              <div className="border-t mt-2 pt-4 flex flex-col gap-1">
                <button onClick={() => { navigate("/admin/setting"); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 py-2 font-semibold text-gray-600">
                  <Settings size={18}/> Settings
                </button>
                <button onClick={() => { navigate("/admin/profile"); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 py-2 font-semibold text-gray-600">
                  <User size={18}/> My Profile
                </button>
                {/* Logout in drawer */}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setShowLogoutConfirm(true); }} 
                  className="flex items-center gap-2 py-2 font-semibold text-red-500 mt-2"
                >
                  <LogOut size={18}/> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

  
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl flex justify-around p-4 z-50">
        <button onClick={() => navigate("/admin/dashboard")}>
          <LayoutDashboard size={22} className={isActive("/admin/dashboard") ? "text-[#3da066]" : "text-gray-400"} />
        </button>
        <button onClick={() => navigate("/admin/orders")}>
          <ListOrdered size={22} className={isActive("/admin/orders") ? "text-[#3da066]" : "text-gray-400"} />
        </button>
        <button onClick={() => navigate("/admin/pending-inquries")}>
          <MessageSquare size={22} className={isActive("/admin/pending-inquries") ? "text-[#3da066]" : "text-gray-400"} />
        </button>
        <button onClick={() => navigate("/admin/profile")}>
          <User size={22} className={isActive("/admin/profile") ? "text-[#3da066]" : "text-gray-400"} />
        </button>
        <button onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={22} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </>
  );
};

export default VelouraAdminNavbar;