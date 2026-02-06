import React, { useMemo } from 'react';
import { Users, Gauge, ArrowUpRight, Zap, Info } from 'lucide-react';
import type { Vehicle } from '../types';

interface BentoGridProps {
  vehicles: Vehicle[];
  onBooking: (vehicle: Vehicle) => void; 
}

export default function BentoGrid({ vehicles, onBooking }: BentoGridProps) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const STORAGE_URL = `${API_URL}/storage/`;

  const memoizedVehicles = useMemo(() => vehicles, [vehicles]);

  if (!memoizedVehicles || memoizedVehicles.length === 0) {
    return (
      <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-zinc-900/5 backdrop-blur-sm">
        <div className="bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Info className="text-zinc-600" size={32} />
        </div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">
          No units detected in database
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {memoizedVehicles.map((car, index) => {
        // --- 1. IMAGE URL ---
        const imageUrl = car.img 
          ? (car.img.startsWith('http') ? car.img : `${STORAGE_URL}${car.img}`)
          : (car as any).image_url // Fallback jika field dari backend 'image_url'
          ? (car as any).image_url
          : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800';

        // --- 2. LOGIKA STATUS (Sesuai Backend PHP) ---
        // Backend mengirim: 'status' => 'Available' atau 'Booked'
        const isAvailable = (car as any).status === 'Available';

        // Backend mengirim: 'available_estimation' => "Tersedia dalam 2 Hari" / "Tersedia Besok"
        const statusText = (car as any).available_estimation || 'Status Unknown';

        // --- 3. HARGA ---
        // Backend mengirim: "Rp 500.000" (String)
        const getDisplayPrice = () => {
           const priceStr = (car as any).price_per_day || '';
           if (typeof priceStr === 'string') {
               // Hapus "Rp " agar kita bisa styling sendiri "IDR"-nya
               return priceStr.replace('Rp ', '').trim();
           }
           return '0';
        };

        // --- 4. SPEK (Sesuai Backend PHP) ---
        // Note: Di PHP Anda set 'transmission' => $this->capacity
        // Jadi angka kapasitas (Seats) ada di field transmission
        const seatCount = (car as any).transmission || 5; 
        
        // Karena transmission dipakai buat capacity, kita default 'Auto' atau ambil dari field lain jika ada
        const transmissionType = 'Auto'; 

        return (
          <div 
            key={car.id || `v-${index}`} 
            className="group relative bg-zinc-950 border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-700 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-12"
            style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
          >
            {/* --- STATUS BADGE --- */}
            <div className="absolute top-8 left-8 z-30">
              <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-md border shadow-2xl transition-colors duration-500 flex items-center gap-3 ${
                isAvailable 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                
                {/* Menampilkan text dari Backend: "Tersedia dalam 2 Hari" */}
                {statusText} 
              </div>
            </div>

            {/* --- IMAGE SECTION --- */}
            <div 
              className={`relative h-80 overflow-hidden ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => isAvailable && onBooking(car)}
            >
              <img 
                src={imageUrl} 
                alt={`${car.brand} ${car.name}`}
                className={`w-full h-full object-cover transition-transform duration-[2s] ease-out ${isAvailable ? 'group-hover:scale-110' : 'grayscale opacity-50'}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="px-8 pb-8 pt-2 -mt-16 relative z-20 flex-1 flex flex-col bg-zinc-900/80 backdrop-blur-2xl rounded-t-[3.5rem] border-t border-white/5 group-hover:bg-zinc-900/95 transition-all duration-500">
              
              <div className="flex justify-between items-start mb-8 pt-6">
                <div className="space-y-1">
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
                    {car.type || 'Standard Class'}
                  </p>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {car.brand} <span className="text-zinc-500 group-hover:text-blue-400 transition-colors">{car.name}</span>
                  </h3>
                </div>
                
                <div className="text-right">
                  <p className="text-zinc-600 text-[9px] uppercase font-black tracking-widest mb-1">Rate/Day</p>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[10px] font-black text-blue-500 italic">IDR</span>
                    <span className="text-3xl font-black text-white tracking-tighter tabular-nums">
                       {getDisplayPrice()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 py-6 border-y border-white/5">
                <div className="flex flex-col items-center gap-2">
                  <Users size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors duration-500" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                    {seatCount} PAX
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 border-x border-white/5">
                  <Gauge size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors duration-500" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                    {transmissionType}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap size={18} className="text-blue-600/50 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
                  <span className="text-[10px] font-black text-blue-500/80 uppercase italic tracking-tighter">Premium</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => onBooking(car)}
                disabled={!isAvailable}
                className={`group/btn w-full mt-8 py-6 rounded-[2rem] font-black text-[11px] transition-all duration-700 uppercase italic tracking-[0.3em] relative overflow-hidden shadow-2xl ${
                  isAvailable
                  ? 'bg-white text-black hover:shadow-blue-500/20'
                  : 'bg-zinc-800/40 text-zinc-700 cursor-not-allowed border border-white/5'
                }`}
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors">
                  {isAvailable ? (
                    <>RESERVE NOW <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></>
                  ) : (
                    statusText.toUpperCase() // Menampilkan "TERSEDIA BESOK" dll
                  )}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}