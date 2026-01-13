import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Users, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Search,
  ChevronLeft
} from 'lucide-react';

// --- StatCard Component tetap sama ---
interface StatCardProps {
  title: string; value: string; icon: React.ReactNode; trend: string; color: string;
}
const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => (
  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>{icon}</div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <h3 className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-black text-white italic">{value}</p>
  </div>
);

export default function AdminDashboard() {
  // 1. State untuk mengontrol tampilan (Overview vs All Transactions)
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Data yang lebih lengkap
  const [allBookings] = useState([
    { id: 'BK-001', user: 'Alex Johnson', unit: 'Porsche 911', status: 'Active', price: 'Rp 5.500.000', date: '2026-01-12' },
    { id: 'BK-002', user: 'Sarah Miller', unit: 'Vespa Primavera', status: 'Completed', price: 'Rp 350.000', date: '2026-01-11' },
    { id: 'BK-003', user: 'Mike Chen', unit: 'BMW M4', status: 'Pending', price: 'Rp 4.200.000', date: '2026-01-11' },
    { id: 'BK-004', user: 'Julia Wong', unit: 'Toyota Alphard', status: 'Active', price: 'Rp 2.500.000', date: '2026-01-10' },
    { id: 'BK-005', user: 'Randi G.', unit: 'Kawasaki ZX25R', status: 'Completed', price: 'Rp 600.000', date: '2026-01-09' },
  ]);

  // --- TAMBAHAN KODE: State untuk Review ---
  const [reviews] = useState([
    { id: 1, rating: 5 },
    { id: 2, rating: 5 },
    { id: 3, rating: 4 },
  ]);

  // --- TAMBAHAN KODE: Logika Hitung Happy Clients ---
  // Menghitung transaksi 'Completed' + data review yang masuk
  const dynamicHappyClients = useMemo(() => {
    const completedTransactions = allBookings.filter(b => b.status === 'Completed').length;
    const totalReviews = reviews.length;
    // Base 1200 adalah angka awal (seperti data statis Anda sebelumnya) ditambah data real
    return 1200 + completedTransactions + totalReviews;
  }, [allBookings, reviews]);

  // 3. Logic Filter Search
  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => 
      b.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allBookings]);

  // 4. Data yang ditampilkan (limit 3 jika di overview, semua jika di View All)
  const displayedBookings = showAll ? filteredBookings : allBookings.slice(0, 3);

  const handleDownloadReport = () => {
    const headers = ["Order ID,Customer,Vehicle Unit,Status,Amount,Date"];
    const rows = allBookings.map(b => `${b.id},${b.user},${b.unit},${b.status},"${b.price.replace(/[Rp\s.]/g, '')}",${b.date}`);
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KING-REPORT-FULL.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-black p-8 pt-24 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {showAll && (
              <button 
                onClick={() => setShowAll(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div>
              <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                {showAll ? 'All Transactions' : 'Admin Console'}
              </h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-blue-600 pl-3">
                {showAll ? `${filteredBookings.length} Records Found` : 'Fleet & Revenue Overview'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             {showAll && (
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                 <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
                 />
               </div>
             )}
             <button onClick={handleDownloadReport} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all italic flex items-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95">
               <Download size={16} />
               Download
             </button>
          </div>
        </div>

        {/* Stats Grid - Hanya tampil di Overview */}
        {!showAll && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
            <StatCard title="Total Revenue" value="Rp 124.5M" icon={<Wallet className="text-blue-500" size={20} />} trend="+12%" color="bg-blue-500" />
            <StatCard title="Active Rentals" value="18 Units" icon={<Clock className="text-purple-500" size={20} />} trend="+5" color="bg-purple-500" />
            <StatCard title="Total Vehicles" value="42 Units" icon={<Car className="text-emerald-500" size={20} />} trend="Stable" color="bg-emerald-500" />
            
            {/* BAGIAN YANG DIGANTI: Menggunakan data dinamis */}
            <StatCard 
              title="Happy Clients" 
              value={`${dynamicHappyClients}+`} 
              icon={<Users className="text-amber-500" size={20} />} 
              trend={`+${allBookings.filter(b => b.status === 'Completed').length} new`} 
              color="bg-amber-500" 
            />
          </div>
        )}

        {/* Main Table Content */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-500">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
            <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
              {showAll ? 'Transaction Database' : 'Recent Reservations'}
            </h3>
            {!showAll && <TrendingUp className="text-blue-500" size={20} />}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 bg-zinc-900/40">
                  <th className="px-8 py-6">Order ID</th>
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Vehicle Unit</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {displayedBookings.length > 0 ? (
                  displayedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-white/5 hover:bg-blue-500/5 transition-all group">
                      <td className="px-8 py-6 font-mono text-blue-500 font-bold">{booking.id}</td>
                      <td className="px-8 py-6">
                        <span className="text-zinc-300 font-bold block">{booking.user}</span>
                        <span className="text-[10px] text-zinc-600 uppercase font-black tracking-tighter">{booking.date}</span>
                      </td>
                      <td className="px-8 py-6 text-white font-black italic uppercase">{booking.unit}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          booking.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Active' ? 'bg-blue-400 animate-pulse' : booking.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-white font-black">{booking.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">No matching transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Logic */}
          {!showAll && (
            <div className="p-6 bg-zinc-900/40 border-t border-white/5 text-center">
              <button 
                onClick={() => setShowAll(true)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-blue-500 transition-all hover:gap-4 flex items-center justify-center w-full gap-2 group"
              >
                View All Transactions <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}