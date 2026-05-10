import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Heart, Bell, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from './VelourabuttonNavbar';

const VelouraWishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "" });

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('veloura_wishlist')) || [];
    setWishlistItems(savedWishlist);
  }, []);

  const removeItem = (id) => {
    const updatedWishlist = wishlistItems.filter(item => (item._id || item.id) !== id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('veloura_wishlist', JSON.stringify(updatedWishlist));
    // ✅ Notify navbar
    window.dispatchEvent(new Event("veloura_wishlist_updated"));
    showNotification("Removed from Inspirations");
  };

  const moveToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('veloura_cart')) || [];

    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('veloura_cart', JSON.stringify(cart));
    // ✅ Notify navbar of cart update
    window.dispatchEvent(new Event("veloura_cart_updated"));

    removeItem(product._id || product.id);
    showNotification("Moved to Atelier Bag");
  };

  const showNotification = (msg) => {
    setNotification({ show: true, message: msg });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  return (
    <div className="bg-[#FBFBFB] min-h-screen font-sans relative">
      <Velouraheader />

      {/* Luxury Notification Pop-up */}
      {notification.show && (
        <div className="fixed top-24 right-6 z-[100] bg-[#1A2533] text-white px-6 py-4 rounded-sm shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500">
          <CheckCircle2 size={16} className="text-[#E0E7FF]" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold">{notification.message}</p>
        </div>
      )}

      <main className="pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <button
            onClick={() => navigate('/veloura/store')}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#7A8DAE] hover:text-[#1A2533] transition-colors"
          >
            <ChevronLeft size={14} /> Back to Boutique
          </button>
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-[#1A2533] fill-[#1A2533]" />
            <h1 className="text-5xl font-serif italic text-[#1A2533]">Saved Inspirations</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#7A8DAE]">
            {wishlistItems.length} Curated Masterpieces
          </p>
        </div>

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {wishlistItems.map((item) => {
              const itemPrice = Number(item.price) || 0;
              const isOutOfStock = !item.stock || parseInt(item.stock) === 0;
              const itemId = item._id || item.id;

              return (
                <div key={itemId} className="group">
                  {/* Image Container */}
                  <div
                    className="aspect-[3/4] bg-[#F0F4F8] rounded-sm overflow-hidden relative mb-6 cursor-pointer"
                    onClick={() => navigate('/veloura/productdetails', { state: { product: item } })}
                  >
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-1000 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : 'opacity-90'}`}
                    />

                    {/* Remove Icon Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(itemId);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-[#1A2533] transition-all z-10"
                    >
                      <Trash2 size={16} />
                    </button>

                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-[#1A2533] text-white px-6 py-2 text-[9px] font-bold uppercase tracking-[0.3em]">Currently Unavailable</span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#7A8DAE] mb-1">
                          {item.gender} • {item.subcategory || item.category}
                        </p>
                        <h3 className="text-lg font-serif italic text-[#1A2533]">{item.name}</h3>
                      </div>
                      <p className="text-sm font-light text-[#1A2533]">₦{itemPrice.toLocaleString()}</p>
                    </div>

                    {!isOutOfStock ? (
                      <button
                        onClick={() => moveToCart(item)}
                        className="w-full border border-[#1A2533] text-[#1A2533] py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#1A2533] hover:text-white transition-all duration-500"
                      >
                        <ShoppingBag size={14} /> Move to Atelier Cart
                      </button>
                    ) : (
                      <button className="w-full bg-white border border-[#E0E7FF] text-[#7A8DAE] py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:border-[#7A8DAE] transition-all">
                        <Bell size={14} /> Notify When Restocked
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-[#F0F4F8] rounded-full flex items-center justify-center text-[#E0E7FF]">
                <Heart size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-serif italic text-[#1A2533] mb-2">Your wishlist is a blank canvas.</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#7A8DAE] mb-8">Save items you love to find them later.</p>
            <button
              onClick={() => navigate('/veloura/store')}
              className="bg-[#1A2533] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl shadow-[#1A2533]/20"
            >
              Discover Collections
            </button>
          </div>
        )}
      </main>

      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraWishlist;