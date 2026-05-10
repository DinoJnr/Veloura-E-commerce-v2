import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/veloura/store" },
  { label: "About Us", href: "/veloura/aboutus" },
  { label: "Contact Us", href: "/veloura/contactus" },
];

export default function VelouraTopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const syncCounts = () => {
    const cart = JSON.parse(localStorage.getItem("veloura_cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("veloura_wishlist")) || [];
    setCartCount(cart.reduce((acc, item) => acc + (item.quantity || 1), 0));
    setWishlistCount(wishlist.length);
  };

  useEffect(() => {
    syncCounts();

    
    window.addEventListener("storage", syncCounts);
    window.addEventListener("veloura_cart_updated", syncCounts);
    window.addEventListener("veloura_wishlist_updated", syncCounts);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", syncCounts);
      window.removeEventListener("veloura_cart_updated", syncCounts);
      window.removeEventListener("veloura_wishlist_updated", syncCounts);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
  
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_30px_rgba(0,0,0,0.07)]"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  <Link
                    to={link.href}
                    className="flex items-center gap-1 text-[13px] tracking-[0.08em] uppercase font-medium text-neutral-700 hover:text-black transition-colors duration-200"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-black group-hover:w-full transition-all duration-300" />
                  </Link>
                </div>
              ))}
            </nav>

          
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none select-none"
            >
              <span
                className="text-[26px] font-bold tracking-[0.15em] text-black uppercase"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  letterSpacing: "0.18em",
                }}
              >
                Veloura
              </span>
              <span className="text-[8px] tracking-[0.35em] text-neutral-400 uppercase mt-0.5 font-light">
                Studio
              </span>
            </Link>

            {/* Right — Icons (Desktop) */}
            <div className="flex items-center gap-4">
              <Link
                to="/veloura/wishlist"
                className="hidden lg:block relative p-1.5 text-neutral-700 hover:text-black transition-colors"
              >
                <Heart size={20} strokeWidth={1.6} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a2e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/veloura/cart"
                className="hidden lg:block relative p-1.5 text-neutral-700 hover:text-black transition-colors"
              >
                <ShoppingCart size={20} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a2e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-1.5 text-neutral-700 hover:text-black transition-colors"
              >
                {mobileOpen ? (
                  <X size={22} strokeWidth={1.6} />
                ) : (
                  <Menu size={22} strokeWidth={1.6} />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="h-[1px] bg-neutral-100" />
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-[75vw] max-w-[320px] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <span
                  className="text-xl font-bold tracking-[0.15em] uppercase text-black"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  Veloura
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-neutral-500"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col px-6 pt-6 gap-2 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className="block py-3 text-[13px] tracking-[0.1em] uppercase font-medium text-neutral-700 border-b border-neutral-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Wishlist */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link
                    to="/veloura/wishlist"
                    className="flex items-center justify-between py-3 text-[13px] tracking-[0.1em] uppercase font-medium text-neutral-700 border-b border-neutral-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={18} strokeWidth={1.5} /> Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {/* Cart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/veloura/cart"
                    className="flex items-center justify-between py-3 text-[13px] tracking-[0.1em] uppercase font-medium text-neutral-700 border-b border-neutral-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={18} strokeWidth={1.5} /> Cart
                    </span>
                    {cartCount > 0 && (
                      <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
              </nav>

              <div className="px-6 py-5 border-t border-neutral-100">
                <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-300">
                  © 2026 Veloura Studio
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}