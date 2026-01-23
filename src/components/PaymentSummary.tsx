import React from 'react';
import { Calendar, Car, MapPin, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import type { Vehicle } from '../types';

interface PaymentSummaryProps {
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  totalPrice: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  vehicle,
  startDate,
  endDate,
  totalPrice,
  onConfirm,
  onCancel,
  isLoading
}) => {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full mx-auto overflow-hidden relative shadow-2xl">
      {/* Decorative Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">
            Payment <span className="text-blue-600">Summary</span>
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Secure Checkout</p>
        </div>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase">Cancel</button>
      </div>

      <div className="space-y-6">
        {/* Unit Info Card */}
        <div className="group relative flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-600/30 transition-all">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
            <img 
              src={vehicle.img || '/placeholder-car.png'} 
              alt={vehicle.name} 
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white leading-tight">{vehicle.name}</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[9px] font-black rounded border border-blue-500/20 uppercase">
                {vehicle.type}
               </span>
            </div>
          </div>
        </div>

        {/* Schedule & Logistics */}
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-600/20">
              <Calendar size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Rental Period</p>
              <p className="text-sm text-zinc-300 font-medium">{startDate} — {endDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-600/20">
              <MapPin size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pickup Location</p>
              <p className="text-sm text-zinc-300 font-medium">{vehicle.branch?.name || 'Main Branch Office'}</p>
            </div>
          </div>
        </div>

        {/* Guarantee Info */}
        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
          <ShieldCheck size={18} className="text-emerald-500" />
          <p className="text-[11px] text-emerald-500/80 font-bold uppercase tracking-tight">Insurance & Tax Fully Covered</p>
        </div>

        <hr className="border-white/5" />

        {/* Financials */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-zinc-500 text-[11px] font-black uppercase tracking-widest">
            <span>Rental Subtotal</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-zinc-400 uppercase">Total Amount</span>
            <div className="text-right">
              <p className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Rp {totalPrice.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="group relative w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 overflow-hidden"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
              <span>Confirm & Pay Now</span>
              <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Powered by</span>
                <img src="/midtrans-logo.png" alt="Midtrans" className="h-3" />
            </div>
            <p className="text-[9px] text-zinc-600 text-center leading-relaxed font-medium">
                By clicking "Confirm & Pay", you agree to our <br />
                <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Rental Policy</span>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;