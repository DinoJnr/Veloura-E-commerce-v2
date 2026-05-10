import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, Key, Eye, EyeOff, 
  Truck, Mail, Cpu, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VelouraAdminRegistration = () => {
  const navigate = useNavigate();
  const [regType, setRegType] = useState('admin'); // 'admin' or 'logistics'
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PASSWORD STRENGTH LOGIC (Upper, Lower, Number, String)
  const getStrength = (pass) => {
    if (!pass) return { label: 'Awaiting Entry', color: 'text-gray-300' };
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasChar = /[^A-Za-z0-9]/.test(pass);
    const length = pass.length >= 8;

    const score = [hasUpper, hasLower, hasNumber, hasChar, length].filter(Boolean).length;

    if (score <= 2) return { label: 'Weak Profile', color: 'text-red-400' };
    if (score <= 4) return { label: 'Secure Profile', color: 'text-orange-400' };
    return { label: 'Elite Encryption', color: 'text-emerald-500' };
  };

  const strength = getStrength(formData.password);

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Security Error: Passwords do not match.");
      return;
    }

    setIsProcessing(true);

    // GENERATE ID ONLY AT POINT OF SUBMISSION
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = regType === 'admin' ? `AD-900-${randomSuffix}` : `LG-900-${randomSuffix}`;

    const payload = {
      systemId: generatedId, // Pass the AD-900 or LG-900 ID
      role: regType,
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password
    };

    try {
      // Replace with your actual endpoint
      const response = await axios.post('http://localhost:5200/admin/register', payload);
      
      if (response.data.success) {
        alert(`Success! Generated Node ID: ${generatedId}`);
        navigate('/login');
      }
    } catch (error) {
      console.error("UPLINK ERROR:", error);
      alert(error.response?.data?.message || "Cloud Sync Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* BACKGROUND DECOR (From your image style) */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none">
        <ShieldCheck size={400} className="text-emerald-900" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-emerald-950">
            Veloura<span className="text-emerald-600">Registration</span>
          </h1>
          <p className="text-[10px] font-black text-emerald-900/30 uppercase tracking-[0.4em] mt-2">
            Secure Node Provisioning Terminal
          </p>
        </div>

        {/* MODE SELECTOR */}
        <div className="grid grid-cols-2 gap-3 p-2 bg-white/40 rounded-[28px] mb-8 border border-white">
          <button 
            onClick={() => setRegType('admin')}
            className={`py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              regType === 'admin' ? 'bg-emerald-950 text-white shadow-xl' : 'text-emerald-900/40 hover:text-emerald-950'
            }`}
          >
            <Key size={14} /> Admin Node
          </button>
          <button 
            onClick={() => setRegType('logistics')}
            className={`py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              regType === 'logistics' ? 'bg-emerald-950 text-white shadow-xl' : 'text-emerald-900/40 hover:text-emerald-950'
            }`}
          >
            <Truck size={14} /> Logistics Node
          </button>
        </div>

        {/* FORM CARD */}
        <motion.div layout className="bg-white/80 backdrop-blur-xl border border-white rounded-[44px] p-10 md:p-14 shadow-2xl">
          <form onSubmit={handleRegistration} className="space-y-6">
            
            {/* NAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-950/40 uppercase tracking-widest ml-1">Identity</label>
              <input 
                type="text" name="fullName" required onChange={handleInput}
                placeholder="Full Name" 
                className="w-full bg-[#F1F8E9]/50 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-950/40 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <input 
                  type="email" name="email" required onChange={handleInput}
                  placeholder="name@veloura.com" 
                  className="w-full bg-[#F1F8E9]/50 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                />
                <Mail size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-200" />
              </div>
            </div>

            {/* PASSWORDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-950/40 uppercase tracking-widest ml-1 flex justify-between">
                  Key <span className={`${strength.color} text-[8px]`}>{strength.label}</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} name="password" required onChange={handleInput}
                    className="w-full bg-[#F1F8E9]/50 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-950/40 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} name="confirmPassword" required onChange={handleInput}
                    className="w-full bg-[#F1F8E9]/50 border border-emerald-100 rounded-2xl py-4 px-6 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all" 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-200">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <button 
              type="submit" disabled={isProcessing}
              className="w-full py-6 bg-emerald-950 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
            >
              {isProcessing ? <Cpu className="animate-spin" size={20} /> : <>Initialize {regType} Access <ArrowRight size={18} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default VelouraAdminRegistration;