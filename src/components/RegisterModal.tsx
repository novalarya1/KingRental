import React from 'react';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tambahkan logika pendaftaran manual di sini jika diperlukan
    alert("Fitur pendaftaran manual sedang dikembangkan. Silakan gunakan Google Sign In.");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Join <span className="text-blue-600">The Elite</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Create your royal account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="FULL NAME"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="password" 
              placeholder="PASSWORD"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black font-black uppercase py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 text-sm tracking-widest"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-[1px] flex-1 bg-white/5"></div>
          <span className="text-[10px] font-black text-zinc-600 uppercase">Or Continue With</span>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {/* Google Register (Directly uses same logic as login) */}
        <button 
          className="w-full bg-zinc-800 border border-white/5 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all text-sm"
        >
          <Chrome size={18} className="text-blue-500" />
          Google Account
        </button>

        {/* Footer */}
        <p className="text-center mt-8 text-xs font-bold text-zinc-500">
          ALREADY HAVE AN ACCOUNT?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:underline ml-1"
          >
            LOG IN HERE
          </button>
        </p>
      </div>
    </div>
  );
}