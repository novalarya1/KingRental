import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: any) => void;
  onSwitchToRegister: () => void;
  onError: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess, onError, onSwitchToRegister }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      {/* Overlay Blur */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      {/* Card Login */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Welcome <span className="text-blue-600">Back</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
            The Royal Experience Awaits
          </p>
        </div>

        {/* Form Login Manual */}
        <form className="space-y-4 mb-8" onSubmit={(e) => e.preventDefault()}>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <button className="w-full bg-blue-600 text-white font-black uppercase py-4 rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20">
            Sign In <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-zinc-900 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Google Login - FIXED VERSION */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[350px] overflow-hidden rounded-xl flex justify-center translate-x-1">
             <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              useOneTap
              theme="filled_blue" // Menggunakan warna biru agar senada dengan tombol Sign In
              shape="pill"
              size="large"
              text="continue_with"
              width="320" // Memberikan width spesifik agar tidak terpotong di mobile
            />
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center mt-10">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Don't have an account? 
            <button 
              onClick={onSwitchToRegister}
              className="ml-2 text-blue-500 hover:text-white transition-colors underline underline-offset-4"
            >
              Sign Up Now
            </button>
          </p>
        </div>

        <p className="text-center text-[9px] text-zinc-800 mt-10 uppercase tracking-[0.6em] font-black">
          King Rental • Established 2026
        </p>
      </div>
    </div>
  );
}