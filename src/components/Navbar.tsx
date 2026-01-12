import React, { useState, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, History, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: { name: string; role: 'User' | 'Admin'; picture?: string } | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
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

  // Clean Logout Handler
  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

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
              
              {/* Profile Dropdown Container */}
              <div className="relative group">
                <div className="h-10 w-10 rounded-full border-2 border-blue-600 p-0.5 group-hover:border-white transition-all duration-300 cursor-pointer overflow-hidden">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-zinc-800 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                {/* Desktop Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-zinc-950 border border-white/10 rounded-[2rem] opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="px-4 py-3 mb-2 border-b border-white/5">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Account</p>
                    <p className="text-xs text-white font-bold truncate">{user.name}</p>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black text-zinc-400 hover:text-white hover:bg-red-600 rounded-[1.5rem] transition-all duration-300 group/logout"
                  >
                    <div className="bg-red-500/10 p-2 rounded-lg group-hover/logout:bg-white/20 transition-colors">
                      <LogOut size={14} className="text-red-500 group-hover/logout:text-white" />
                    </div>
                    <span className="tracking-[0.2em]">SIGN OUT</span>
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
        <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-white/10 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-4 duration-500 shadow-2xl">
          {user ? (
            <>
              <div className="flex items-center gap-4 mb-4 pb-6 border-b border-white/5">
                <div className="h-14 w-14 rounded-full border-2 border-blue-600 p-0.5">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-zinc-800 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tighter">{user.name}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">{user.role}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button onClick={() => { onViewChange('home'); setIsMobileMenuOpen(false); }} className="w-full text-left font-black text-zinc-400 hover:text-blue-500 py-3 uppercase text-[10px] tracking-[0.2em] transition-colors">Home</button>
                {user.role === 'Admin' ? (
                  <button onClick={() => { onViewChange('admin'); setIsMobileMenuOpen(false); }} className="w-full text-left font-black text-zinc-400 hover:text-blue-500 py-3 uppercase text-[10px] tracking-[0.2em] transition-colors">Admin Panel</button>
                ) : (
                  <button onClick={() => { onViewChange('history'); setIsMobileMenuOpen(false); }} className="w-full text-left font-black text-zinc-400 hover:text-blue-500 py-3 uppercase text-[10px] tracking-[0.2em] transition-colors">My Bookings</button>
                )}
              </div>

              <button 
                onClick={handleLogout} 
                className="w-full bg-red-600/10 border border-red-600/20 text-red-500 py-4 rounded-2xl font-black mt-4 flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-300"
              >
                <LogOut size={16} /> SIGN OUT
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }} 
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-600/20"
              >
                Create Account
              </button>
              <button 
                onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} 
                className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em]"
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