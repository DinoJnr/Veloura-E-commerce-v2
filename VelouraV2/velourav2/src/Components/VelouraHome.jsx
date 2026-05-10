import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VelourabuttonNavbar from "./VelourabuttonNavbar";
import VelouraTopNavbar from "./Velouratopnavbar ";

const slides = [
  {
    id: 1,
    tag: "URBAN EDGE",
    headline: "Jackets for the\nModern Man",
    cta: "Discovery Now",
    // High-fashion male model in blue/urban setting
    image:
      "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 2,
    tag: "NEW SEASON",
    headline: "Effortless Style\nFor Every Woman",
    cta: "Shop Collection",
    // Editorial female fashion
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
  },
];

export default function VelouraHome() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      <VelouraTopNavbar />

      <section className="relative h-[85vh] w-full overflow-hidden bg-[#356ca3]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center"
          >
            <div className="absolute inset-0">
              <img
                src={slides[current].image}
                alt="Fashion Header"
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
            </div>

            <div className="container mx-auto px-10 lg:px-24 relative z-10">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-2xl"
              >
                <span className="text-[11px] tracking-[0.5em] font-bold text-white uppercase block mb-4 opacity-90">
                  {slides[current].tag}
                </span>

                <h1
                  className="text-5xl lg:text-8xl font-bold leading-[1.1] mb-10 text-white whitespace-pre-line drop-shadow-sm"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {slides[current].headline}
                </h1>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
                >
                  {slides[current].cta}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none z-20">
          <button
            onClick={prev}
            className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white flex items-center justify-center backdrop-blur-md transition-all group border border-white/20"
          >
            <ChevronLeft
              size={24}
              className="text-white group-hover:text-black"
            />
          </button>
          <button
            onClick={next}
            className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white flex items-center justify-center backdrop-blur-md transition-all group border border-white/20"
          >
            <ChevronRight
              size={24}
              className="text-white group-hover:text-black"
            />
          </button>
        </div>

        {/* Bottom Decorative Slider Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 transition-all duration-500 ${current === index ? "w-12 bg-white" : "w-4 bg-white/30"}`}
            />
          ))}
        </div>
      </section>

      <VelourabuttonNavbar />
    </div>
  );
}
