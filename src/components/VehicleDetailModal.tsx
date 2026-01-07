import React, { useEffect } from 'react';
import { X, Users, Settings, Gauge, ShieldCheck, CheckCircle2 } from 'lucide-react';

type Vehicle = {
  id: string;
  name: string;
  type: 'Mobil' | 'Motor';
  price: number;
  status: 'Available' | 'Booked';
  img: string;
  seats: number;
  transmission: string;
};

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onBooking: (v: Vehicle) => void;
}

export default function VehicleDetailModal({ vehicle, isOpen, onClose, onBooking }: Props) {
  
  // Perbaikan 1: Mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Backdrop dengan transisi halus */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-zinc-950 w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white"
        >
          <X size={20} />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* KIRI: Visual Kendaraan */}
          <div className="relative h-[250px] sm:h-[350px] lg:h-full group overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
            <img 
              src={vehicle.img} 
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Overlay Gradient yang lebih halus */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                Premium Choice
              </span>
            </div>
          </div>

          {/* KANAN: Informasi & Aksi */}
          <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-between bg-zinc-950">
            <div>
              <div className="mb-8">
                <h4 className="text-blue-500 font-black tracking-[0.3em] text-[10px] uppercase mb-2">
                  {vehicle.type} Exclusive
                </h4>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
                  {vehicle.name}
                </h2>
              </div>

              {/* Spek Grid - Perbaikan Grid Gap */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                <SpecItem icon={<Users size={18}/>} label="Capacity" value={`${vehicle.seats} Seats`} />
                <SpecItem icon={<Settings size={18}/>} label="Transmisi" value={vehicle.transmission} />
                <SpecItem icon={<Gauge size={18}/>} label="Engine" value="High Perf." />
                <SpecItem icon={<ShieldCheck size={18}/>} label="Insurance" value="Full Covered" />
              </div>

              {/* Deskripsi/Service - Menggunakan Icon yang konsisten */}
              <div className="mb-8">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-blue-600"></span> 
                  Inclusions
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <InclusionItem text="Professional Driver" />
                  <InclusionItem text="Sanitized Unit" />
                  <InclusionItem text="24/7 Assistance" />
                  <InclusionItem text="Mineral Water" />
                </ul>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Price per day</p>
                <p className="text-3xl font-black italic tracking-tighter text-white">
                  Rp {vehicle.price.toLocaleString('id-ID')}
                </p>
              </div>
              
              <button 
                disabled={vehicle.status === 'Booked'}
                onClick={() => {
                  onBooking(vehicle);
                  onClose();
                }}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300
                  ${vehicle.status === 'Available' 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-95' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
                `}
              >
                {vehicle.status === 'Available' ? 'Book This Unit' : 'Fully Booked'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Kecil untuk Scannability Kode
function SpecItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-blue-500/30 transition-colors">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-xs md:text-sm font-black text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function InclusionItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
      <CheckCircle2 size={14} className="text-blue-500/70" />
      {text}
    </li>
  );
}