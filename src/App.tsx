import { useState, useEffect, useMemo } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About'; 
import BentoGrid from './components/BentoGrid';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Contact from './components/Contact';
import FloatingContact from './components/FloatingContact';
import VehicleDetailModal from './components/VehicleDetailModal';
import BookingFormModal from './components/BookingFormModal';
import NearbyLocation from './components/NearbyLocation';
import AdminDashboard from './components/admin/Dashboard';
import VehicleManager from './components/admin/VehicleManager';

// Styles
import './App.css';

// Types
import type { Vehicle, Booking } from './types';

export default function App() {
  // --- 1. State Management ---
  const [user, setUser] = useState<{ 
    name: string; email: string; picture?: string; role: 'User' | 'Admin' 
  } | null>(null);
  const [view, setView] = useState<'home' | 'history' | 'admin'>('home');
  const [filter, setFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminSubView, setAdminSubView] = useState<'stats' | 'fleet'>('stats');
  
  // Modal States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  // --- 2. Data Terintegrasi ---
  const [vehicles] = useState<Vehicle[]>([
    { id: '1', name: 'Toyota Alphard', type: 'Car', price: 2500000, status: 'Available', seats: 7, transmission: 'AT', img: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600' },
    { id: '2', name: 'Porsche 911', type: 'Car', price: 5000000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600' },
    { id: '3', name: 'Vespa Primavera', type: 'Motorcycle', price: 250000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://www.thedrive.com/wp-content/uploads/content/archive-images/vespareview_inline4.jpg?strip=all&quality=85' },
    { id: '4', name: 'Kawasaki ZX25R', type: 'Motorcycle', price: 600000, status: 'On Rent', seats: 2, transmission: 'MT', img: 'https://img.autofun.co.id/file/4a1fba86ab0c4118a6f240b4ba6cb3f7.jpg' },
  ]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // --- 3. Logika Otomatisasi (Expiry Checker) ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      setBookings(prev => prev.map(b => {
        const endTime = new Date(b.endDate).getTime();
        if (b.status === 'Paid' && now > endTime) {
          return { ...b, status: 'Completed' };
        }
        return b;
      }));
    }, 10000);
    return () => clearInterval(timer);
  }, [bookings]);

  // --- 4. Search & Filter Logic ---
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesCategory = filter === 'All' || v.type === filter;
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [vehicles, filter, searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filter]);

  // --- 5. Handlers ---
  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const isAdmin = decoded.email === 'baiqdewi2626@gmail.com'; 
      setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture, role: isAdmin ? 'Admin' : 'User' });
      setIsLoginOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleConfirmBooking = (vehicle: Vehicle, start: string, end: string, total: number) => {
    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      status: 'Pending',
      totalPrice: total,
      startDate: start,
      endDate: end,
    };
    setBookings([newBooking, ...bookings]);
    setIsBookingFormOpen(false);
    setView('history');
  };

  const updateStatus = (id: string, next: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: next } : b));
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-600/30 overflow-x-hidden">
      <Navbar 
        user={user} 
        currentView={view} 
        onLoginClick={() => setIsLoginOpen(true)} 
        onRegisterClick={() => setIsRegisterOpen(true)} 
        onLogout={() => { googleLogout(); setUser(null); setView('home'); }} 
        onViewChange={(v) => { 
          if (v === 'admin' && user?.role !== 'Admin') return; 
          setView(v); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }} 
      />

      <main className="relative">
        {/* --- HOME VIEW --- */}
        {view === 'home' && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <Hero onFilterChange={setFilter} onSearchChange={setSearchQuery} currentFilter={filter} />
            <About />
            <NearbyLocation />
            
            <section id="catalog" className="max-w-7xl mx-auto py-24 px-6">
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">Our Fleet</h2>
                  <p className="text-[10px] text-blue-500 font-bold tracking-[0.5em] uppercase mt-2">Elite Selection</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-14 h-14 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Filtering Engine...</p>
                </div>
              ) : filteredVehicles.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <BentoGrid vehicles={filteredVehicles} onBooking={(v) => { setSelectedVehicle(v); setIsDetailOpen(true); }} />
                </div>
              ) : (
                <div className="text-center py-32 bg-zinc-900/10 rounded-[4rem] border border-dashed border-white/5">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">Unit "{searchQuery}" is currently unavailable</p>
                </div>
              )}
            </section>
            <Contact />
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {view === 'history' && (
          <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="text-4xl font-black italic text-blue-600 uppercase tracking-tighter">My Bookings</h2>
               <div className="h-1 flex-1 bg-blue-600/10 rounded-full"></div>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-24 border border-white/5 rounded-[3rem] bg-zinc-900/20">
                <p className="text-zinc-600 uppercase tracking-[0.3em] text-[11px] font-bold">Booking history is empty</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map(b => (
                  <div key={b.id} className="group bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center transition-all hover:border-blue-500/40 shadow-2xl">
                    <div>
                      <p className="text-[10px] font-mono text-blue-500/50 mb-2">{b.id}</p>
                      <h3 className="font-black text-2xl uppercase tracking-tighter mb-1">{b.vehicleName}</h3>
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Until: <span className="text-zinc-200">{new Date(b.endDate).toLocaleString()}</span></p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-4 mt-6 md:mt-0">
                      <span className={`text-[9px] font-black uppercase px-6 py-2 rounded-full border border-white/10 ${
                        b.status === 'Completed' ? 'text-red-500 bg-red-500/5 animate-pulse' : 
                        b.status === 'Returned' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                        b.status === 'Success' ? 'text-emerald-400 bg-emerald-500/10' :
                        'text-blue-500 bg-blue-500/5'
                      }`}>
                        {b.status === 'Completed' ? 'Time Expired' : b.status}
                      </span>
                      
                      {b.status === 'Approved' && (
                        <button onClick={() => updateStatus(b.id, 'Paid')} className="bg-blue-600 px-8 py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Proceed to Payment</button>
                      )}
                      
                      {/* RETURN BUTTON: Muncul saat waktu habis */}
                      {b.status === 'Completed' && (
                        <button 
                          onClick={() => {
                            if(window.confirm("Confirm that you have returned the vehicle?")) {
                              updateStatus(b.id, 'Returned');
                            }
                          }} 
                          className="bg-white text-black px-8 py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-zinc-200 transition-all italic font-bold"
                        >
                          Return Vehicle
                        </button>
                      )}

                      {b.status === 'Returned' && (
                        <p className="text-[10px] text-zinc-500 italic uppercase tracking-widest">Awaiting Admin Check...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- ADMIN VIEW --- */}
        {view === 'admin' && user?.role === 'Admin' && (
          <div className="pt-40 pb-20 px-6 max-w-6xl mx-auto min-h-screen animate-in fade-in duration-700">
            <div className="flex gap-4 mb-12">
              <button onClick={() => setAdminSubView('stats')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adminSubView === 'stats' ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}>Dashboard Stats</button>
              <button onClick={() => setAdminSubView('fleet')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adminSubView === 'fleet' ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}>Manage Fleet</button>
            </div>

            {adminSubView === 'stats' ? (
              <div className="space-y-12">
                <AdminDashboard />
                <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden">
                   <div className="p-10 border-b border-white/5">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Active Transactions</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                          <tr>
                            <th className="p-10">ID</th>
                            <th>Unit</th>
                            <th>Status</th>
                            <th className="p-10 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {bookings.map(b => (
                            <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-10 font-mono text-xs text-zinc-500">{b.id}</td>
                              <td className="font-black uppercase italic">{b.vehicleName}</td>
                              <td>
                                <span className={`text-[9px] px-4 py-1 rounded-full font-black uppercase ${b.status === 'Returned' ? 'bg-purple-500/20 text-purple-500' : 'text-blue-500'}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-10 text-right">
                                {b.status === 'Pending' && <button onClick={() => updateStatus(b.id, 'Approved')} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase">Verify</button>}
                                {b.status === 'Returned' && <button onClick={() => updateStatus(b.id, 'Success')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Confirm Receipt</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            ) : <VehicleManager />}
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-white/5 text-center bg-zinc-950">
        <h3 className="text-xl font-black italic mb-4">KING RENTAL</h3>
        <p className="text-zinc-600 text-[10px] tracking-[0.8em] uppercase font-bold">© 2026 - The Royal Experience</p>
      </footer>

      {/* Modals & Overlays */}
      <FloatingContact />
      <VehicleDetailModal 
        isOpen={isDetailOpen} 
        vehicle={selectedVehicle} 
        onClose={() => setIsDetailOpen(false)} 
        onBooking={(v) => { 
          if(!user) { setIsLoginOpen(true); setIsDetailOpen(false); }
          else { setSelectedVehicle(v); setIsDetailOpen(false); setIsBookingFormOpen(true); } 
        }} 
      />
      <BookingFormModal isOpen={isBookingFormOpen} vehicle={selectedVehicle} onClose={() => setIsBookingFormOpen(false)} onConfirm={handleConfirmBooking} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleGoogleSuccess} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} />
    </div>
  );
}