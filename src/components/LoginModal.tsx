import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response?: any) => void;
  onManualLogin: (email: string, password: string) => Promise<void>; 
  onSwitchToRegister: () => void;
  onError: (error?: any) => void;
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onManualLogin, 
  onError, 
  onSwitchToRegister 
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg(null); 

    try {
      // 1. Jalankan login (CSRF sudah ditangani di dalam onManualLogin App.tsx biasanya, 
      // tapi jika tidak, pastikan api.get('/sanctum/csrf-cookie') terpanggil)
      await onManualLogin(email, password);
      
      // 2. Jika sukses (tidak throw error), bersihkan form dan tutup
      setEmail('');
      setPassword('');
      onSuccess(); 
    } catch (err: any) {
      console.error("Login Error:", err);
      
      // 3. Tangani pesan error dari Laravel
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 422) {
        // Error validasi (email/password salah format atau tidak cocok)
        setErrorMsg(data.message || "INVALID CREDENTIALS");
      } else if (status === 419) {
        setErrorMsg("SESSION EXPIRED. PLEASE REFRESH.");
      } else {
        setErrorMsg("CONNECTION ERROR. PLEASE TRY AGAIN.");
      }
      
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      {/* Overlay dengan animasi fade */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Welcome <span className="text-blue-600">Back</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
            The Royal Experience Awaits
          </p>
        </div>

        {/* FEEDBACK ERROR */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}

        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              required
              type="email" 
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              required
              type="password" 
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-black uppercase py-4 rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>Sign In <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-zinc-900 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">OR</span>
        </div>

        {/* GOOGLE LOGIN CONTAINER */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm flex justify-center scale-90 md:scale-100">
             <GoogleLogin
               onSuccess={onSuccess}
               onError={() => {
                 setErrorMsg("GOOGLE AUTHENTICATION FAILED");
                 onError();
               }}
               theme="filled_blue"
               shape="pill"
               size="large"
               text="continue_with"
               width="320"
            />
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Don't have an account? 
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="ml-2 text-blue-500 hover:text-white transition-colors underline underline-offset-4"
            >
              Sign Up Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}