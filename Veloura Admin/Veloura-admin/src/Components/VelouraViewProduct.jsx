import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Edit3, Trash2, ChevronLeft, Globe, Package, 
  BarChart3, Clock, ArrowUpRight, ShieldCheck, 
  Truck, Star, Share2, Copy, Layers, Tag,
  History, Eye, ShoppingCart, TrendingUp
} from "lucide-react";

import Navbar from "./VelouraAdminNavbar";

// ─── MOCK PRODUCT DATA ───────────────────────────────────────────────────────
const PRODUCT_DETAIL = {
  id: "VLR-TUX-009",
  name: "Premium Velvet Tuxedo Blazer",
  category: "Clothing",
  subcategory: "Jackets & Blazers",
  price: 95000,
  comparePrice: 120000,
  cost: 40000,
  stock: 15,
  status: "Active",
  brand: "Veloura Signature",
  origin: "Nigeria",
  weight: "1.1kg",
  description: "Hand-crafted from premium Italian velvet with a focus on structural elegance. Features a peak lapel in high-grade silk satin, four-button surgeon cuffs, and a double-vented back for a modern silhouette.",
  tags: ["Luxe", "Evening Wear", "Traditional Fusion"],
  stats: {
    views: "1.2k",
    sales: "48",
    conversion: "3.2%",
    revenue: "₦4,560,000"
  },
  images: [
    "https://via.placeholder.com/600x800",
    "https://via.placeholder.com/150x150",
    "https://via.placeholder.com/150x150",
    "https://via.placeholder.com/150x150"
  ]
};



const StatBox = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: color + '10', color: color }}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} className="text-zinc-400" />
    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
  </div>
);



const VelouraViewProduct = () => {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="flex min-h-screen bg-[#f8f8f9]" style={{ fontFamily: "Sora, sans-serif" }}>
      <Navbar />

      <main className="flex-1 h-screen overflow-y-auto px-8 py-10">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors group">
            <div className="p-2 rounded-lg bg-white border border-zinc-200 group-hover:bg-zinc-50">
              <ChevronLeft size={16} />
            </div>
            <span className="text-sm font-bold">Back to Inventory</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:text-rose-600 transition-all shadow-sm">
              <Trash2 size={18} />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-zinc-800 transition-all">
              <Edit3 size={16} /> Edit Product
            </button>
          </div>
        </div>

        {/* Quick Analytics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Views" value={PRODUCT_DETAIL.stats.views} icon={Eye} color="#6366f1" />
          <StatBox label="Units Sold" value={PRODUCT_DETAIL.stats.sales} icon={ShoppingCart} color="#f59e0b" />
          <StatBox label="Conversion" value={PRODUCT_DETAIL.stats.conversion} icon={TrendingUp} color="#10b981" />
          <StatBox label="Gross Revenue" value={PRODUCT_DETAIL.stats.revenue} icon={BarChart3} color="#ec4899" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Visuals & Description (7 Cols) */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            
            {/* Image Gallery */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 aspect-[3/4] rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100">
                  <img src={PRODUCT_DETAIL.images[activeImage]} className="w-full h-full object-cover" alt="Product" />
                </div>
                <div className="flex md:flex-col gap-3">
                  {PRODUCT_DETAIL.images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-zinc-900' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Story */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
              <SectionHeader title="Product Details" icon={Layers} />
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">{PRODUCT_DETAIL.name}</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">SKU: {PRODUCT_DETAIL.id}</span>
                <span className="px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Verified Authentic</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {PRODUCT_DETAIL.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Business Intelligence (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            
            {/* Inventory & Pricing Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <SectionHeader title="Inventory Status" icon={Package} />
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-4xl font-bold text-zinc-900">₦{PRODUCT_DETAIL.price.toLocaleString()}</p>
                  <p className="text-sm text-zinc-400 line-through">₦{PRODUCT_DETAIL.comparePrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-500 mb-1">IN STOCK</p>
                  <p className="text-2xl font-bold text-zinc-900">{PRODUCT_DETAIL.stock} Units</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-50">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Unit Cost</p>
                  <p className="font-bold text-zinc-800">₦{PRODUCT_DETAIL.cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Margin</p>
                  <p className="font-bold text-emerald-600">58%</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <Share2 size={14} /> Share Listing
                </button>
                <button className="w-full py-3 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-zinc-200">
                  <Copy size={14} /> Copy Public Link
                </button>
              </div>
            </div>

            {/* Logistics & Attributes */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <SectionHeader title="Specifications" icon={Globe} />
              <div className="space-y-4">
                {[
                  { label: "Brand", value: PRODUCT_DETAIL.brand, icon: ShieldCheck },
                  { label: "Category", value: PRODUCT_DETAIL.subcategory, icon: Tag },
                  { label: "Origin", value: PRODUCT_DETAIL.origin, icon: Truck },
                  { label: "Weight", value: PRODUCT_DETAIL.weight, icon: Scale }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <spec.icon size={14} />
                      <span>{spec.label}</span>
                    </div>
                    <span className="font-bold text-zinc-800">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent History / Activity */}
            <div className="bg-zinc-900 p-6 rounded-3xl shadow-xl shadow-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Recent Activity" icon={History} />
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">VIEW LOGS</button>
              </div>
              <div className="space-y-4">
                {[
                  { event: "Price Updated", date: "2 hrs ago", user: "Admin" },
                  { event: "Restocked +5 units", date: "Yesterday", user: "Inventory Bot" },
                  { event: "Listing Published", date: "3 days ago", user: "System" }
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-zinc-800 pb-3 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{log.event}</p>
                      <p className="text-[10px] text-zinc-500">by {log.user}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Simple Icon fallback for weight
const Scale = ({ size }) => <BarChart3 size={size} />;

export default VelouraViewProduct;