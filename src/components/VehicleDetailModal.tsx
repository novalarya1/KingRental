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
  
  // Base URL untuk gambar dari Laravel (Sesuaikan dengan .env Anda)
  const STORAGE_URL = "http://localhost:8000/storage/";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  // Logic untuk menentukan URL gambar (Sama dengan BentoGrid)
  const imageUrl = vehicle.img.startsWith('http') 
    ? vehicle.img 
    : `${STORAGE_URL}${vehicle.img}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-zinc-950 w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-3 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* LEFT SIDE: Vehicle Visuals */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-auto group overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
            <img 
              src={imageUrl} 
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542362567-b058c0221172?q=80&w=800'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                Premium Choice
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Details & Pricing */}
          <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-between bg-zinc-950">
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                   <h4 className="text-blue-500 font-black tracking-[0.3em] text-[10px] uppercase">
                    {vehicle.type} Exclusive
                  </h4>
                  <span className={`h-1.5 w-1.5 rounded-full ${vehicle.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
                  {vehicle.name}
                </h2>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                <SpecItem icon={<Users size={18}/>} label="Capacity" value={`${vehicle.seats} Seats`} />
                <SpecItem icon={<Settings size={18}/>} label="Transmission" value={vehicle.transmission} />
                <SpecItem icon={<Gauge size={18}/>} label="Performance" value="Turbocharged" />
                <SpecItem icon={<ShieldCheck size={18}/>} label="Insurance" value="Fully Covered" />
              </div>

              {/* Inclusions List */}
              <div className="mb-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-blue-600"></span> 
                  Included Services
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <InclusionItem text="Professional Valet" />
                  <InclusionItem text="Unlimited Mileage" />
                  <InclusionItem text="24/7 VIP Support" />
                  <InclusionItem text="Premium Insurance" />
                </ul>
              </div>
            </div>

            {/* Footer: Price & Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1 font-mono">Total Rate / Day</p>
                <p className="text-3xl font-black italic tracking-tighter text-white">
                  Rp {Number(vehicle.price).toLocaleString('id-ID')}
                  <span className="text-[10px] font-bold text-zinc-500 italic ml-2 tracking-normal underline decoration-blue-500/50">INC. TAX</span>
                </p>
              </div>
              
              <button 
                disabled={vehicle.status !== 'Available'}
                onClick={() => onBooking(vehicle)}
                className={`w-full sm:w-auto px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500
                  ${vehicle.status === 'Available' 
                    ? 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl active:scale-95' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                `}
              >
                {vehicle.status === 'Available' ? 'Proceed to Rent' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components tetap sama namun dengan styling lebih tajam
function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-300">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
        <p className="text-xs md:text-sm font-black text-zinc-100 uppercase italic tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function InclusionItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
      <CheckCircle2 size={12} className="text-blue-500" />
      {text}
    </li>
  );
}