import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";

const VelouraFullCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedCart = JSON.parse(localStorage.getItem("veloura_cart")) || [];
    setCartItems(savedCart);
  }, []);


  const syncCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("veloura_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("veloura_cart_updated"));
  };

  const updateQuantity = (cartId, delta) => {
    const newCart = cartItems.map((item) => {
      const uniqueId = item.cartId || item._id;
      if (uniqueId === cartId) {
        const availableStock = parseInt(item.stock || item.maxStock || 0);
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= availableStock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    });
    syncCart(newCart);
  };

  const removeItem = (cartId) => {
    const newCart = cartItems.filter(
      (item) => (item.cartId || item._id) !== cartId,
    );
    syncCart(newCart);
  };

  const subtotal = useMemo(() => {
    return cartItems
      .filter((item) => parseInt(item.stock || item.maxStock || 0) > 0)
      .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="bg-[#FBFBFB] min-h-screen">
      <Velouraheader />

      <main className="pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12 border-b border-[#E0E7FF] pb-8">
          <div>
            <button
              onClick={() => navigate("/veloura/store")}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#7A8DAE] mb-4 hover:text-[#1A2533] transition-colors"
            >
              <ChevronLeft size={14} /> Continue Shopping
            </button>
            <h1 className="text-5xl font-serif italic text-[#1A2533]">
              Your Atelier Bag
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#7A8DAE]">
            {
              cartItems.filter((i) => parseInt(i.stock || i.maxStock || 0) > 0)
                .length
            }{" "}
            Pieces Selected
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: Items List */}
          <div className="lg:col-span-8 space-y-10">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const availableStock = parseInt(
                  item.stock || item.maxStock || 0,
                );
                const uniqueId = item.cartId || item._id;

                return (
                  <div
                    key={uniqueId}
                    className="flex flex-col sm:flex-row gap-8 pb-10 border-b border-[#E0E7FF] last:border-0 relative"
                  >
                    {/* Image */}
                    <div
                      className={`w-full sm:w-48 aspect-[3/4] rounded-sm overflow-hidden flex-shrink-0 relative cursor-pointer
                      ${availableStock === 0 ? "bg-zinc-100 grayscale" : "bg-[#F0F4F8]"}`}
                      onClick={() =>
                        navigate("/veloura/productdetails", {
                          state: { product: item },
                        })
                      }
                    >
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover mix-blend-multiply ${availableStock === 0 ? "opacity-40" : "opacity-90"}`}
                      />
                      {availableStock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between flex-1">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-[#7A8DAE] mb-2">
                              {item.subcategory || item.category}
                            </p>
                            <h3 className="text-xl font-serif italic text-[#1A2533]">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-[#7A8DAE] mt-2 uppercase tracking-widest">
                              {item.selectedColor || item.color}{" "}
                              <span className="mx-2">|</span>{" "}
                              {item.selectedSize || item.size}
                            </p>
                          </div>
                          <p
                            className={`text-lg font-light ${availableStock === 0 ? "text-[#BDC3C7] line-through" : "text-[#1A2533]"}`}
                          >
                            ₦{Number(item.price).toLocaleString()}
                          </p>
                        </div>

                        {availableStock === 0 && (
                          <div className="flex items-center gap-2 text-red-500/80">
                            <AlertCircle size={14} />
                            <p className="text-[10px] uppercase tracking-widest font-bold">
                              This piece is currently unavailable.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-8">
                        <div className="flex items-center gap-6">
                          {availableStock > 0 && (
                            <div className="flex items-center border border-[#E0E7FF] bg-white rounded-sm">
                              <button
                                onClick={() => updateQuantity(uniqueId, -1)}
                                className="p-2 px-4 hover:bg-[#F0F4F8] transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-4 text-xs font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(uniqueId, 1)}
                                disabled={item.quantity >= availableStock}
                                className={`p-2 px-4 hover:bg-[#F0F4F8] ${item.quantity >= availableStock ? "opacity-20 cursor-not-allowed" : ""}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => removeItem(uniqueId)}
                            className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#BDC3C7] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>

                        {availableStock > 0 && (
                          <p className="text-sm font-bold text-[#1A2533] uppercase tracking-widest">
                            ₦
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-[#E0E7FF] rounded-sm bg-white">
                <p className="font-serif italic text-[#7A8DAE] text-xl">
                  Your bag is currently empty.
                </p>
                <button
                  onClick={() => navigate("/veloura/store")}
                  className="mt-6 bg-[#1A2533] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  Explore Atelier
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#E0E7FF] p-10 sticky top-40 rounded-sm">
              <h2 className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#1A2533] mb-8 border-b border-[#F0F4F8] pb-4">
                Order Summary
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#7A8DAE]">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#7A8DAE]">
                  <span>Logistics</span>
                  <span className="italic">Calculated next</span>
                </div>

                {cartItems.some(
                  (i) => parseInt(i.stock || i.maxStock || 0) === 0,
                ) && (
                  <p className="text-[9px] text-orange-400 italic bg-orange-50 p-2">
                    * Out-of-stock items excluded from total.
                  </p>
                )}

                <div className="pt-6 border-t border-[#E0E7FF] flex justify-between items-end">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#1A2533]">
                    Total
                  </span>
                  <span className="text-2xl font-serif italic text-[#1A2533]">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="pt-8 space-y-4">
                  <button
                    onClick={() => navigate("/veloura/checkout")}
                    disabled={subtotal === 0}
                    className={`w-full py-6 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 group transition-all duration-500 shadow-xl
                      ${subtotal > 0 ? "bg-[#1A2533] text-white hover:bg-[#7A8DAE] shadow-[#1A2533]/10" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}
                  >
                    Secure Checkout
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                  <p className="text-[8px] text-center uppercase tracking-widest text-[#BDC3C7]">
                    Complimentary delivery for all atelier orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraFullCart;