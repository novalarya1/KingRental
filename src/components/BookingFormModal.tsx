import React, { useState, useEffect, useMemo } from 'react';
import { X, Timer, CreditCard, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { Vehicle } from '../types';

// Interface flexible untuk menangani berbagai format dari backend
interface BookingData {
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status?: string;
  payment_status?: string;
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
  
  // State Kalender
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State Hourly
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DEBUGGING: Cek data saat modal dibuka ---
  useEffect(() => {
    if (isOpen && vehicle) {
      const bookings = (vehicle as any).bookings || (vehicle as any).reservations;
      console.log("=== DEBUG MODAL ===");
      console.log("Vehicle Name:", vehicle.name);
      console.log("Raw Bookings Data:", bookings);
      if (!bookings || bookings.length === 0) {
        console.warn("PERINGATAN: Data booking kosong/tidak ada.");
      }
    }
  }, [isOpen, vehicle]);

  // --- 1. LOGIC PENENTUAN STATUS (ROBUST VERSION) ---
  const getDayStatus = (day: number, dateObj: Date) => {
    if (!vehicle) return 'available';

    // 1. Format tanggal kalender saat ini (YYYY-MM-DD)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const checkDate = `${year}-${month}-${dayStr}`;

    // 2. Cek Masa Lalu
    const today = new Date().toISOString().split('T')[0];
    if (checkDate < today) return 'past';

    // 3. Ambil data booking (Support berbagai nama property)
    const bookings: BookingData[] = (vehicle as any).bookings || (vehicle as any).reservations || [];

    for (const booking of bookings) {
      // A. SUPPORT BERBAGAI FORMAT NAMA VARIABLE
      const rawStart = booking.start_date || booking.startDate; 
      const rawEnd = booking.end_date || booking.endDate;
      const rawStatus = booking.status || booking.payment_status || 'pending';

      if (!rawStart || !rawEnd) continue;

      // B. BERSIHKAN JAM (Ambil YYYY-MM-DD saja)
      // Regex split(/[ T]/) memisahkan spasi atau huruf T (ISO format)
      const start = String(rawStart).split(/[ T]/)[0]; 
      const end = String(rawEnd).split(/[ T]/)[0];

      // C. LOGIC PENGECEKAN RANGE
      if (checkDate >= start && checkDate <= end) {
        const s = String(rawStatus).toLowerCase();
        
        // Status Hijau (Fix/Paid)
        if (['paid', 'on_rent', 'active', 'approved', 'finished', 'confirmed', 'settlement'].includes(s)) {
          return 'active'; 
        }
        // Status Kuning (Pending)
        if (['pending', 'waiting_payment', 'unpaid', 'challenge'].includes(s)) {
          return 'pending'; 
        }
      }
    }
    return 'available';
  };

  const handleDateClick = (day: number) => {
    const status = getDayStatus(day, currentMonth);

    // Block Active & Past
    if (status === 'active' || status === 'past') return;

    // Opsional: Block Pending jika tidak ingin double book
    if (status === 'pending') {
       alert("Tanggal ini menunggu pembayaran. Silakan pilih tanggal lain.");
       return;
    }

    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedStr = `${year}-${month}-${dayStr}`;

    if (bookingType === 'daily') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(selectedStr);
        setEndDate('');
      } else if (startDate && !endDate) {
        if (selectedStr < startDate) {
           setStartDate(selectedStr); 
        } else {
           setEndDate(selectedStr);
        }
      }
    } else {
      setStartDate(selectedStr);
      setEndDate(selectedStr);
    }
  };

  // Generate Array Hari Kalender
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Minggu
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() + offset));
    setCurrentMonth(new Date(newDate));
  };

  // --- 2. LOGIC HITUNG HARGA ---
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
      
      const finalDays = diffDays < 1 ? 1 : diffDays + 1; 

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const finalStart = bookingType === 'hourly' ? `${startDate} ${startTime}:00` : `${startDate} 00:00:00`;
      const finalEnd = bookingType === 'hourly' ? `${startDate} ${endTime}:00` : `${endDate} 23:59:59`;
      
      await onConfirm({
        vehicleId: vehicle?.id || 0, 
        startDate: finalStart,
        endDate: finalEnd,
        totalPrice: totalPrice
      });

    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Processing...</h3>
          </div>
        )}

        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
           <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Reservation</h2>
              <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mt-1">
                {vehicle.name}
              </p>
           </div>
           <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all">
              <X size={20} />
           </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* TABS */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            {(['daily', 'hourly'] as const).map((type) => (
              <button 
                key={type}
                onClick={() => { setBookingType(type); setStartDate(''); setEndDate(''); }}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingType === type ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- CALENDAR SECTION --- */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
               
               {/* Navigasi Bulan */}
               <div className="flex justify-between items-center mb-6">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 text-zinc-400"><ChevronLeft size={18} /></button>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 text-zinc-400"><ChevronRight size={18} /></button>
               </div>

               {/* LEGEND WARNA */}
               <div className="flex gap-4 justify-center mb-6 text-[9px] font-bold uppercase tracking-wider bg-black/40 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-zinc-700 border border-white/10"></span> Avail
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <span className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500"></span> Pending
                  </div>
                  <div className="flex items-center gap-2 text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500"></span> Active
                  </div>
               </div>

               {/* Grid Kalender */}
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

                   // Logic Highlight Pilihan User
                   const isSelected = dateStr === startDate || dateStr === endDate;
                   const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
                   
                   // --- STYLING LOGIC ---
                   // Default: Putih Transparan
                   let finalClass = "bg-white/5 text-zinc-300 hover:bg-white/20 hover:text-white"; 

                   if (status === 'past') {
                      finalClass = "bg-transparent text-zinc-800 cursor-not-allowed"; 
                   } else if (status === 'active') {
                      finalClass = "bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed font-bold"; 
                   } else if (status === 'pending') {
                      finalClass = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 font-bold";
                   }
                   
                   // Override jika dipilih user (Kecuali jika tanggal itu sudah active/booked)
                   if (isSelected && status !== 'active') {
                      finalClass = "bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-110 z-10 border-none font-black";
                   } else if (isInRange && status !== 'active') {
                      finalClass = "bg-blue-600/10 text-blue-400 border border-blue-500/30";
                   }

                   return (
                     <button
                       key={idx}
                       type="button"
                       onClick={() => handleDateClick(day)}
                       disabled={status === 'active' || status === 'past'}
                       className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs transition-all duration-200 ${finalClass}`}
                     >
                       {day}
                     </button>
                   );
                 })}
               </div>

               <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-500 italic">
                  <Info size={12} /> Click start & end dates
               </div>
            </div>

            {/* Time Selector (Hourly Only) */}
            {bookingType === 'hourly' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-black ml-2 tracking-widest">Start</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-black ml-2 tracking-widest">End</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            )}

            {/* Summary & Submit */}
            <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900/50 border border-blue-500/20 p-5 rounded-3xl">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Timer size={12} className="text-blue-500"/> Duration
                 </span>
                 <span className="text-white font-black text-sm italic">{duration} {bookingType === 'daily' ? 'Days' : 'Hours'}</span>
               </div>
               <div className="h-px bg-white/5 mb-4" />
               <div className="flex justify-between items-end">
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Bill</span>
                 <span className="text-3xl font-black italic text-blue-500 tracking-tighter">
                   Rp {totalPrice.toLocaleString('id-ID')}
                 </span>
               </div>
            </div>

            <button 
              type="submit"
              disabled={duration <= 0 || isProcessing || !startDate}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase italic tracking-[0.2em] text-xs shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <CreditCard size={16} className={isProcessing ? "animate-bounce" : ""} />
              {isProcessing ? 'Processing...' : duration <= 0 ? 'Select Dates' : 'Confirm Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}