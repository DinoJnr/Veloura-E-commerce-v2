import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  ChevronRight,
  Ruler,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";

const VelouraProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [mainImage, setMainImage] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  if (!product) {
    return (
      <div className="bg-[#FBFBFB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-[#7A8DAE] mb-4" size={40} />
          <p className="font-serif italic text-[#1A2533]">
            Product details unavailable.
          </p>
          <button
            onClick={() => navigate("/veloura/store")}
            className="mt-4 text-[10px] uppercase tracking-widest text-[#7A8DAE] underline"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const showNotification = (msg) => {
    setNotification({ show: true, message: msg });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      showNotification("Please select an Atelier Size");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      showNotification("Please select a Hue");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("veloura_cart")) || [];

    const cartItemId = `${product._id}-${selectedSize}-${selectedColor}`;

    const existingItem = cart.find((item) => item.cartId === cartItemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        cartId: cartItemId,
        selectedSize,
        selectedColor,
        quantity: 1,
      });
    }

    localStorage.setItem("veloura_cart", JSON.stringify(cart));
    showNotification("Added to Atelier Cart");
  };

  const handleAddToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("veloura_wishlist")) || [];
    if (!wishlist.some((item) => item._id === product._id)) {
      wishlist.push(product);
      localStorage.setItem("veloura_wishlist", JSON.stringify(wishlist));
      showNotification("Saved to Wishlist");
    } else {
      showNotification("Already in Wishlist");
    }
  };

  const discountPct =
    product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  const productImages = Array.isArray(product.images)
    ? product.images
    : [product.image];

  return (
    <div className="bg-[#FBFBFB] min-h-screen relative">
      <Velouraheader />

      {notification.show && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1A2533] text-white px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500">
          <CheckCircle2 size={16} className="text-[#E0E7FF]" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
            {notification.message}
          </p>
        </div>
      )}

      <main className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#7A8DAE] mb-8">
          <span
            className="cursor-pointer"
            onClick={() => navigate("/veloura/store")}
          >
            Home
          </span>{" "}
          <ChevronRight size={10} />
          <span>{product.category}</span> <ChevronRight size={10} />
          <span className="text-[#1A2533] font-bold">
            {product.subcategory || "General"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] bg-[#E0E7FF]/20 rounded-sm overflow-hidden relative">
              <img
                src={productImages[mainImage]}
                className="w-full h-full object-cover mix-blend-multiply transition-all duration-700"
                alt={product.name}
              />
              {discountPct && (
                <div className="absolute top-6 left-6 bg-[#1A2533] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest">
                  -{discountPct}% OFF
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(idx)}
                  className={`aspect-square border rounded-sm overflow-hidden transition-all ${mainImage === idx ? "border-[#1A2533]" : "border-transparent opacity-60"}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt="thumb"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <header className="space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#7A8DAE] font-medium">
                  {product.brand || "Veloura Signature"}
                </p>
                <span className="text-[9px] px-2 py-0.5 border border-[#E0E7FF] text-[#7A8DAE] uppercase tracking-widest rounded-full">
                  {product.subcategory || product.category}
                </span>
              </div>
              <h1 className="text-4xl font-serif italic text-[#1A2533] leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 pt-2">
                <span className="text-2xl font-light text-[#1A2533]">
                  ₦{Number(product.price).toLocaleString()}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-lg text-[#BDC3C7] line-through font-light">
                      ₦{Number(product.comparePrice).toLocaleString()}
                    </span>
                    <span className="text-[#27AE60] text-xs font-bold uppercase tracking-widest italic">
                      Save {discountPct}%
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${product.stock < 5 ? "bg-orange-500 animate-pulse" : "bg-green-500"}`}
                />
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A2533]">
                  {product.stock > 0
                    ? `Only ${product.stock} units remaining in Atelier`
                    : "Out of Stock"}
                </p>
              </div>
            </header>

            <p className="text-sm text-[#5D6D7E] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A2533]">
                  Selected Hue
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name || color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === (color.name || color) ? "border-[#1A2533]" : "border-transparent"}`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/5"
                        style={{ backgroundColor: color.hex || color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A2533]">
                    Atelier Size
                  </h3>
                  <button className="text-[9px] uppercase tracking-widest text-[#7A8DAE] flex items-center gap-1 hover:text-[#1A2533]">
                    <Ruler size={12} /> View Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs tracking-widest border transition-all ${selectedSize === size ? "bg-[#1A2533] text-white border-[#1A2533]" : "border-[#E0E7FF] text-[#5D6D7E] hover:border-[#7A8DAE]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4">
              <button
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className={`w-full py-5 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-3
                ${product.stock > 0 ? "bg-[#1A2533] text-white hover:bg-[#7A8DAE]" : "bg-zinc-200 text-zinc-500 cursor-not-allowed"}`}
              >
                <ShoppingBag size={16} />{" "}
                {product.stock > 0 ? "Add to Atelier Cart" : "Out of Stock"}
              </button>
              <button
                onClick={handleAddToWishlist}
                className="w-full border border-[#E0E7FF] text-[#1A2533] py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#FBFBFB] transition-all flex items-center justify-center gap-3"
              >
                <Heart size={16} /> Save to Wishlist
              </button>
            </div>

            <div className="border-t border-[#E0E7FF] pt-8 grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#BDC3C7] mb-1">
                  Origin
                </p>
                <p className="text-xs text-[#1A2533] font-medium">
                  {product.origin || "Handmade"}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#BDC3C7] mb-1">
                  Material
                </p>
                <p className="text-xs text-[#1A2533] font-medium">
                  {product.materials?.[0] || "Premium Blend"}
                </p>
              </div>
              {product.weight && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#BDC3C7] mb-1">
                    Weight
                  </p>
                  <p className="text-xs text-[#1A2533] font-medium">
                    {product.weight}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#BDC3C7] mb-1">
                  Item ID
                </p>
                <p className="text-xs text-[#1A2533] font-medium">
                  {product.productId || "VL-CH-001"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraProductDetails;
