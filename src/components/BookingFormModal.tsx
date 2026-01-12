import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Clock, Timer } from 'lucide-react';
import type { Vehicle } from '../types';

interface BookingFormProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onConfirm: (vehicle: Vehicle, startDate: string, endDate: string, totalPrice: number) => void;
}

export default function BookingFormModal({ isOpen, vehicle, onClose, onConfirm }: BookingFormProps) {
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00'); // Default 12 hours for visible difference
  
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!vehicle || !startDate) return;

    if (bookingType === 'daily' && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const activeDays = diffDays > 0 ? diffDays : 0;
      setDuration(activeDays);
      setTotalPrice(activeDays * vehicle.price);
    } 
    else if (bookingType === 'hourly' && startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const totalStartMinutes = startH * 60 + startM;
      const totalEndMinutes = endH * 60 + endM;
      let diffMinutes = totalEndMinutes - totalStartMinutes;

      // Logic if return time is same day (currently assumes same day)
      if (diffMinutes < 0) diffMinutes = 0; 

      const activeHours = diffMinutes / 60;
      setDuration(Number(activeHours.toFixed(1))); // Round to 1 decimal place

      // CALCULATION FIX: Hourly Rate = Daily Price / 24
      const hourlyRate = vehicle.price / 24;
      setTotalPrice(Math.round(activeHours * hourlyRate));
    }
  }, [startDate, endDate, startTime, endTime, bookingType, vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      alert("Return duration must be after the start time.");
      return;
    }
    const finalStart = bookingType === 'hourly' ? `${startDate} T${startTime}` : startDate;
    const finalEnd = bookingType === 'hourly' ? `${startDate} T${endTime}` : endDate;
    
    onConfirm(vehicle, finalStart, finalEnd, totalPrice);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 md:p-12">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Reservation
              </h2>
              <p className="text-[10px] text-blue-500 font-bold tracking-[0.4em] uppercase mt-1">Select Duration Type</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full border border-white/5 transition-all text-white">
              <X size={20} />
            </button>
          </div>

          {/* TAB SELECTION */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => setBookingType('daily')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${bookingType === 'daily' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              Daily
            </button>
            <button 
              type="button"
              onClick={() => setBookingType('hourly')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${bookingType === 'hourly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              Hourly
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">
                {bookingType === 'hourly' ? 'Rental Date' : 'Pick-up Date'}
              </label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={18} />
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white cursor-pointer"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {bookingType === 'daily' ? (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">Return Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    required
                    min={startDate}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white cursor-pointer"
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
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white cursor-pointer"
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 tracking-widest block">End Time</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-600/50 transition-all text-white cursor-pointer"
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <Timer size={14} className="text-blue-500" />
                  <span>Calculated Duration</span>
                </div>
                <span className="font-black italic text-white">
                  {duration} {bookingType === 'daily' ? (duration === 1 ? 'Day' : 'Days') : (duration === 1 ? 'Hour' : 'Hours')}
                </span>
              </div>
              <div className="h-[1px] bg-white/5 mb-4"></div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Price</p>
                <div className="text-right">
                    <p className="text-3xl font-black italic tracking-tighter text-blue-500">
                        Rp {totalPrice.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 tracking-tighter">Tax & Service Included</p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={duration <= 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 uppercase italic tracking-widest text-xs"
            >
              <CreditCard size={18} />
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}