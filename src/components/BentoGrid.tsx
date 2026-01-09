import React from 'react';
import { Users, Fuel, Gauge, ShieldCheck } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  type: 'Mobil' | 'Motor';
  price: number;
  status: 'Available' | 'Booked';
  img: string;
  seats: number;
  transmission: string;
}

interface BentoGridProps {
  vehicles: Vehicle[];
  onBooking: (vehicle: Vehicle) => void; // UC-05: Alur Booking
}

export default function BentoGrid({ vehicles, onBooking }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((car) => (
        <div 
          key={car.id} 
          className="group relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl"
        >
          {/* Status Badge - UC-04 */}
          <div className="absolute top-5 left-5 z-10">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
              car.status === 'Available' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {car.status}
            </span>
          </div>

          {/* Vehicle Image - TAMBAHAN: onClick untuk Detail */}
          <div 
            className="relative h-64 overflow-hidden cursor-pointer" 
            onClick={() => onBooking(car)}
          >
            <img 
              src={car.img} 
              alt={car.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80"></div>
          </div>

          {/* Vehicle Info - UC-04: Cek Detail */}
          <div className="p-8 -mt-12 relative z-20">
            <div className="flex justify-between items-end mb-6">
              {/* Judul - TAMBAHAN: onClick & cursor-pointer */}
              <div className="cursor-pointer" onClick={() => onBooking(car)}>
                <p className="text-blue-500 text-xs font-bold uppercase tracking-tighter mb-1">{car.type}</p>
                <h3 className="text-2xl font-black text-white leading-none group-hover:text-blue-400 transition-colors">
                  {car.name}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Mulai Dari</p>
                <p className="text-xl font-black text-white">
                  Rp {car.price.toLocaleString()}
                  <span className="text-zinc-500 text-xs font-normal">/hari</span>
                </p>
              </div>
            </div>

            {/* Spesifikasi - UC-04 */}
            <div className="grid grid-cols-3 gap-2 py-6 border-y border-zinc-800/50">
              <div className="flex flex-col items-center gap-2">
                <Users size={16} className="text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400">{car.seats} Kursi</span>
              </div>
              <div className="flex flex-col items-center gap-2 border-x border-zinc-800/50">
                <Gauge size={16} className="text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400">{car.transmission}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck size={16} className="text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400">Asuransi</span>
              </div>
            </div>

            {/* Action Button - UC-05: Sewa Sekarang */}
            <button 
              onClick={() => onBooking(car)}
              disabled={car.status === 'Booked'}
              className={`w-full mt-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 transform active:scale-95 ${
                car.status === 'Available'
                ? 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl shadow-white/5'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {car.status === 'Available' ? 'SEWA SEKARANG' : 'TIDAK TERSEDIA'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}