import React, { useState, useMemo, isValidElement, cloneElement } from 'react';
import { 
  Car, Users, Wallet, Clock, 
  Download, Search, ChevronLeft, MapPin,
  BarChart3, Calendar, ArrowUpRight, Inbox, ChevronDown
} from 'lucide-react';
import type { Vehicle } from '../../types'; 

// --- Interfaces ---
export interface BookingRecord {
  id: string | number;
  user: string;
  unit: string;
  status: string;
  price: string | number;
  date: string;
  branch: string;
}

interface StatCardProps {
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: string; 
  color: string;
}

interface DashboardProps {
  role?: string;
  bookings: BookingRecord[];
  vehicles: Vehicle[]; 
  isLoading?: boolean;
  onExport?: () => void;
  onUpdateStatus?: (id: string | number, newStatus: string) => void;
}

// --- Sub-Component: StatCard ---
const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => (
  <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group shadow-xl relative overflow-hidden">
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-white">
        {icon}
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
        {isValidElement(icon) 
          ? cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 }) 
          : icon}
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
        <ArrowUpRight size={10} /> {trend}
      </span>
    </div>
    <h3 className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">
      {title}
    </h3>
    <p className="text-2xl font-black text-white italic relative z-10">
      {value}
    </p>
  </div>
);

export default function Dashboard({ 
  role = 'Staff', 
  bookings = [], 
  vehicles = [], 
  isLoading = false,
  onExport,
  onUpdateStatus
}: DashboardProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayRole = (role || 'Staff').replace(/_/g, ' ');
  const statusOptions = ['Pending', 'Active', 'Completed', 'Cancelled'];

  // Helper Parsing Harga
  const parsePrice = (price: string | number | null | undefined): number => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  };

  // Kalkulasi Statistik
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((acc, curr) => acc + parsePrice(curr.price), 0);
    const activeRentals = bookings.filter(b => {
      const s = b.status?.toLowerCase() || '';
      return s.includes('active') || s.includes('rent');
    }).length;
    
    const totalFleetUnits = Array.isArray(vehicles) ? vehicles.length : 0;
    const readyUnits = Math.max(0, totalFleetUnits - activeRentals);
    const uniqueCustomers = new Set(bookings.map(b => b.user)).size;

    return {
      revenue: totalRevenue >= 1000000 
        ? `Rp ${(totalRevenue / 1000000).toFixed(1)}M` 
        : `Rp ${(totalRevenue).toLocaleString('id-ID')}`,
      active: activeRentals,
      fleet: totalFleetUnits,
      ready: readyUnits,
      customers: uniqueCustomers
    };
  }, [bookings, vehicles]);

  // Filter Tabel
  const filteredBookings = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return bookings;

    return bookings.filter(b => 
      (b.user?.toLowerCase() || '').includes(query) || 
      (b.unit?.toLowerCase() || '').includes(query) ||
      (b.id?.toString() || '').toLowerCase().includes(query)
    );
  }, [searchQuery, bookings]);

  const displayedBookings = showAll ? filteredBookings : filteredBookings.slice(0, 5);

  return (
    <div className="animate-in fade-in duration-700 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {showAll && (
              <button 
                onClick={() => setShowAll(false)} 
                className="p-3 bg-zinc-900 border border-white/10 hover:bg-blue-600 rounded-full text-white transition-all active:scale-90 shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                {showAll ? 'Transaction DB' : 'Admin Insights'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  Security Level: <span className="text-blue-500">{displayRole}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group flex-1 md:flex-none">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={14} />
               <input 
                type="text"
                placeholder="Reference ID or Client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-6 text-[11px] font-bold uppercase tracking-widest text-white focus:border-blue-500 focus:bg-zinc-900 outline-none w-full md:w-72 transition-all backdrop-blur-md"
               />
             </div>
             <button 
              onClick={onExport}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95"
             >
                <Download size={14} /> Export
             </button>
          </div>
        </div>

        {!showAll && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={stats.revenue} icon={<Wallet />} trend="+12.5%" color="bg-blue-500" />
              <StatCard title="Active Rentals" value={`${stats.active} Units`} icon={<Clock />} trend="Real-time" color="bg-purple-500" />
              <StatCard title="Fleet Assets" value={`${stats.fleet} Units`} icon={<Car />} trend={`${stats.ready} Ready`} color="bg-emerald-500" />
              <StatCard title="Loyal Clients" value={stats.customers.toString()} icon={<Users />} trend="Verified" color="bg-amber-500" />
            </div>

            {/* ANALYTICS PLACEHOLDER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 min-h-[320px] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                        <BarChart3 size={32} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mb-2">Performance Neural Link</p>
                    <h4 className="text-white/30 text-xs font-bold uppercase tracking-widest">Waiting for data stream...</h4>
                  </div>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-[11px] font-black italic text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Calendar size={16} className="text-blue-500" /> Operational Status
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">System Integrity</span>
                          <span className="text-[10px] text-emerald-500 font-bold">OPTIMAL</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden p-[1px]">
                          <div className="bg-emerald-500 w-full h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[9px] text-zinc-600 font-medium leading-relaxed uppercase tracking-tighter">AES-256 Encrypted Stream</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
            <div className="flex items-center gap-4">
               <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">
                {showAll ? 'Global Archive' : 'Recent Flux'}
              </h3>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-zinc-500 font-black uppercase tracking-widest">{filteredBookings.length} Records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                  <th className="px-10 py-6">Ref. ID</th>
                  <th className="px-10 py-6">Client Profile</th>
                  <th className="px-10 py-6">Machine Unit</th>
                  <th className="px-10 py-6">Allocation & Status</th>
                  <th className="px-10 py-6 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : displayedBookings.length > 0 ? (
                  displayedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-white/5 hover:bg-blue-600/[0.03] transition-colors group">
                      <td className="px-10 py-6">
                        <span className="font-mono text-blue-500 font-black group-hover:tracking-widest transition-all">
                          #{booking.id}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-bold uppercase text-xs">{booking.user}</span>
                          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter mt-1 italic">{booking.date}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-white font-black italic uppercase text-xs tracking-tighter">
                          {booking.unit}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center gap-1.5 text-zinc-500">
                             <MapPin size={10} className="text-blue-500" />
                             <span className="text-[10px] font-bold uppercase tracking-tighter">{booking.branch}</span>
                           </div>
                           
                           {/* STATUS SELECTOR */}
                           <div className="relative w-fit group/select">
                             <select 
                               value={booking.status}
                               onChange={(e) => onUpdateStatus?.(booking.id, e.target.value)}
                               className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all outline-none
                                 ${(booking.status?.toLowerCase() || '').includes('active') 
                                   ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' 
                                   : (booking.status?.toLowerCase() || '').includes('completed')
                                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                   : (booking.status?.toLowerCase() || '').includes('cancelled')
                                   ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                   : 'bg-zinc-800 text-zinc-400 border-white/5 hover:border-white/20'
                                 }`}
                             >
                               {statusOptions.map(opt => (
                                 <option key={opt} value={opt} className="bg-zinc-950 text-white">{opt}</option>
                               ))}
                             </select>
                             <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50 group-hover/select:opacity-100 transition-opacity" />
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-white font-black italic tracking-tighter text-base group-hover:text-blue-400 transition-colors">
                          {typeof booking.price === 'number' ? `Rp ${booking.price.toLocaleString('id-ID')}` : booking.price}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Inbox size={48} className="mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">No Data Transmission Found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!showAll && filteredBookings.length > 5 && (
            <div className="p-8 text-center border-t border-white/5 bg-zinc-900/20">
              <button 
                onClick={() => {
                   setShowAll(true);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-blue-500 transition-all flex items-center justify-center w-full gap-3 group"
              >
                Access Full Neural Archive <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}