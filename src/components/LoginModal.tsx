import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: any) => void;
  onManualLogin: (email: string, password: string) => Promise<void>; 
  onSwitchToRegister: () => void;
  onError: () => void;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // State untuk pesan error

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null); // Reset error setiap kali mencoba login

    try {
      // 1. WAJIB: Minta CSRF Cookie ke Laravel Sanctum
      await api.get('/sanctum/csrf-cookie');

      // 2. Jalankan fungsi login manual
      await onManualLogin(email, password);
      
      // Jika berhasil, form biasanya ditutup oleh App.tsx, 
      // tapi kita bersihkan state di sini sebagai cadangan
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error("Login error in modal:", err);
      // Ambil pesan error dari backend jika ada
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      setErrorMsg(message.toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      {/* Blur Overlay */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      {/* Login Card */}
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

        {/* Error Alert - Ditambahkan untuk feedback user */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500" size={16} />
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errorMsg}</p>
          </div>
        )}

        {/* Manual Login Form */}
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              required
              type="email" 
              autoComplete="email"
              value={email}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <button 
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

        {/* Divider */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-zinc-900 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Google Login */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[350px] overflow-hidden rounded-xl flex justify-center translate-x-1">
             <GoogleLogin
               onSuccess={onSuccess}
               onError={onError}
               useOneTap
               theme="filled_blue"
               shape="pill"
               size="large"
               text="continue_with"
               width="320"
            />
          </div>
        </div>

        {/* Switch to Register */}
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

        <p className="text-center text-[9px] text-zinc-800 mt-10 uppercase tracking-[0.6em] font-black">
          King Rental • Established 2026
        </p>
      </div>
    </div>
  );
}