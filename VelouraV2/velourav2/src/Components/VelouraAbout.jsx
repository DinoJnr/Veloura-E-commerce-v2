import React from "react";
import { ArrowRight } from "lucide-react";
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";

const VelouraAbout = () => {
  return (
    <div className="bg-[#FBFBFB] text-[#1A1A1A]">
      <Velouraheader />

      {/* --- Header Section --- */}
      <section className="pt-40 pb-24 px-6 lg:px-12 text-center bg-gradient-to-b from-[#F0F4F8] to-[#FBFBFB]">
        <span className="text-[10px] uppercase tracking-[0.5em] text-[#7A8DAE] mb-4 block font-medium">
          Our Heritage
        </span>
        <h1 className="text-5xl md:text-7xl font-serif italic mb-12 text-[#2C3E50]">
          The Art of <br /> Timeless Tailoring
        </h1>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[650px]">
        <div className="bg-[#D1DCE5] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1558603668-6570496b66f8?auto=format&fit=crop&q=80&w=1000"
            alt="Craftsmanship"
            className="w-full h-full object-cover mix-blend-multiply opacity-80"
          />
        </div>
        {/* Milky White Side with Blueish Tint */}
        <div className="flex flex-col justify-center px-12 lg:px-24 py-20 bg-[#F8F9FB]">
          <h2 className="text-2xl font-serif mb-6 italic text-[#2C3E50]">
            The Veloura Vision
          </h2>
          <p className="text-sm leading-relaxed text-[#5D6D7E] mb-8 font-light max-w-md">
            Founded in 2024, Veloura was born from a desire to strip away the
            noise of fast fashion. We believe that clothing should be a
            permanent investment, not a temporary trend. Every stitch is a
            conversation between heritage techniques and modern silhouettes.
          </p>
          <div className="h-[1px] w-20 bg-[#BDC3C7]" />
        </div>
      </section>

      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="text-center group">
            <div className="w-12 h-[1px] bg-[#E0E7FF] mx-auto mb-6 group-hover:w-20 transition-all duration-500" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-[#2C3E50]">
              Quality
            </h3>
            <p className="text-xs text-[#7F8C8D] leading-loose">
              We source only the finest natural fibers—organic cotton, ethically
              harvested silk, and Grade-A cashmere.
            </p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-[1px] bg-[#E0E7FF] mx-auto mb-6 group-hover:w-20 transition-all duration-500" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-[#2C3E50]">
              Ethics
            </h3>
            <p className="text-xs text-[#7F8C8D] leading-loose">
              Our ateliers are based in regions with rich textile histories,
              ensuring fair wages and artisanal preservation.
            </p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-[1px] bg-[#E0E7FF] mx-auto mb-6 group-hover:w-20 transition-all duration-500" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-[#2C3E50]">
              Design
            </h3>
            <p className="text-xs text-[#7F8C8D] leading-loose">
              Minimalism is not about less; it’s about the perfect amount. Our
              designs focus on fit and movement.
            </p>
          </div>
        </div>
      </section>

      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1500"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Studio View"
        />
        {/* Blue Tint Overlay */}
        <div className="absolute inset-0 bg-[#1A2533]/60 mix-blend-multiply" />
        <div className="relative z-10 text-center text-white px-4">
          <blockquote className="text-3xl md:text-5xl font-serif italic max-w-4xl mx-auto leading-tight">
            "Luxury is not about being noticed, it's about being remembered."
          </blockquote>
          <p className="mt-8 text-[10px] uppercase tracking-[0.4em] font-light text-blue-100/70">
            — Veloura Philosophy
          </p>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-40 text-center bg-[#F8F9FB]">
        <h2 className="text-3xl font-serif mb-10 italic text-[#2C3E50]">
          Ready to see the collection?
        </h2>
        <button className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] font-bold text-[#2C3E50] hover:text-[#7A8DAE] transition group">
          Browse the shop
          <ArrowRight
            size={16}
            className="group-hover:translate-x-2 transition"
          />
        </button>
      </section>

      <VelourabuttonNavbar />
    </div>
  );
};

export default VelouraAbout;
