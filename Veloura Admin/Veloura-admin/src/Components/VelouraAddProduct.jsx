import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Added for backend communication
import {
  Upload, X, Plus, Tag, Package, DollarSign, Layers,
  ChevronDown, Check, Sparkles, ArrowRight, Star, Eye, 
  ShoppingBag, Watch, Gem, Shirt, Glasses, Dumbbell, 
  Droplets, Scissors, Heart, CloudRain, Info, Camera, 
  Globe, Weight, Hash, FileText, Palette, ChevronRight,
  AlertCircle, CheckCircle2, Image as ImageIcon
} from "lucide-react";

// Importing your custom Navbar
import Navbar from "./VelouraAdminNavbar";

// ─── CATEGORY DEFINITIONS ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "clothing",
    label: "Clothing",
    emoji: "👕",
    icon: Shirt,
    accent: "#6366f1",
    subcategories: ["T-Shirts & Polos", "Shirts & Blouses", "Jeans & Trousers", "Shorts", "Dresses", "Skirts", "Jackets & Blazers", "Hoodies & Sweatshirts", "Coats & Overcoats", "Suits & Blazer Sets", "Agbada & Native Wear", "Kaftans & Dashikis", "Jumpsuits & Playsuits", "Cardigans"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "One Size"],
    sizeLabel: "Clothing Sizes",
    materials: ["Cotton", "Polyester", "Linen", "Silk", "Wool", "Denim", "Chiffon", "Velvet", "Satin", "Cashmere", "Ankara", "Lace", "Kente", "Aso-oke"],
    colors: true,
    gender: true,
    extraFields: [
      { key: "fit", label: "Fit Style", placeholder: "e.g. Slim Fit, Regular, Oversized" },
      { key: "care", label: "Care Instructions", placeholder: "e.g. Machine wash cold, Do not bleach" },
      { key: "season", label: "Season", placeholder: "e.g. All Season, Summer, Winter" },
      { key: "style", label: "Style", placeholder: "e.g. Casual, Formal, Streetwear" },
    ],
  },
  {
    id: "footwear",
    label: "Footwear",
    emoji: "👟",
    icon: ShoppingBag,
    accent: "#f97316",
    subcategories: ["Sneakers", "Sandals", "Slippers & Slides", "Heels & Pumps", "Boots & Ankle Boots", "Loafers", "Formal Shoes", "Wedges", "Platforms", "Mules", "Ballet Flats", "Sports Shoes"],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"],
    sizeLabel: "Shoe Sizes (EU)",
    materials: ["Leather", "Suede", "Canvas", "Patent Leather", "Mesh", "Rubber", "Satin", "Velvet", "Synthetic"],
    colors: true,
    gender: true,
    extraFields: [
      { key: "heelHeight", label: "Heel Height (cm)", placeholder: "e.g. 0 (flat), 5, 10" },
      { key: "closure", label: "Closure Type", placeholder: "e.g. Lace-up, Slip-on, Buckle, Zip" },
      { key: "sole", label: "Sole Material", placeholder: "e.g. Rubber, EVA, Leather" },
      { key: "toe", label: "Toe Shape", placeholder: "e.g. Round, Pointed, Square, Open" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    emoji: "👜",
    icon: Gem,
    accent: "#f59e0b",
    subcategories: ["Handbags & Purses", "Backpacks", "Clutches", "Tote Bags", "Belts", "Hats & Caps", "Scarves & Wraps", "Sunglasses", "Watches", "Necklaces", "Rings", "Bracelets", "Earrings", "Wallets", "Keychains", "Hair Accessories"],
    sizes: ["XS", "S", "M", "L", "XL", "One Size"],
    sizeLabel: "Size",
    materials: ["Leather", "Gold", "Silver", "Rose Gold", "Platinum", "Brass", "Sterling Silver", "Canvas", "Straw", "Velvet", "Acrylic", "Titanium"],
    colors: true,
    gender: true,
    extraFields: [
      { key: "dimensions", label: "Dimensions (cm)", placeholder: "e.g. 30 × 20 × 10 cm" },
      { key: "closure", label: "Closure / Clasp Type", placeholder: "e.g. Zip, Magnetic, Toggle" },
      { key: "hardware", label: "Hardware Finish", placeholder: "e.g. Gold-tone, Silver-tone, Gunmetal" },
      { key: "lining", label: "Lining / Interior", placeholder: "e.g. Suede-lined, 2 pockets, Zip pocket" },
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    emoji: "💄",
    icon: Sparkles,
    accent: "#ec4899",
    subcategories: ["Lipstick & Lip Gloss", "Foundation & Concealer", "Eyeshadow & Liner", "Blush & Bronzer", "Setting Powder & Spray", "Mascara", "Perfumes & Fragrances", "Body Mists", "Hair Care", "Wigs & Weaves", "Skincare", "Nail Care"],
    sizes: ["5ml", "10ml", "15ml", "30ml", "50ml", "75ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"],
    sizeLabel: "Volume / Size",
    materials: [],
    colors: false,
    gender: false,
    extraFields: [
      { key: "shade", label: "Shade / Tone", placeholder: "e.g. Nude 04, Deep Brown, Clear" },
      { key: "skinType", label: "Skin Type", placeholder: "e.g. All Skin Types, Oily, Dry, Sensitive" },
      { key: "ingredients", label: "Key Ingredients", placeholder: "e.g. Hyaluronic Acid, SPF 30, Vitamin C" },
      { key: "scent", label: "Scent / Fragrance Notes", placeholder: "e.g. Floral, Woody, Citrus, Musk" },
      { key: "expiry", label: "Shelf Life / Expiry", placeholder: "e.g. 24 months, Use within 12M of opening" },
    ],
  },
  {
    id: "fabrics",
    label: "Fabrics",
    emoji: "🧵",
    icon: Scissors,
    accent: "#14b8a6",
    subcategories: ["Ankara & African Prints", "Lace Fabrics", "Denim", "Silk & Satin", "Linen", "Wool & Tweed", "Cotton Fabric", "Velvet", "Chiffon & Georgette", "Kente Cloth", "Aso-oke", "Net & Sequined"],
    sizes: ["Per Yard", "Per Meter", "2 Yards", "3 Yards", "4 Yards", "5 Yards", "6 Yards", "Full Roll"],
    sizeLabel: "Sold By",
    materials: ["100% Cotton", "100% Polyester", "Cotton Blend", "Silk", "Linen", "Wool", "Synthetic"],
    colors: true,
    gender: false,
    extraFields: [
      { key: "width", label: "Fabric Width (cm)", placeholder: "e.g. 110cm, 150cm" },
      { key: "gsm", label: "Weight (GSM)", placeholder: "e.g. 120 GSM (light), 300 GSM (heavy)" },
      { key: "pattern", label: "Pattern / Print", placeholder: "e.g. Floral, Geometric, Solid, Abstract" },
      { key: "care", label: "Washing Instructions", placeholder: "e.g. Hand wash only, Dry clean" },
    ],
  },
];

const BRAND_COLORS = [
  { name: "Black", hex: "#0a0a0a" }, { name: "White", hex: "#f8f8f8" },
  { name: "Ivory", hex: "#f5f0e8" }, { name: "Beige", hex: "#d4b896" },
  { name: "Red", hex: "#dc2626" }, { name: "Navy", hex: "#1e3a5f" },
  { name: "Gold", hex: "#d4af37" }, { name: "Forest", hex: "#1a4731" },
];

const GENDERS = ["Women", "Men", "Unisex", "Girls (Kids)", "Boys (Kids)"];

// ─── REUSABLE HELPERS ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div {...fadeUp(delay)} className={`bg-white rounded-2xl border border-zinc-100 shadow-sm ${className}`}>
    {children}
  </motion.div>
);

const CardHeader = ({ icon: Icon, title, subtitle, accent }) => (
  <div className="flex items-start gap-3 p-6 pb-0">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "20" }}>
      <Icon size={16} style={{ color: accent }} />
    </div>
    <div>
      <h3 className="font-semibold text-zinc-800 text-sm tracking-wide">{title}</h3>
      {subtitle && <p className="text-zinc-400 text-xs mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Field = ({ label, hint, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10px] text-zinc-400 italic">{hint}</span>}
    </div>
    {children}
  </div>
);

const inputCls = "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all";

const TextInput = ({ label, hint, required, accent, ...props }) => (
  <Field label={label} hint={hint} required={required}>
    <input {...props} className={inputCls} style={{ "--tw-ring-color": accent }} />
  </Field>
);

const Dropdown = ({ label, required, options, value, onChange, placeholder, accent }) => {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} required={required}>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className={`${inputCls} flex items-center justify-between`}>
          <span className={value ? "text-zinc-800" : "text-zinc-300"}>{value || placeholder}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full mt-1.5 w-full bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden overflow-y-auto max-h-60">
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-zinc-50 flex justify-between">
                {opt} {value === opt && <Check size={13} style={{ color: accent }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
};

const ChipSelector = ({ label, hint, items, selected, onToggle, accent, single }) => (
  <Field label={label} hint={hint}>
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => {
        const active = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => single ? onToggle(active ? "" : item) : onToggle(item)} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all" style={active ? { backgroundColor: accent, borderColor: accent, color: "#fff" } : { backgroundColor: "#fafafa", borderColor: "#e4e4e7", color: "#52525b" }}>
            {item}
          </button>
        );
      })}
    </div>
  </Field>
);

const ColorPicker = ({ selected, onToggle, accent }) => (
  <Field label="Colours">
    <div className="flex flex-wrap gap-2">
      {BRAND_COLORS.map(c => {
        const active = selected.includes(c.name);
        return (
          <button key={c.name} type="button" onClick={() => onToggle(c.name)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs" style={active ? { borderColor: accent, backgroundColor: accent + "15" } : { borderColor: "#e4e4e7" }}>
            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex }} />
            {c.name}
          </button>
        );
      })}
    </div>
  </Field>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const VelouraAddProduct = () => {
  const [activeCat, setActiveCat] = useState(null);
  const [subcategory, setSubcategory] = useState("");
  const [gender, setGender] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // Store actual files for backend
  const [status, setStatus] = useState("active");
  const [extraFields, setExtraFields] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "", brand: "", sku: "", price: "",
    comparePrice: "", cost: "", stock: "", weight: "",
    origin: "", description: ""
  });

  const cfg = CATEGORIES.find(c => c.id === activeCat);
  const accent = cfg?.accent || "#18181b";

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggle = (list, setList) => item => setList(p => p.includes(item) ? p.filter(i => i !== item) : [...p, item]);

  const addTag = e => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags(p => [...new Set([...p, tagInput.trim()])]);
      setTagInput("");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]); 
    setImages(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  
  const handleSubmit = async () => {
    if(!form.name || !form.price || !activeCat) {
      alert("Missing required fields");
      return;
    }

    setSubmitted(true);

  
    const randomID = `PD-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = new FormData();
    payload.append("productId", randomID);
    payload.append("name", form.name);
    payload.append("price", form.price);
    payload.append("comparePrice", form.comparePrice);
    payload.append("stock", form.stock);
    payload.append("category", activeCat);
    payload.append("subcategory", subcategory);
    payload.append("brand", form.brand);
    payload.append("gender", gender);
    payload.append("sizes", JSON.stringify(sizes));
    payload.append("colors", JSON.stringify(colors));
    payload.append("materials", JSON.stringify(materials));
    payload.append("tags", JSON.stringify(tags));
    payload.append("extraFields", JSON.stringify(extraFields));
    payload.append("status", status);
    payload.append("origin", form.origin);
    payload.append("weight", form.weight);

    imageFiles.forEach((file) => {
      payload.append("images", file);
    });

    try {
      const response = await axios.post("http://localhost:5200/upload/addproduct", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if(response.data.success) {
        console.log("Product Published as:", randomID);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setSubmitted(false);
    }

    setTimeout(() => setSubmitted(false), 3000);
  };

  const discountPct = form.price && form.comparePrice && parseFloat(form.comparePrice) > parseFloat(form.price)
    ? Math.round((1 - parseFloat(form.price) / parseFloat(form.comparePrice)) * 100)
    : null;

  return (
    <div className="flex min-h-screen bg-[#f4f4f5]" style={{ fontFamily: "Sora, sans-serif" }}>
      <Navbar />
      
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <motion.div {...fadeUp(0)} className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Add New Product</h1>
            <p className="text-zinc-500 text-sm mt-1">Select a category to begin building your listing.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCat(cat.id); setSubcategory(""); }} className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all bg-white" style={activeCat === cat.id ? { borderColor: cat.accent, backgroundColor: cat.accent + "0d" } : { borderColor: "#fff" }}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500" style={activeCat === cat.id ? { color: cat.accent } : {}}>{cat.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {activeCat && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                <div className="xl:col-span-2 flex flex-col gap-6">
                  
                  {/* Image Upload Card */}
                  <Card delay={0.02}>
                    <CardHeader icon={Camera} title="Product Gallery" subtitle="Upload high-quality product photos" accent={accent} />
                    <div className="p-6">
                      <div className="grid grid-cols-4 gap-4">
                        {images.map((src, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border bg-zinc-50 group">
                            <img src={src} className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-zinc-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {images.length < 4 && (
                          <button 
                            onClick={() => fileRef.current.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
                          >
                            <Upload size={20} className="text-zinc-300" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Add Photo</span>
                          </button>
                        )}
                        <input type="file" ref={fileRef} hidden multiple accept="image/*" onChange={handleImageUpload} />
                      </div>
                    </div>
                  </Card>

                  <Card delay={0.05}>
                    <CardHeader icon={FileText} title="Basic Information" accent={accent} />
                    <div className="p-6 grid gap-5">
                      <TextInput label="Product Name" required accent={accent} value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Premium Silk Scarf" />
                      <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Brand" accent={accent} value={form.brand} onChange={e => setField("brand", e.target.value)} />
                        <TextInput label="Stock" type="number" accent={accent} value={form.stock} onChange={e => setField("stock", e.target.value)} />
                      </div>
                    </div>
                  </Card>

                  <Card delay={0.11}>
                    <CardHeader icon={Layers} title="Variants & Attributes" subtitle={`Specific options for ${cfg.label}`} accent={accent} />
                    <div className="p-6 flex flex-col gap-5">
                      <Dropdown label="Subcategory" required accent={accent} options={cfg.subcategories} value={subcategory} onChange={setSubcategory} placeholder={`Choose ${cfg.label} type...`} />
                      {cfg.gender && <ChipSelector label="Target Gender" items={GENDERS} selected={gender ? [gender] : []} onToggle={v => setGender(v)} accent={accent} single />}
                      <ChipSelector label={cfg.sizeLabel} hint={cfg.id === "footwear" ? "EU sizing" : cfg.id === "fabrics" ? "Sold per unit" : ""} items={cfg.sizes} selected={sizes} onToggle={toggle(sizes, setSizes)} accent={accent} />
                      {cfg.colors && <ColorPicker selected={colors} onToggle={toggle(colors, setColors)} accent={accent} />}
                      {cfg.materials.length > 0 && <ChipSelector label="Material / Fabric" items={cfg.materials} selected={materials} onToggle={toggle(materials, setMaterials)} accent={accent} />}
                      
                      {cfg.extraFields.length > 0 && (
                        <div className="border-t border-zinc-100 pt-5">
                          <p className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase mb-4">{cfg.label} Specifications</p>
                          <div className="grid grid-cols-2 gap-4">
                            {cfg.extraFields.map(field => (
                              <TextInput key={field.key} label={field.label} accent={accent} placeholder={field.placeholder} value={extraFields[field.key] || ""} onChange={e => setExtraFields(p => ({ ...p, [field.key]: e.target.value }))} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card delay={0.14}>
                    <CardHeader icon={Globe} title="Shipping & Origin" accent={accent} />
                    <div className="p-6 grid grid-cols-2 gap-4">
                      <TextInput label="Country of Origin" accent={accent} placeholder="e.g. Nigeria" value={form.origin} onChange={e => setField("origin", e.target.value)} />
                      <TextInput label="Weight (kg)" type="number" accent={accent} value={form.weight} onChange={e => setField("weight", e.target.value)} />
                    </div>
                  </Card>

                  <Card delay={0.16}>
                    <CardHeader icon={Hash} title="Tags & SEO" subtitle="Help customers discover this product" accent={accent} />
                    <div className="p-6">
                      <TextInput label="Add Tags" hint="Press Enter to add" accent={accent} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map(tag => (
                          <motion.span key={tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium" style={{ backgroundColor: accent + "12", borderColor: accent + "30", color: accent }}>
                            #{tag}
                            <button onClick={() => setTags(p => p.filter(t => t !== tag))}><X size={9} /></button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex flex-col gap-5">
                  <Card delay={0.06}>
                    <CardHeader icon={DollarSign} title="Pricing" accent={accent} />
                    <div className="p-6 flex flex-col gap-4">
                      <TextInput label="Selling Price" required type="number" hint="NGN" accent={accent} value={form.price} onChange={e => setField("price", e.target.value)} />
                      <TextInput label="Compare-at Price" type="number" accent={accent} value={form.comparePrice} onChange={e => setField("comparePrice", e.target.value)} />
                      <TextInput label="Cost per Item" type="number" accent={accent} value={form.cost} onChange={e => setField("cost", e.target.value)} />
                      
                      {discountPct && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl px-4 py-3 text-xs border" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}>
                          <span className="font-bold">{discountPct}% off</span> — sale badge active
                        </motion.div>
                      )}

                      {form.price && form.cost && parseFloat(form.cost) > 0 && (
                        <motion.div className="rounded-xl px-4 py-3 text-xs border bg-zinc-50 border-zinc-200 text-zinc-600">
                          Margin: <span className="font-bold text-zinc-800">{Math.round(((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price)) * 100)}%</span> · Profit: <span className="font-bold text-zinc-800">₦{(parseFloat(form.price) - parseFloat(form.cost)).toLocaleString()}</span>
                        </motion.div>
                      )}
                    </div>
                  </Card>

                  <Card delay={0.09}>
                    <CardHeader icon={Eye} title="Visibility & Status" accent={accent} />
                    <div className="p-6 flex flex-col gap-2.5">
                      {[{ val: "active", label: "Active", sub: "Live & visible" }, { val: "draft", label: "Draft", sub: "Saved but hidden" }].map(({ val, label, sub }) => (
                        <button key={val} type="button" onClick={() => setStatus(val)} className="flex items-center justify-between px-3.5 py-3 rounded-xl border text-left" style={status === val ? { borderColor: accent, backgroundColor: accent + "0d" } : { borderColor: "#e4e4e7" }}>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-zinc-400">{sub}</p>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={status === val ? { borderColor: accent, backgroundColor: accent } : { borderColor: "#d4d4d8" }}>
                            {status === val && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <motion.div {...fadeUp(0.15)} className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, #18181b, #27272a)` }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{cfg.emoji}</span>
                      <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Live Summary</p>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { k: "Name", v: form.name || "—" },
                        { k: "Price", v: form.price ? `₦${parseFloat(form.price).toLocaleString()}` : "—", a: true },
                        { k: "Stock", v: form.stock ? `${form.stock} units` : "—" },
                        { k: "Category", v: subcategory || cfg.label },
                      ].map(({ k, v, a }) => (
                        <div key={k} className="flex justify-between border-b border-zinc-700 pb-2 last:border-0">
                          <span className="text-zinc-500">{k}</span>
                          <span className="font-semibold" style={a ? { color: cfg.accent } : {}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <motion.button onClick={handleSubmit} whileTap={{ scale: 0.97 }} className="mt-5 w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2" style={{ backgroundColor: accent, color: "#fff" }}>
                      {submitted ? <CheckCircle2 size={13} /> : "Publish Product"}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VelouraAddProduct;