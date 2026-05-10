// pages/VelouraLogin.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API = "http://localhost:5200";

const VelouraLogin = () => {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      login(res.data.user, res.data.token); // saves to context + localStorage
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fcf9] items-center justify-center p-6 font-sans">
      {/* Soft Brand Background Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3da066]/5 rounded-full blur-[120px]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3da066]/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[440px] z-10">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 bg-[#3da066] rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-green-200 mb-5">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Veloura Admin</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2 ml-1">Secure Gateway</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-green-900/[0.03] border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">!</span>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative mt-2 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#3da066] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@veloura.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#3da066]/20 focus:ring-4 focus:ring-[#3da066]/5 outline-none font-medium text-sm transition-all text-gray-800 shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative mt-2 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#3da066] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#3da066]/20 focus:ring-4 focus:ring-[#3da066]/5 outline-none font-medium text-sm transition-all text-gray-800 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3da066] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#2d7a4d] transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Verifying…</>
                  : <><span>Enter Dashboard</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#3da066] border-b border-[#3da066]/20 pb-0.5">Contact Root Admin</a>
          </p>
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <span className="text-[9px] font-black uppercase tracking-widest">v 3.0.1</span>
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-widest">Veloura Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelouraLogin;