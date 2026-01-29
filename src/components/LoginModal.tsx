import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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

  // Reset form saat modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Menunggu proses login selesai di level App.tsx / API
      await onManualLogin(email, password);
      
      // Jika berhasil, panggil onSuccess
      onSuccess(); 
    } catch (err: any) {
      // Ambil pesan error detail dari Laravel
      const responseData = err.response?.data;
      const status = err.response?.status;

      let message = "KONEKSI BERMASALAH";

      if (status === 422) {
        // Jika Laravel mengirim ValidationException
        const validationErrors = responseData?.errors;
        message = validationErrors 
          ? Object.values(validationErrors).flat()[0] as string 
          : responseData?.message || "KREDENSIAL TIDAK COCOK";
      } else if (status === 419) {
        message = "SESI KADALUARSA (CSRF), SILAKAN REFRESH HALAMAN";
      } else if (status === 405) {
        message = "METODE REQUEST SALAH (CEK NGROK/API)";
      } else {
        message = err.message || "TERJADI KESALAHAN PADA SERVER";
      }

      setErrorMsg(message.toUpperCase());
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
      {/* Overlay dengan transisi yang halus */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Tombol Close */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 z-10"
          aria-label="Close Modal"
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

        {/* Error Alert Section */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}

        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative group">
            <Mail 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" 
              size={16} 
            />
            <input 
              required
              type="email" 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" 
              size={16} 
            />
            <input 
              required
              type="password" 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold text-white focus:border-blue-600 focus:bg-white/[0.08] outline-none transition-all placeholder:text-zinc-600 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
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

        {/* Divider */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-zinc-950 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Google Login Section */}
        <div className="flex justify-center">
          <div className="w-full flex justify-center scale-90 md:scale-100 overflow-hidden">
            <GoogleLogin
              onSuccess={(credentialResponse) => onSuccess(credentialResponse)}
              onError={() => {
                setErrorMsg("GOOGLE AUTHENTICATION FAILED");
                onError();
              }}
              theme="filled_blue"
              shape="pill"
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
      </div>
    </div>
  );
}