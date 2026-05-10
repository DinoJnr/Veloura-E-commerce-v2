import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search, Filter, Plus, Edit2, Trash2, 
  Package, AlertTriangle, CheckCircle2, 
  Eye, Download, ArrowUpRight, ArrowDownRight, X, 
  Info, DollarSign, Warehouse, Tag, Globe, Scale, Layers
} from "lucide-react";

import Navbar from "./VelouraAdminNavbar";



const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold text-zinc-900 mt-1">{value}</h3>
    </div>
  </motion.div>
);

const Badge = ({ status }) => {
  const isStock = typeof status === 'number';
  if (isStock) {
    if (status === 0) return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-600 border-rose-100">Out of Stock</span>;
    if (status < 5) return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-600 border-amber-100">Low Stock ({status})</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">{status} In Stock</span>;
  }
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    draft: "bg-zinc-50 text-zinc-500 border-zinc-200",
    archived: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusStyles[status.toLowerCase()] || statusStyles.draft}`}>
      {status}
    </span>
  );
};

const DetailRow = ({ label, value, isStatus = false }) => (
  <div className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-0">
    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{label}</span>
    {isStatus ? <Badge status={value} /> : <span className="text-sm font-semibold text-zinc-800">{value || "—"}</span>}
  </div>
);



const VelouraAllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewProduct, setViewProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5200/upload/getproducts");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const activeListings = products.filter(p => p.status?.toLowerCase() === 'active').length;
  const lowStockCount = products.filter(p => p.stock < 5).length;

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        await axios.delete(`http://localhost:5200/upload/deleteproduct/${id}`);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

const handleEdit = (product) => {
  // Use the mongo _id for the URL, and pass the object in state
  navigate(`/admin/editproduct/${product._id}`, { state: { product } });
};

  return (
    <div className="flex min-h-screen bg-[#f8f8f9]" style={{ fontFamily: "Sora, sans-serif" }}>
      <Navbar />
      
      <main className="flex-1 h-screen overflow-y-auto px-8 py-10 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Inventory</h1>
              <p className="text-zinc-500 text-sm mt-1">Manage {totalProducts} items in your catalog.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
                <Download size={14} /> Export
              </button>
              <button 
                onClick={() => navigate("/admin/addproduct")}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Total Products" value={totalProducts} change="Live" trend="up" icon={Package} />
            <StatCard title="Active Listings" value={activeListings} change="Public" trend="up" icon={CheckCircle2} />
            <StatCard title="Stock Alerts" value={lowStockCount} change="Attention" trend={lowStockCount > 0 ? "down" : "up"} icon={AlertTriangle} />
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search name, category, or SKU..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 text-center text-zinc-400 animate-pulse font-bold">Loading Inventory...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Product</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Category</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Price</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Stock</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    <AnimatePresence mode='popLayout'>
                      {filteredProducts.map((product) => (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={product._id} className="group hover:bg-zinc-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg bg-zinc-100 object-cover border border-zinc-100" />
                              <div>
                                <p className="text-sm font-bold text-zinc-800">{product.name}</p>
                                <p className="text-[10px] font-mono text-zinc-400 uppercase">{product.productId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-zinc-600 font-medium">{product.category}</td>
                          <td className="p-4 text-sm font-bold text-zinc-900">₦{product.price?.toLocaleString()}</td>
                          <td className="p-4"><Badge status={product.stock} /></td>
                          <td className="p-4"><Badge status={product.status || "Active"} /></td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setViewProduct(product)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all"><Eye size={16} /></button>
                              <button onClick={() => handleEdit(product)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(product._id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── FULL MODEL DETAIL PANEL ────────────────────────────────────────── */}
      <AnimatePresence>
        {viewProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewProduct(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[100] flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <Package size={18} className="text-zinc-400" /> {viewProduct.name}
                  </h2>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{viewProduct.productId}</p>
                </div>
                <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                
                {/* Image Gallery */}
                <div className="space-y-4">
                   <div className="aspect-[4/3] rounded-3xl bg-zinc-100 overflow-hidden border border-zinc-100">
                      <img src={viewProduct.images?.[0]} className="w-full h-full object-cover" alt="" />
                   </div>
                   {viewProduct.images?.length > 1 && (
                     <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                       {viewProduct.images.map((img, i) => (
                         <img key={i} src={img} className="w-20 h-20 rounded-xl object-cover border border-zinc-200 flex-shrink-0" alt="" />
                       ))}
                     </div>
                   )}
                </div>

                {/* Financials & Inventory */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-900 text-white shadow-xl shadow-zinc-200">
                    <p className="text-[10px] font-bold opacity-60 uppercase mb-1 flex items-center gap-1.5"><DollarSign size={12}/> Current Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">₦{viewProduct.price?.toLocaleString()}</span>
                      {viewProduct.comparePrice > viewProduct.price && (
                        <span className="text-xs line-through opacity-50">₦{viewProduct.comparePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1 flex items-center gap-1.5"><Warehouse size={12}/> Stock Level</p>
                    <p className="text-xl font-bold text-zinc-900">{viewProduct.stock} <span className="text-xs text-zinc-500 font-medium">units</span></p>
                  </div>
                </div>

                {/* Main Details Section */}
                <section>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Product Identity</p>
                  <div className="bg-zinc-50/50 rounded-2xl p-2 border border-zinc-100">
                    <DetailRow label="Brand" value={viewProduct.brand} />
                    <DetailRow label="Category" value={viewProduct.category} />
                    <DetailRow label="Sub-Category" value={viewProduct.subcategory} />
                    <DetailRow label="Target Gender" value={viewProduct.gender} />
                    <DetailRow label="Status" value={viewProduct.status} isStatus />
                  </div>
                </section>

                {/* Logistics & Physical */}
                <section>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Logistics & Physical</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500"><Globe size={14}/></div>
                      <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Origin</p>
                        <p className="text-xs font-bold text-zinc-800">{viewProduct.origin || "Not Set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500"><Scale size={14}/></div>
                      <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Weight</p>
                        <p className="text-xs font-bold text-zinc-800">{viewProduct.weight ? `${viewProduct.weight}kg` : "Not Set"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Arrays (Sizes, Colors, Materials, Tags) */}
                <section className="space-y-6">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Variants & Attributes</p>
                  
                  <div className="space-y-4">
                    {/* Sizes */}
                    {viewProduct.sizes?.length > 0 && (
                      <div className="flex items-start gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 w-20 pt-1">SIZES</span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewProduct.sizes.map(s => <span key={s} className="px-2.5 py-1 bg-zinc-900 text-white rounded-md text-[10px] font-bold">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Colors */}
                    {viewProduct.colors?.length > 0 && (
                      <div className="flex items-start gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 w-20 pt-1">COLORS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewProduct.colors.map(c => <span key={c} className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold shadow-sm">{c}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Materials */}
                    {viewProduct.materials?.length > 0 && (
                      <div className="flex items-start gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 w-20 pt-1">MATERIALS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewProduct.materials.map(m => <span key={m} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-medium border border-emerald-100">{m}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Tags */}
                    {viewProduct.tags?.length > 0 && (
                      <div className="flex items-start gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 w-20 pt-1">TAGS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewProduct.tags.map(t => <span key={t} className="text-zinc-400 text-[11px] font-medium">#{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Extra Dynamic Fields */}
                {viewProduct.extraFields && Object.keys(viewProduct.extraFields).length > 0 && (
                  <section>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Specifications</p>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(viewProduct.extraFields).map(([key, val]) => (
                        <div key={key} className="flex justify-between p-3 rounded-xl bg-zinc-50/50 border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-xs font-bold text-zinc-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                <div className="text-center pt-6 opacity-30">
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Veloura Catalog System v2.0</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-100 bg-white">
                <button onClick={() => handleEdit(viewProduct)} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                  <Edit2 size={14} /> Modify Product Entry
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VelouraAllProducts;