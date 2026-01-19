import React, { useState } from 'react';
import { X, Mail, Lock, User, Chrome, Loader2, AlertCircle, Phone, MapPin } from 'lucide-react';
import api from '../api/axios'; 

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  // Update interface untuk menerima phone dan address
  onManualRegister: (name: string, email: string, password: string, phone: string, address: string) => Promise<void>;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onManualRegister }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');     // State Baru
  const [address, setAddress] = useState(''); // State Baru
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.get('/sanctum/csrf-cookie');
      
      // Kirim 5 parameter ke App.tsx
      await onManualRegister(name, email, password, phone, address);
      
      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAddress('');
    } catch (err: any) {
      console.error("Registration error:", err);
      const message = err.response?.data?.message || "Registration failed. Please check your data.";
      setErrorMsg(message.toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Ukuran modal sedikit diperlebar (max-w-lg) agar nyaman dengan banyak field */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Join <span className="text-blue-600">The Elite</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Create your royal account
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="FULL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EMAIL */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600 text-white"
                required
              />
            </div>

            {/* PHONE */}
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="tel" 
                placeholder="PHONE NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600 text-white"
                required
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="relative group">
            <MapPin className="absolute left-4 top-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <textarea 
              placeholder="HOME ADDRESS"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600 text-white resize-none"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-zinc-600 text-white"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-black uppercase py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 text-sm tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-white/5"></div>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Or</span>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        <button 
          className="w-full bg-zinc-800 border border-white/5 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all text-sm uppercase tracking-widest shadow-lg"
        >
          <Chrome size={18} className="text-blue-500" />
          Google Account
        </button>

        <p className="text-center mt-8 text-xs font-bold text-zinc-500">
          ALREADY HAVE AN ACCOUNT?{' '}
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-400 hover:underline ml-1 transition-colors uppercase tracking-tighter"
          >
            Log In Here
          </button>
        </p>
      </div>
    </div>
  );
}