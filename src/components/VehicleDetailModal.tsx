import React, { useEffect } from 'react';
import { X, Users, Settings, Gauge, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onBooking: (v: Vehicle) => void;
}

export default function VehicleDetailModal({ vehicle, isOpen, onClose, onBooking }: Props) {
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const STORAGE_URL = `${API_URL}/storage/`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  // --- LOGIKA IMAGE ---
  const imageUrl = vehicle.img 
    ? (vehicle.img.startsWith('http') ? vehicle.img : `${STORAGE_URL}${vehicle.img}`)
    : 'https://images.unsplash.com/photo-1542362567-b058c0221172?q=80&w=800';

  // --- LOGIKA STATUS (Sudah Diperbaiki agar tidak error TS) ---
  const isAvailable = vehicle.is_available === true || 
                      (vehicle.is_available as any) === 1 || 
                      (vehicle.is_available as any) === '1' ||
                      String(vehicle.is_available) === "true";

  // --- LOGIKA HARGA ---
  const rawPrice = (vehicle as any).price_per_day || (vehicle as any).price || 0;
  let basePrice = typeof rawPrice === 'string' 
    ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) 
    : Number(rawPrice);
  
  if (basePrice > 0 && basePrice < 10000) {
    basePrice = basePrice * 1000;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-zinc-950 w-full max-w-5xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-auto max-h-[90vh] flex flex-col lg:flex-row">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="relative h-[250px] sm:h-[350px] lg:h-auto lg:w-1/2 group overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5 shrink-0">
          <img 
            src={imageUrl} 
            alt={vehicle.name}
            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${!isAvailable && 'grayscale opacity-60'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-6 left-6">
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
              {vehicle.brand || 'Premium'} Choice
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar bg-zinc-950">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-blue-500 font-black tracking-[0.3em] text-[10px] uppercase">
                    {vehicle.type} Exclusive Sector
                  </h4>
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
                  {vehicle.brand} <span className="text-zinc-500">{vehicle.name}</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                <SpecItem icon={<Users size={18}/>} label="Capacity" value={`${vehicle.seats || 5} PAX`} />
                <SpecItem icon={<Settings size={18}/>} label="Transmission" value={vehicle.transmission || 'Automatic'} />
                <SpecItem icon={<Gauge size={18}/>} label="Engine" value="Dynamic Power" />
                <SpecItem icon={<ShieldCheck size={18}/>} label="Protection" value="Full Coverage" />
              </div>

              <div className="mb-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-blue-600"></span> 
                  Included Services
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <InclusionItem text="Professional Valet" />
                  <InclusionItem text="Unlimited Mileage" />
                  <InclusionItem text="24/7 VIP Support" />
                  <InclusionItem text="Full Tank Delivery" />
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1 font-mono">Rate / Day</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-blue-500 font-black italic text-xs">IDR</span>
                  <p className="text-3xl font-black italic tracking-tighter text-white">
                    {basePrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <button 
                disabled={!isAvailable}
                onClick={() => onBooking(vehicle)}
                className={`w-full sm:w-auto px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/btn
                  ${isAvailable 
                    ? 'bg-white text-black hover:text-white shadow-xl active:scale-95' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'}
                `}
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAvailable ? 'Secure Reservation' : 'Unit Deployed'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
      <div className="text-blue-500 p-2 bg-blue-500/5 rounded-xl">{icon}</div>
      <div>
        <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
        <p className="text-xs font-black text-zinc-100 uppercase italic tracking-tighter truncate max-w-[80px] md:max-w-none">{value}</p>
      </div>
    </div>
  );
}

function InclusionItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
      <CheckCircle2 size={12} className="text-emerald-500" />
      {text}
    </li>
  );
}