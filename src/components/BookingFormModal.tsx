import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar as CalendarIcon, CreditCard, Timer, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { Vehicle } from '../types';

// Tambahkan definisi tipe untuk Booking di dalam Vehicle jika belum ada di types.ts
interface Booking {
  start_date: string;
  end_date: string;
  status: string;
}

interface ExtendedVehicle extends Vehicle {
  bookings?: Booking[]; // Asumsi vehicle punya relasi bookings
}

interface BookingFormProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onConfirm: (bookingData: { 
    vehicleId: number | string;
    startDate: string;
    endDate: string;
    totalPrice: number 
  }) => void;
}

export default function BookingFormModal({ isOpen, vehicle, onClose, onConfirm }: BookingFormProps) {
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily');
  
  // State untuk Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. LOGIC KALENDER & STATUS ---
  const getDayStatus = (day: number, dateObj: Date) => {
    if (!vehicle) return 'available';
    
    // Format tanggal saat ini ke YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    const bookings = (vehicle as ExtendedVehicle).bookings || [];

    for (const booking of bookings) {
      // Potong waktu, ambil tanggal saja (YYYY-MM-DD)
      const start = booking.start_date.split(' ')[0];
      const end = booking.end_date.split(' ')[0];

      if (dateString >= start && dateString <= end) {
        // Cek Status
        if (['paid', 'on_rent', 'active', 'approved', 'finished'].includes(booking.status.toLowerCase())) {
          return 'active'; // Hijau
        }
        if (booking.status.toLowerCase() === 'pending') {
          return 'pending'; // Kuning
        }
      }
    }
    return 'available'; // Putih
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedStr = `${year}-${month}-${dayStr}`;

    // Cek apakah tanggal sudah lewat hari ini
    const today = new Date().toISOString().split('T')[0];
    if (selectedStr < today) return;

    // Cek apakah tanggal statusnya booked (Active)
    const status = getDayStatus(day, currentMonth);
    if (status === 'active') {
       alert("Tanggal ini sudah dipesan (Active). Silakan pilih tanggal lain.");
       return;
    }

    if (bookingType === 'daily') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(selectedStr);
        setEndDate('');
      } else if (startDate && !endDate) {
        if (selectedStr < startDate) {
          setStartDate(selectedStr); // Reset jika pilih tanggal sebelum start
        } else {
          setEndDate(selectedStr);
        }
      }
    } else {
      // Hourly hanya butuh 1 tanggal
      setStartDate(selectedStr);
      setEndDate(selectedStr);
    }
  };

  // Generate Hari untuk Kalender UI
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const days = [];
    // Spacer untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    // Tanggal 1 sampai akhir
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() + offset));
    setCurrentMonth(new Date(newDate));
  };

  // --- 2. PRICE CALCULATION ---
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
      
      const activeDays = diffDays > 0 ? diffDays : 0; // Minimal 0, tapi logika bisnis biasanya min 1
      // Fix: Jika tanggal sama (sehari), hitung 1 hari
      const finalDays = activeDays === 0 ? 1 : activeDays + 1; 

      setDuration(finalDays);
      setTotalPrice(finalDays * basePrice);
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
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[120] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Securing Your Ride</h3>
          </div>
        )}

        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
           <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Reservation</h2>
              <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mt-1">
                {vehicle.name}
              </p>
           </div>
           <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
              <X size={20} />
           </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* TABS */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            {(['daily', 'hourly'] as const).map((type) => (
              <button 
                key={type}
                type="button"
                onClick={() => { setBookingType(type); setStartDate(''); setEndDate(''); }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === type ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- CUSTOM CALENDAR --- */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
               <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:text-blue-500 text-zinc-400"><ChevronLeft size={16} /></button>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:text-blue-500 text-zinc-400"><ChevronRight size={16} /></button>
               </div>

               {/* Legend */}
               <div className="flex gap-3 justify-center mb-4 text-[9px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/10 border border-white/20"></span> Avail</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500"></span> Pending</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500"></span> Active</div>
               </div>

               <div className="grid grid-cols-7 gap-1 text-center mb-2">
                 {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                   <span key={d} className="text-[10px] text-zinc-600 font-black">{d}</span>
                 ))}
               </div>

               <div className="grid grid-cols-7 gap-2">
                 {calendarDays.map((day, idx) => {
                   if (!day) return <div key={idx} />;

                   const status = getDayStatus(day, currentMonth);
                   const year = currentMonth.getFullYear();
                   const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                   const dayStr = String(day).padStart(2, '0');
                   const dateStr = `${year}-${month}-${dayStr}`;

                   // Logic Selection Style
                   const isSelected = dateStr === startDate || dateStr === endDate;
                   const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
                   
                   let bgClass = "bg-white/5 text-white hover:bg-white/20"; // Default Available (Putih)
                   
                   if (status === 'active') {
                      bgClass = "bg-green-500/20 text-green-500 border border-green-500/30 cursor-not-allowed opacity-50"; // Active (Hijau)
                   } else if (status === 'pending') {
                      bgClass = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30"; // Pending (Kuning)
                   }
                   
                   // Override jika dipilih user
                   if (isSelected) bgClass = "bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-110 z-10";
                   else if (isInRange) bgClass = "bg-blue-600/30 text-blue-200";

                   return (
                     <button
                       key={idx}
                       type="button"
                       onClick={() => handleDateClick(day)}
                       disabled={status === 'active'}
                       className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${bgClass}`}
                     >
                       {day}
                     </button>
                   );
                 })}
               </div>
               
               <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500 italic">
                  <Info size={12} /> Click dates to select range
               </div>
            </div>

            {/* Time Selector (Only for Hourly) */}
            {bookingType === 'hourly' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-black ml-2 tracking-widest">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-black ml-2 tracking-widest">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500" />
                </div>
              </div>
            )}

            {/* Summary Box */}
            <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Timer size={12} className="text-blue-500"/> Duration
                 </span>
                 <span className="text-white font-black text-sm italic">{duration} {bookingType === 'daily' ? 'Days' : 'Hours'}</span>
               </div>
               <div className="h-px bg-white/5 mb-2" />
               <div className="flex justify-between items-end">
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total</span>
                 <span className="text-2xl font-black italic text-blue-500 tracking-tighter">
                   Rp {totalPrice.toLocaleString('id-ID')}
                 </span>
               </div>
            </div>

            <button 
              type="submit"
              disabled={duration <= 0 || isProcessing || !startDate}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase italic tracking-[0.2em] text-xs shadow-lg active:scale-95"
            >
              <CreditCard size={16} className={isProcessing ? "animate-bounce" : ""} />
              {isProcessing ? 'Processing...' : duration <= 0 ? 'Select Dates' : 'Confirm & Pay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}