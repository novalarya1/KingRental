import React, { useState, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, History, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: { name: string; role: 'User' | 'Admin'; picture?: string } | null;
  onLoginClick: () => void;
  onRegisterClick: () => void; // Prop baru untuk modal register
  onLogout: () => void;
  onViewChange: (view: 'home' | 'history' | 'admin') => void;
  currentView: 'home' | 'history' | 'admin';
}

export default function Navbar({ 
  user, 
  onLoginClick, 
  onRegisterClick, 
  onLogout, 
  onViewChange, 
  currentView 
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItemClasses = (view: string) => `
    flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all duration-300
    ${currentView === view ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}
  `;

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <div 
          className="cursor-pointer group" 
          onClick={() => { onViewChange('home'); setIsMobileMenuOpen(false); }}
        >
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            KING<span className="text-blue-600 group-hover:text-blue-400 transition-colors">RENTAL</span>
          </h1>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
          {user && (
            <div className="flex items-center gap-6">
              {user.role === 'Admin' ? (
                <button onClick={() => onViewChange('admin')} className={navItemClasses('admin')}>
                  <LayoutDashboard size={16} />
                  <span>Admin Panel</span>
                </button>
              ) : (
                <button onClick={() => onViewChange('history')} className={navItemClasses('history')}>
                  <History size={16} />
                  <span>My Bookings</span>
                </button>
              )}
            </div>
          )}

          {!user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={onLoginClick}
                className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onRegisterClick}
                className="bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-600/20"
              >
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">
                  {user.name}
                </span>
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
              
              <div className="relative group">
                <div className="h-10 w-10 rounded-full border-2 border-blue-600 p-0.5 group-hover:border-white transition-colors cursor-pointer">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-zinc-800 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 p-2 shadow-2xl">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                  >
                    <LogOut size={14} />
                    SIGN OUT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-zinc-900 border-b border-white/10 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-300 shadow-2xl">
          {user ? (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="h-12 w-12 rounded-full border-2 border-blue-600 p-0.5">
                  <img src={user.picture || "/api/placeholder/48/48"} alt="" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase">{user.name}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              <button onClick={() => { onViewChange('home'); setIsMobileMenuOpen(false); }} className="text-left font-bold text-zinc-400 hover:text-white py-2 uppercase text-xs tracking-widest">Home</button>
              {user.role === 'Admin' ? (
                <button onClick={() => { onViewChange('admin'); setIsMobileMenuOpen(false); }} className="text-left font-bold text-zinc-400 hover:text-white py-2 uppercase text-xs tracking-widest">Admin Panel</button>
              ) : (
                <button onClick={() => { onViewChange('history'); setIsMobileMenuOpen(false); }} className="text-left font-bold text-zinc-400 hover:text-white py-2 uppercase text-xs tracking-widest">My Bookings</button>
              )}
              <button onClick={onLogout} className="w-full bg-zinc-800 text-red-500 py-4 rounded-xl font-black mt-4 flex items-center justify-center gap-2 text-xs tracking-widest">
                <LogOut size={16} /> SIGN OUT
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }} 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em]"
              >
                Create Account
              </button>
              <button 
                onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} 
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em]"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}