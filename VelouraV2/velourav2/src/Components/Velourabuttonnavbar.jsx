import React from "react";
import {
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoTwitter,
  IoArrowUpOutline,
} from "react-icons/io5";

const VelourabuttonNavbar = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#F8F9FB] text-[#2C3E50] pt-20 pb-10 px-6 lg:px-12 border-t border-[#E0E7FF]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Mission */}
          <div className="col-span-1">
            <h2 className="text-2xl font-serif italic mb-6 text-[#1A2533]">
              Veloura
            </h2>
            <p className="text-xs leading-relaxed text-[#7A8DAE] uppercase tracking-widest">
              Defining the modern wardrobe through sustainable luxury and
              timeless silhouettes. Crafted for the discerning individual.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-[#7A8DAE]">
              Exploration
            </h3>
            <ul className="space-y-4 text-sm font-light text-[#5D6D7E]">
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                The Collection
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Bespoke Services
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Journal
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Sustainability
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-[#7A8DAE]">
              Concierge
            </h3>
            <ul className="space-y-4 text-sm font-light text-[#5D6D7E]">
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Shipping & Returns
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Size Guide
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Contact Us
              </li>
              <li className="hover:text-[#2C3E50] hover:translate-x-1 transition-all cursor-pointer">
                Care Guide
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-[#7A8DAE]">
              Connect
            </h3>
            <div className="flex space-x-6 mb-8 text-[#7A8DAE]">
              <a
                href="#"
                className="hover:text-[#2C3E50] transition transform hover:-translate-y-1"
              >
                <IoLogoInstagram size={20} />
              </a>
              <a
                href="#"
                className="hover:text-[#2C3E50] transition transform hover:-translate-y-1"
              >
                <IoLogoFacebook size={20} />
              </a>
              <a
                href="#"
                className="hover:text-[#2C3E50] transition transform hover:-translate-y-1"
              >
                <IoLogoTwitter size={20} />
              </a>
            </div>
            {/* Newsletter with Sky Blue underline */}
            <div className="relative border-b border-[#E0E7FF] pb-2">
              <input
                type="email"
                placeholder="JOIN THE LIST"
                className="bg-transparent text-[10px] tracking-[0.2em] outline-none w-full placeholder:text-[#BDC3C7] text-[#2C3E50]"
              />
              <button className="absolute right-0 text-[10px] font-bold hover:text-[#7A8DAE] text-[#2C3E50]">
                SIGN UP
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-[#E0E7FF] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] tracking-[0.2em] text-[#BDC3C7] uppercase font-medium">
            © 2026 VELOURA. ALL RIGHTS RESERVED.
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase hover:text-[#7A8DAE] transition text-[#7A8DAE]"
          >
            Back to Top
            <span className="p-2 border border-[#E0E7FF] rounded-full group-hover:border-[#7A8DAE] transition-colors">
              <IoArrowUpOutline size={14} />
            </span>
          </button>

          <div className="flex gap-6 text-[10px] tracking-[0.2em] text-[#BDC3C7]">
            <span className="cursor-pointer hover:text-[#7A8DAE] transition uppercase font-medium">
              Privacy
            </span>
            <span className="cursor-pointer hover:text-[#7A8DAE] transition uppercase font-medium">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default VelourabuttonNavbar;
