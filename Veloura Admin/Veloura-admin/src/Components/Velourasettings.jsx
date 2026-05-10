import React, { useState, useEffect } from "react";
import {
  User, Store, Bell, ShieldAlert, Truck,
  Save, Eye, EyeOff, ToggleLeft, ToggleRight,
  Trash2, Loader2, Check, AlertTriangle, X,
  ChevronRight, Lock, Mail, Phone, MapPin,
  Globe, Clock, DollarSign, Power,
} from "lucide-react";
import axios from "axios";
import VelouraAdminNavbar from "./VelouraAdminNavbar";

const API      = "http://localhost:5200";
const ADMIN_ID = localStorage.getItem("adminId") || ""; // adjust to your auth setup

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const colors = { success: "#0a7c5c", error: "#dc2626", info: "#0a1e28" };
  return (
    <div style={{ position:"fixed", bottom:"32px", right:"32px", zIndex:9999, background: colors[type] || colors.info, color:"#fff", padding:"14px 22px", borderRadius:"14px", fontSize:"13px", fontWeight:600, fontFamily:"DM Sans,sans-serif", boxShadow:"0 8px 32px rgba(0,0,0,0.18)", display:"flex", alignItems:"center", gap:"10px", animation:"toastIn 0.3s ease" }}>
      {type === "success" ? <Check size={15} /> : type === "error" ? <X size={15} /> : null}
      {msg}
    </div>
  );
};

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
const Section = ({ id, icon: Icon, title, subtitle, accent = "#0a7c5c", children, activeSection, setActiveSection }) => {
  const open = activeSection === id;
  return (
    <div style={{ background:"#fff", borderRadius:"20px", border:"1px solid rgba(180,210,220,0.5)", overflow:"hidden", boxShadow:"0 4px 20px rgba(10,50,70,0.05)", marginBottom:"16px" }}>
      <button onClick={() => setActiveSection(open ? null : id)} style={{ width:"100%", padding:"22px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"none", background:"transparent", cursor:"pointer", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:`${accent}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={18} color={accent} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:"15px", fontWeight:700, color:"#0a1e28", fontFamily:"DM Sans,sans-serif" }}>{title}</p>
            <p style={{ margin:0, fontSize:"12px", color:"#7a9aaa", fontFamily:"DM Sans,sans-serif" }}>{subtitle}</p>
          </div>
        </div>
        <ChevronRight size={16} color="#7a9aaa" style={{ transform: open ? "rotate(90deg)" : "none", transition:"transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ padding:"0 28px 28px", borderTop:"1px solid #f0f5f7" }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── FIELD ────────────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, readOnly, hint }) => {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom:"16px" }}>
      <label style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"#7a9aaa", display:"block", marginBottom:"6px", fontFamily:"DM Sans,sans-serif" }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", background: readOnly ? "#f8fbfc" : "#fff", border:"1px solid #e0edf2", borderRadius:"12px", padding:"0 14px", transition:"border-color 0.2s" }}
        onFocus={() => {}} >
        {Icon && <Icon size={14} color="#7a9aaa" style={{ flexShrink:0 }} />}
        <input
          type={isPass && !show ? "password" : "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ flex:1, border:"none", background:"transparent", padding:"12px 10px", fontSize:"13px", color:"#1a2e38", fontFamily:"DM Sans,sans-serif", outline:"none" }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} style={{ background:"none", border:"none", cursor:"pointer", color:"#7a9aaa", display:"flex" }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {hint && <p style={{ margin:"4px 0 0 2px", fontSize:"11px", color:"#7a9aaa", fontFamily:"DM Sans,sans-serif" }}>{hint}</p>}
    </div>
  );
};

// ─── SAVE BTN ─────────────────────────────────────────────────────────────────
const SaveBtn = ({ loading, onClick, label = "Save Changes" }) => (
  <button onClick={onClick} disabled={loading} style={{ marginTop:"8px", padding:"12px 24px", borderRadius:"12px", border:"none", background: loading ? "#a7d9c8" : "linear-gradient(135deg,#0a7c5c 0%,#0d9a70 100%)", color:"#fff", fontFamily:"DM Sans,sans-serif", fontSize:"13px", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:"8px", boxShadow: loading ? "none" : "0 4px 16px rgba(10,124,92,0.25)" }}>
    {loading ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> : <Save size={14} />}
    {loading ? "Saving…" : label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const VelouraSettings = () => {
  const [activeSection, setActiveSection] = useState("admin");
  const [toast, setToast]                 = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Admin Account ──────────────────────────────────────────────────────────
  const [admin, setAdmin]             = useState({ fullName:"", email:"" });
  const [adminPass, setAdminPass]     = useState({ current:"", next:"", confirm:"" });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!ADMIN_ID) return;
    axios.get(`${API}/settings/admin/${ADMIN_ID}`)
      .then(r => setAdmin({ fullName: r.data.admin.fullName, email: r.data.admin.email }))
      .catch(() => {});
  }, []);

  const saveAdmin = async () => {
    if (adminPass.next && adminPass.next !== adminPass.confirm)
      return showToast("New passwords do not match.", "error");
    try {
      setAdminLoading(true);
      const body = { fullName: admin.fullName, email: admin.email };
      if (adminPass.next) { body.currentPassword = adminPass.current; body.newPassword = adminPass.next; }
      await axios.patch(`${API}/settings/admin/${ADMIN_ID}`, body);
      setAdminPass({ current:"", next:"", confirm:"" });
      showToast("Admin account updated.");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally { setAdminLoading(false); }
  };

  // ── Store Info ─────────────────────────────────────────────────────────────
  const [store, setStore]             = useState({ name:"Veloura", email:"", phone:"", address:"", city:"", country:"Nigeria", currency:"NGN", timezone:"Africa/Lagos", website:"" });
  const [storeLoading, setStoreLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/settings/store`)
      .then(r => setStore(s => ({ ...s, ...r.data.store })))
      .catch(() => {});
  }, []);

  const saveStore = async () => {
    try {
      setStoreLoading(true);
      await axios.patch(`${API}/settings/store`, store);
      showToast("Store info saved.");
    } catch { showToast("Failed to save store info.", "error"); }
    finally { setStoreLoading(false); }
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({ newOrder:true, refundRequest:true, returnRequest:true, lowStock:false, loginAlert:true });
  const toggleNotif = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  const notifItems = [
    { key:"newOrder",       label:"New Order",          desc:"Alert when a new order is placed" },
    { key:"refundRequest",  label:"Refund Request",     desc:"Alert when a refund is initiated" },
    { key:"returnRequest",  label:"Return Request",     desc:"Alert when a return is submitted" },
    { key:"lowStock",       label:"Low Stock Warning",  desc:"Alert when product stock is low" },
    { key:"loginAlert",     label:"Admin Login Alert",  desc:"Alert on new admin session" },
  ];

  // ── Logistics Admins ───────────────────────────────────────────────────────
  const [logistics, setLogistics]           = useState([]);
  const [logisticsLoading, setLogisticsLoading] = useState(true);
  const [actionId, setActionId]             = useState(null);
  const [deleteConfirm, setDeleteConfirm]   = useState(null);

  useEffect(() => {
    axios.get(`${API}/settings/logistics`)
      .then(r => setLogistics(r.data.logistics || []))
      .catch(() => {})
      .finally(() => setLogisticsLoading(false));
  }, []);

  const toggleActive = async (id) => {
    try {
      setActionId(id);
      const res = await axios.patch(`${API}/settings/logistics/${id}/toggle`);
      setLogistics(prev => prev.map(l => l._id === id ? { ...l, isActive: res.data.isActive } : l));
      showToast(res.data.message);
    } catch { showToast("Toggle failed.", "error"); }
    finally { setActionId(null); }
  };

  const deleteLogistics = async (id) => {
    try {
      setActionId(id);
      await axios.delete(`${API}/settings/logistics/${id}`);
      setLogistics(prev => prev.filter(l => l._id !== id));
      setDeleteConfirm(null);
      showToast("Logistics account deleted.");
    } catch { showToast("Delete failed.", "error"); }
    finally { setActionId(null); }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .stg-layout { display:flex;min-height:100vh;background:linear-gradient(135deg,#eef5f8 0%,#f4f9fb 100%);font-family:'DM Sans',sans-serif; }
        .stg-sidebar { width:260px;flex-shrink:0;position:sticky;top:0;height:100vh;background:rgba(255,255,255,0.45);backdrop-filter:blur(10px);border-right:1px solid rgba(180,210,220,0.4); }
        .stg-main { flex:1;padding:40px;overflow-y:auto;max-width:820px; }
        .toggle-track { width:44px;height:24px;border-radius:12px;position:relative;cursor:pointer;transition:background 0.2s;border:none;padding:0;flex-shrink:0; }
        .toggle-thumb { width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2); }
        .logistics-row { display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f0f5f7; }
        .logistics-row:last-child { border-bottom:none; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .danger-btn { padding:11px 20px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.2s; }
      `}</style>

      <div className="stg-layout">
        <aside className="stg-sidebar">
          <VelouraAdminNavbar currentPage="Settings" />
        </aside>

        <main className="stg-main">
          {/* HEADER */}
          <header style={{ marginBottom:"36px" }}>
            <p style={{ color:"#7a9aaa", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.2em", margin:"0 0 6px" }}>Veloura Admin</p>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"38px", color:"#0a1e28", margin:"0 0 4px" }}>System Settings</h1>
            <p style={{ color:"#7a9aaa", fontSize:"13px", margin:0 }}>Manage your store, account and team access</p>
          </header>

          {/* ── ADMIN ACCOUNT ─────────────────────────────────────────────── */}
          <Section id="admin" icon={User} title="Admin Account" subtitle="Update your name, email and password" activeSection={activeSection} setActiveSection={setActiveSection}>
            <div style={{ paddingTop:"20px" }}>
              <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#7a9aaa", margin:"0 0 14px" }}>Profile</p>
              <Field label="Full Name" icon={User} value={admin.fullName} onChange={e => setAdmin(a => ({ ...a, fullName: e.target.value }))} placeholder="Your full name" />
              <Field label="Email Address" icon={Mail} value={admin.email} onChange={e => setAdmin(a => ({ ...a, email: e.target.value }))} placeholder="admin@veloura.com" />

              <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#7a9aaa", margin:"20px 0 14px" }}>Change Password</p>
              <Field label="Current Password" icon={Lock} type="password" value={adminPass.current} onChange={e => setAdminPass(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
              <Field label="New Password" icon={Lock} type="password" value={adminPass.next} onChange={e => setAdminPass(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" />
              <Field label="Confirm New Password" icon={Lock} type="password" value={adminPass.confirm} onChange={e => setAdminPass(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
              <SaveBtn loading={adminLoading} onClick={saveAdmin} />
            </div>
          </Section>

          {/* ── STORE INFO ─────────────────────────────────────────────────── */}
          <Section id="store" icon={Store} title="Store Information" subtitle="Business details displayed on receipts and emails" accent="#2563eb" activeSection={activeSection} setActiveSection={setActiveSection}>
            <div style={{ paddingTop:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <Field label="Store Name"    icon={Store}        value={store.name}     onChange={e => setStore(s => ({ ...s, name: e.target.value }))}     placeholder="Veloura" />
                <Field label="Support Email" icon={Mail}         value={store.email}    onChange={e => setStore(s => ({ ...s, email: e.target.value }))}    placeholder="support@veloura.com" />
                <Field label="Phone"         icon={Phone}        value={store.phone}    onChange={e => setStore(s => ({ ...s, phone: e.target.value }))}    placeholder="+234 800 000 0000" />
                <Field label="Website"       icon={Globe}        value={store.website}  onChange={e => setStore(s => ({ ...s, website: e.target.value }))}  placeholder="https://veloura.com" />
                <Field label="City"          icon={MapPin}       value={store.city}     onChange={e => setStore(s => ({ ...s, city: e.target.value }))}     placeholder="Lagos" />
                <Field label="Country"       icon={MapPin}       value={store.country}  onChange={e => setStore(s => ({ ...s, country: e.target.value }))}  placeholder="Nigeria" />
                <Field label="Currency"      icon={DollarSign}   value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))} placeholder="NGN" />
                <Field label="Timezone"      icon={Clock}        value={store.timezone} onChange={e => setStore(s => ({ ...s, timezone: e.target.value }))} placeholder="Africa/Lagos" />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <Field label="Address" icon={MapPin} value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} placeholder="123 Fashion Street, VI" />
              </div>
              <SaveBtn loading={storeLoading} onClick={saveStore} />
            </div>
          </Section>

          {/* ── NOTIFICATIONS ──────────────────────────────────────────────── */}
          <Section id="notifs" icon={Bell} title="Notifications" subtitle="Choose which alerts you receive" accent="#d97706" activeSection={activeSection} setActiveSection={setActiveSection}>
            <div style={{ paddingTop:"20px" }}>
              {notifItems.map(({ key, label, desc }) => (
                <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f0f5f7" }}>
                  <div>
                    <p style={{ margin:0, fontSize:"14px", fontWeight:600, color:"#1a2e38" }}>{label}</p>
                    <p style={{ margin:0, fontSize:"12px", color:"#7a9aaa" }}>{desc}</p>
                  </div>
                  <button className="toggle-track" onClick={() => toggleNotif(key)} style={{ background: notifs[key] ? "#0a7c5c" : "#e0edf2" }}>
                    <div className="toggle-thumb" style={{ left: notifs[key] ? "23px" : "3px" }} />
                  </button>
                </div>
              ))}
              <SaveBtn onClick={() => showToast("Notification preferences saved.")} label="Save Preferences" />
            </div>
          </Section>

          {/* ── LOGISTICS ADMINS ───────────────────────────────────────────── */}
          <Section id="logistics" icon={Truck} title="Logistics Admins" subtitle="Manage logistics team access and accounts" accent="#7c3aed" activeSection={activeSection} setActiveSection={setActiveSection}>
            <div style={{ paddingTop:"20px" }}>
              {logisticsLoading ? (
                <div style={{ textAlign:"center", padding:"32px" }}>
                  <Loader2 size={22} color="#7a9aaa" style={{ animation:"spin 1s linear infinite", display:"inline-block" }} />
                </div>
              ) : logistics.length === 0 ? (
                <p style={{ textAlign:"center", color:"#7a9aaa", fontSize:"13px", padding:"32px 0" }}>No logistics accounts found.</p>
              ) : logistics.map((l) => (
                <div key={l._id} className="logistics-row">
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"38px", height:"38px", borderRadius:"50%", background: l.isActive ? "#ecfdf5" : "#f5f5f5", border:`1px solid ${l.isActive ? "#6ee7b7" : "#e0edf2"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Truck size={15} color={l.isActive ? "#0a7c5c" : "#aaa"} />
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:"14px", fontWeight:600, color:"#1a2e38" }}>{l.fullName}</p>
                      <p style={{ margin:0, fontSize:"12px", color:"#7a9aaa" }}>{l.email} · ID: {l.systemId}</p>
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    {/* Status badge */}
                    <span style={{ fontSize:"10px", fontWeight:700, padding:"4px 10px", borderRadius:"20px", textTransform:"uppercase", letterSpacing:"0.06em", background: l.isActive ? "#ecfdf5" : "#f5f5f5", color: l.isActive ? "#065f46" : "#999", border:`1px solid ${l.isActive ? "#6ee7b7" : "#e0edf2"}` }}>
                      {l.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleActive(l._id)}
                      disabled={actionId === l._id}
                      title={l.isActive ? "Deactivate" : "Activate"}
                      style={{ width:"34px", height:"34px", borderRadius:"50%", border:"none", background: l.isActive ? "#fff3f3" : "#ecfdf5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                    >
                      {actionId === l._id
                        ? <Loader2 size={14} color="#7a9aaa" style={{ animation:"spin 1s linear infinite" }} />
                        : <Power size={14} color={l.isActive ? "#dc2626" : "#0a7c5c"} />
                      }
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(l)}
                      title="Delete account"
                      style={{ width:"34px", height:"34px", borderRadius:"50%", border:"none", background:"#fff3f3", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── DANGER ZONE ────────────────────────────────────────────────── */}
          <Section id="danger" icon={ShieldAlert} title="Danger Zone" subtitle="Irreversible actions — proceed with caution" accent="#dc2626" activeSection={activeSection} setActiveSection={setActiveSection}>
            <div style={{ paddingTop:"20px", display:"flex", flexDirection:"column", gap:"14px" }}>
              {[
                { label:"Clear All Transaction Logs", desc:"Permanently deletes all transaction history. Cannot be undone.", btn:"Clear Logs" },
                { label:"Reset Store Settings",       desc:"Resets all store info back to defaults.",                        btn:"Reset Store" },
                { label:"Log Out All Sessions",       desc:"Forces logout from all active admin sessions.",                  btn:"Log Out All" },
              ].map(({ label, desc, btn }) => (
                <div key={btn} style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:"14px", padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px" }}>
                  <div>
                    <p style={{ margin:0, fontSize:"14px", fontWeight:700, color:"#991b1b" }}>{label}</p>
                    <p style={{ margin:0, fontSize:"12px", color:"#b91c1c", marginTop:"2px" }}>{desc}</p>
                  </div>
                  <button className="danger-btn" onClick={() => showToast(`${btn} — feature coming soon.`, "info")} style={{ background:"#dc2626", color:"#fff", border:"none", whiteSpace:"nowrap", boxShadow:"0 4px 14px rgba(220,38,38,0.25)" }}>
                    <AlertTriangle size={13} /> {btn}
                  </button>
                </div>
              ))}
            </div>
          </Section>

        </main>
      </div>

      {/* ── DELETE CONFIRM DIALOG ──────────────────────────────────────────── */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(10,30,40,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"24px", padding:"40px", width:"400px", textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,0.14)" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#fff5f5", border:"2px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h3 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"22px", color:"#0a1e28", margin:"0 0 8px" }}>Delete Account?</h3>
            <p style={{ fontSize:"13px", color:"#7a9aaa", margin:"0 0 6px", lineHeight:1.65 }}>
              You're about to permanently delete the account for
            </p>
            <p style={{ fontSize:"14px", fontWeight:700, color:"#0a1e28", margin:"0 0 24px" }}>{deleteConfirm.fullName}</p>
            <div style={{ display:"flex", gap:"12px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex:1, padding:"12px", borderRadius:"12px", border:"1px solid #e0edf2", background:"#fff", cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:"13px", fontWeight:600, color:"#7a9aaa" }}>
                Cancel
              </button>
              <button
                onClick={() => deleteLogistics(deleteConfirm._id)}
                disabled={actionId === deleteConfirm._id}
                style={{ flex:1, padding:"12px", borderRadius:"12px", border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
              >
                {actionId === deleteConfirm._id
                  ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} />
                  : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
};

export default VelouraSettings;