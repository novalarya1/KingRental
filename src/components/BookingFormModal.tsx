import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Timer, Loader2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface BookingFormProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  // Define the expected structure for the callback
  onConfirm: (bookingData: { 
    vehicleId: number | string;
    startDate: string;
    endDate: string;
    totalPrice: number 
  }) => void;
}

export default function BookingFormModal({ isOpen, vehicle, onClose, onConfirm }: BookingFormProps) {
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Price Calculation Logic
  useEffect(() => {
    if (!vehicle || !startDate) {
      setDuration(0);
      setTotalPrice(0);
      return;
    }

    const rawPrice = (vehicle as any).price_per_day || (vehicle as any).price || 0;
    let basePrice = typeof rawPrice === 'string' 
      ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) 
      : Number(rawPrice);
    
    if (basePrice > 0 && basePrice < 10000) basePrice *= 1000;

    if (bookingType === 'daily' && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const activeDays = diffDays > 0 ? diffDays : 0;
      setDuration(activeDays);
      setTotalPrice(activeDays * basePrice);
    } 
    else if (bookingType === 'hourly' && startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const totalStartMinutes = startH * 60 + startM;
      const totalEndMinutes = endH * 60 + endM;
      let diffMinutes = totalEndMinutes - totalStartMinutes;

      if (diffMinutes < 0) diffMinutes = 0; 

      const activeHours = diffMinutes / 60;
      setDuration(Number(activeHours.toFixed(1)));

      const hourlyRate = basePrice / 24;
      setTotalPrice(Math.round(activeHours * hourlyRate));
    }
  }, [startDate, endDate, startTime, endTime, bookingType, vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const finalStart = bookingType === 'hourly' ? `${startDate} ${startTime}:00` : `${startDate} 00:00:00`;
      const finalEnd = bookingType === 'hourly' ? `${startDate} ${endTime}:00` : `${endDate} 23:59:59`;
      
      // --- CRITICAL FIX HERE ---
      // We send a specific object, NOT the vehicle object
      await onConfirm({
        vehicleId: vehicle.id, 
        startDate: finalStart,
        endDate: finalEnd,
        totalPrice: totalPrice
      });

    } catch (error) {
      console.error("Booking processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[120] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Securing Your Ride</h3>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2">Please wait...</p>
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Reservation</h2>
              <p className="text-[10px] text-blue-500 font-bold tracking-[0.4em] uppercase mt-1">
                {vehicle.brand} {vehicle.name}
              </p>
            </div>
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="p-3 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white active:scale-90 disabled:opacity-20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
            {(['daily', 'hourly'] as const).map((type) => (
              <button 
                key={type}
                type="button"
                disabled={isProcessing}
                onClick={() => { setBookingType(type); if(type === 'daily') setEndDate(''); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${bookingType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">
                {bookingType === 'hourly' ? 'Rental Date' : 'Pick-up Date'}
              </label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="date" 
                  required
                  disabled={isProcessing}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white disabled:opacity-50"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {bookingType === 'daily' ? (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">Return Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="date" 
                    required
                    min={startDate || new Date().toISOString().split('T')[0]}
                    disabled={!startDate || isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white disabled:opacity-30"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">Start Time</label>
                  <input 
                    type="time" 
                    value={startTime}
                    disabled={isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none text-white disabled:opacity-50"
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">End Time</label>
                  <input 
                    type="time" 
                    value={endTime}
                    disabled={isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none text-white disabled:opacity-50"
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-[2.5rem] relative overflow-hidden transition-all duration-500">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                  <Timer size={14} className="text-blue-500" />
                  <span>Duration</span>
                </div>
                <span className={`font-black italic text-sm ${duration <= 0 ? 'text-zinc-600' : 'text-white animate-pulse'}`}>
                  {duration} {bookingType === 'daily' ? 'Day(s)' : 'Hour(s)'}
                </span>
              </div>
              <div className="h-[1px] bg-white/5 mb-4"></div>
              <div className="flex justify-between items-end relative z-10">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Estimated Total</p>
                <p className="text-3xl font-black italic tracking-tighter text-blue-500 transition-all">
                   Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={duration <= 0 || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:border-white/5 border border-transparent text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 transition-all duration-500 uppercase italic tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <CreditCard size={18} className={isProcessing ? "animate-bounce" : ""} />
              {isProcessing ? 'Processing...' : duration <= 0 ? 'Select Dates' : 'Confirm & Pay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}