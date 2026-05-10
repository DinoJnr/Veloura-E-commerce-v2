import React, { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Velouraheader from "./Velouratopnavbar ";
import VelourabuttonNavbar from "./VelourabuttonNavbar";


const Veloura_Api = "http://localhost:5200";

const Velouracontact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${Veloura_Api}/user/inquiry`,
        formData,
      );
      if (response.status === 201) {
        alert("Your message has been received by the Atelier.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "General Inquiry",
          message: "",
        });
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      alert("Atelier connection busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-[#2C3E50]">
      <Velouraheader />

      <main className="pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#7A8DAE] mb-4 block font-medium">
                Get in Touch
              </span>
              <h1 className="text-5xl md:text-6xl font-serif italic mb-8 text-[#1A2533]">
                How can we <br /> assist you?
              </h1>
              <p className="text-sm text-[#5D6D7E] max-w-md leading-relaxed font-light">
                Whether you have a question about our collections, need styling
                advice, or require assistance with an order, our concierge team
                is here to help.
              </p>
            </div>

            <div className="space-y-8">
              {/* Info Block 1 */}
              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#E0E7FF] group-hover:bg-[#E0E7FF] transition-colors duration-500">
                  <Mail
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#7A8DAE]"
                  />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#1A2533]">
                    General Inquiries
                  </h3>
                  <p className="text-sm text-[#5D6D7E]">
                    philipadebiyi2@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#E0E7FF] group-hover:bg-[#E0E7FF] transition-colors duration-500">
                  <Phone
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#7A8DAE]"
                  />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#1A2533]">
                    Client Services
                  </h3>
                  <p className="text-sm text-[#5D6D7E]">+234-9067402641</p>
                </div>
              </div>

              {/* Info Block 3 */}
              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#E0E7FF] group-hover:bg-[#E0E7FF] transition-colors duration-500">
                  <MapPin
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#7A8DAE]"
                  />
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#1A2533]">
                    The Atelier
                  </h3>
                  <p className="text-sm text-[#5D6D7E] leading-relaxed">
                    124 Avenue Ogbomoso,
                    <br /> Oyo State, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-xl shadow-blue-900/5 rounded-sm border border-[#E0E7FF]">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-2 focus:border-[#7A8DAE] outline-none transition-colors text-sm font-light text-[#2C3E50]"
                  />
                </div>
                <div className="relative">
                  <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInput}
                    className="w-full bg-transparent border-b border-[#E0E7FF] py-2 focus:border-[#7A8DAE] outline-none transition-colors text-sm font-light text-[#2C3E50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInput}
                  className="w-full bg-transparent border-b border-[#E0E7FF] py-2 focus:border-[#7A8DAE] outline-none transition-colors text-sm font-light text-[#2C3E50]"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] block mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInput}
                  className="w-full bg-transparent border-b border-[#E0E7FF] py-2 focus:border-[#7A8DAE] outline-none transition-colors text-sm font-light appearance-none text-[#2C3E50]"
                >
                  <option value="General Inquiry">
                    Select an inquiry type
                  </option>
                  <option value="Order Status">Order Status</option>
                  <option value="Styling Advice">Styling Advice</option>
                  <option value="Bespoke Request">Bespoke Request</option>
                  <option value="Press & Media">Press & Media</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#7A8DAE] block mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInput}
                  rows="4"
                  className="w-full bg-transparent border-b border-[#E0E7FF] py-2 focus:border-[#7A8DAE] outline-none transition-colors text-sm font-light resize-none text-[#2C3E50]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group py-4 bg-[#1A2533] text-white flex items-center justify-center gap-4 hover:bg-[#7A8DAE] transition-all duration-500 disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                  {loading ? "Transmitting..." : "Send Message"}
                </span>
                {!loading && (
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <section className="h-[400px] w-full bg-[#E0E7FF] mt-20 grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden relative">
        <div className="absolute inset-0 bg-[#7A8DAE]/10 z-10 pointer-events-none" />
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1500"
          alt="Veloura Studio"
          className="w-full h-full object-cover"
        />
      </section>

      <VelourabuttonNavbar />
    </div>
  );
};

export default Velouracontact;
