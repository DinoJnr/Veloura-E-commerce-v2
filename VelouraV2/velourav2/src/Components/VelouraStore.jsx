import React, { useState, useEffect } from "react";
import { ShoppingBag, Heart, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";

const VelouraStore = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGender, setActiveGender] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  const categories = [
    "All",
    "clothing",
    "footwears",
    "accesserioes",
    "beauty",
    "fabrics",
  ];
  const genders = [
    "all",
    "men",
    "women",
    "unisex",
    "Girls(kids)",
    "Boys(kids)",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5200/upload/getallproducts",
        );
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (e, product) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("veloura_cart")) || [];

  
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("veloura_cart", JSON.stringify(cart));
    showNotification("Added to Atelier Bag");
  };

  const addToWishlist = (e, product) => {
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem("veloura_wishlist")) || [];

    if (!wishlist.some((item) => item._id === product._id)) {
      wishlist.push(product);
      localStorage.setItem("veloura_wishlist", JSON.stringify(wishlist));
      showNotification("Saved to Wishlist");
    } else {
      showNotification("Already in Wishlist");
    }
  };

  const showNotification = (msg) => {
    setNotification({ show: true, message: msg });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      activeCategory === "All" ||
      p.category?.toLowerCase() === activeCategory.toLowerCase();
    const genderMatch =
      activeGender === "all" ||
      p.gender?.toLowerCase() === activeGender.toLowerCase();
    return categoryMatch && genderMatch;
  });

  const getBgColor = (i) =>
    ["bg-[#F8F9FB]", "bg-[#E0E7FF]", "bg-[#F0F4F8]", "bg-[#EEF2FF]"][i % 4];

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

      <main className="pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* --- Filters --- */}
        <div className="mb-16 space-y-8">
          <div className="flex justify-center gap-8 border-b border-[#E0E7FF] pb-4 overflow-x-auto no-scrollbar">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGender(g)}
                className={`text-[10px] uppercase tracking-[0.3em] whitespace-nowrap transition-all ${activeGender === g ? "text-[#1A2533] font-bold border-b-2 border-[#1A2533]" : "text-[#7A8DAE]"}`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-6 py-2 text-[9px] uppercase tracking-widest rounded-full border transition-all ${activeCategory === c ? "bg-[#1A2533] text-white border-[#1A2533]" : "bg-white text-[#7A8DAE] border-[#E0E7FF] hover:border-[#7A8DAE]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-[#7A8DAE]">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((item, i) => {
              const isOutOfStock = !item.stock || parseInt(item.stock) === 0;

              return (
                <div
                  key={item._id || item.id}
                  className="group cursor-pointer"
                  onClick={() =>
                    navigate("/veloura/productdetails", {
                      state: { product: item },
                    })
                  }
                >
                  <div
                    className={`${getBgColor(i)} aspect-square relative flex items-center justify-center overflow-hidden rounded-sm`}
                  >
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-40" : "opacity-90"}`}
                    />

                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                        <span className="border border-[#1A2533] px-4 py-1.5 text-[#1A2533] text-[9px] font-bold tracking-[0.3em] uppercase bg-white/80">
                          Sold Out
                        </span>
                      </div>
                    )}

                    <button
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1A2533] hover:text-white"
                      onClick={(e) => addToWishlist(e, item)}
                    >
                      <Heart size={14} />
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => addToCart(e, item)}
                      className={`absolute bottom-0 left-0 w-full py-5 text-[10px] font-bold tracking-[0.4em] uppercase transition-transform duration-300 flex items-center justify-center gap-2
                        ${
                          isOutOfStock
                            ? "bg-zinc-200 text-zinc-500 translate-y-0"
                            : "bg-[#1A2533] text-white translate-y-full group-hover:translate-y-0"
                        }`}
                    >
                      {isOutOfStock ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Add To Cart
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-5 flex justify-between items-start">
                    <div>
                      <p className="text-[8px] uppercase tracking-tighter text-[#7A8DAE] mb-1">
                        {item.gender} • {item.category}
                      </p>
                      <h3
                        className={`text-sm font-serif italic ${isOutOfStock ? "text-[#7A8DAE]" : "text-[#1A2533]"}`}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <p
                      className={`text-sm font-medium ${isOutOfStock ? "text-[#7A8DAE] opacity-50" : "text-[#1A2533]"}`}
                    >
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraStore;
