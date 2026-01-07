import React from 'react';
import { Search, Car, Bike, ArrowDown } from 'lucide-react';

interface HeroProps {
  onFilterChange: (type: string) => void;
  onSearchChange: (query: string) => void;
  currentFilter: string;
}

export default function Hero({ onFilterChange, onSearchChange, currentFilter }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">Unit Terbaru Tersedia</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
          DRIVE THE <span className="text-blue-600 italic">ROYAL</span> <br /> 
          EXPERIENCE.
        </h1>
        
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg md:text-xl font-medium mb-12">
          Penyedia layanan sewa kendaraan premium terbaik dengan proses booking instan.
        </p>

        {/* Filter & Search Bar - UC-03 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-zinc-900/50 p-4 rounded-[2.5rem] border border-white/10 backdrop-blur-md max-w-3xl mx-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => onFilterChange('Semua')}
              className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-sm transition-all ${
                currentFilter === 'Semua' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => onFilterChange('Mobil')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all ${
                currentFilter === 'Mobil' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Car size={18} /> Mobil
            </button>
            <button 
              onClick={() => onFilterChange('Motor')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all ${
                currentFilter === 'Motor' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Bike size={18} /> Motor
            </button>
          </div>
          
          <div className="hidden md:block h-10 w-px bg-white/10 mx-2"></div>
          
          {/* Real-time Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari unit..." 
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-black/40 border border-white/5 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all text-white"
            />
          </div>
        </div>

        <div className="mt-20 animate-bounce opacity-20">
          <ArrowDown className="mx-auto" />
        </div>
      </div>
    </section>
  );
}