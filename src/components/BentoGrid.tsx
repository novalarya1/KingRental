import React from 'react';
import { Users, Gauge, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';
import type { Vehicle } from '../types';

interface BentoGridProps {
  vehicles: Vehicle[];
  onBooking: (vehicle: Vehicle) => void; 
}

export default function BentoGrid({ vehicles, onBooking }: BentoGridProps) {
  // Base URL untuk gambar dari Laravel Storage (Sesuaikan dengan .env Anda)
  const STORAGE_URL = "http://localhost:8000/storage/";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {vehicles.map((car, index) => {
        // Cek apakah image adalah URL penuh atau hanya path storage
        const imageUrl = car.img.startsWith('http') ? car.img : `${STORAGE_URL}${car.img}`;

        return (
          <div 
            key={car.id} 
            className="group relative bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-700"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Status Badge */}
            <div className="absolute top-6 left-6 z-30">
              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${
                car.status === 'Available' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-500/10 text-zinc-500 border-white/10'
              }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${car.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                {car.status} 
              </span>
            </div>

            {/* Vehicle Image */}
            <div 
              className="relative h-72 overflow-hidden cursor-pointer"
              onClick={() => car.status === 'Available' && onBooking(car)}
            >
              <img 
                src={imageUrl} 
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542362567-b058c0221172?q=80&w=800'; }} // Fallback jika gambar error
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90"></div>
            </div>

            {/* Content Area */}
            <div className="p-8 -mt-10 relative z-20 flex-1 flex flex-col bg-zinc-900/80 backdrop-blur-md rounded-t-[3rem] border-t border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{car.type}</p>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter group-hover:text-blue-400 transition-colors uppercase">
                    {car.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1 font-mono">ID: {car.id}</p>
                  <p className="text-xl font-black text-white flex items-start gap-1">
                    <span className="text-[10px] mt-1 text-blue-500 font-bold">RP</span>
                    {Number(car.price).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 py-6 my-auto border-y border-white/5">
                <div className="flex flex-col items-center gap-2">
                  <Users size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase">{car.seats} Seats</span>
                </div>
                <div className="flex flex-col items-center gap-2 border-x border-white/5">
                  <Gauge size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase">{car.transmission}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Premium</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => onBooking(car)}
                disabled={car.status !== 'Available'}
                className={`w-full mt-8 py-5 rounded-[1.5rem] font-black text-[11px] transition-all duration-500 transform active:scale-95 uppercase italic tracking-[0.2em] relative overflow-hidden group/btn ${
                  car.status === 'Available'
                  ? 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {car.status === 'Available' ? (
                    <>CONFIRM BOOKING <ArrowUpRight size={14} /></>
                  ) : 'CURRENTLY RENTED'}
                </span>
                {car.status === 'Available' && (
                  <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}