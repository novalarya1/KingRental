import { useState, useEffect, useMemo } from 'react';
import { googleLogout } from '@react-oauth/google';
import api from './api/axios';

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
  const [isLoading, setIsLoading] = useState(true); 
  const [adminSubView, setAdminSubView] = useState<'stats' | 'fleet'>('stats');
  
  // Modal States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  // Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // --- 2. Initial Data Fetching ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        // Check Session
        const userRes = await api.get('/user').catch(() => null);
        if (userRes?.data) {
          setUser({
            name: userRes.data.name,
            email: userRes.data.email,
            role: userRes.data.role || 'User'
          });
        }
        // Fetch Vehicles
        const vehicleRes = await api.get('/vehicles');
        const vehicleData = Array.isArray(vehicleRes.data) ? vehicleRes.data : vehicleRes.data?.data;
        if (vehicleData) setVehicles(vehicleData);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Fetch Bookings when User Logged In
  useEffect(() => {
    if (user) {
      api.get('/bookings').then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setBookings(data);
      }).catch(() => console.log("Guest access or session expired"));
    }
  }, [user]);

  // --- 3. Filter Logic ---
  const filteredVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    return vehicles.filter(v => {
      const matchesCategory = filter === 'All' || v.type === filter;
      const matchesSearch = (v.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [vehicles, filter, searchQuery]);

  // --- 4. Auth Handlers ---
  const handleManualLogin = async (email: string, password: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const response = await api.post('/login', { email, password });
      setUser({ ...response.data.user, role: response.data.user.role || 'User' });
      setIsLoginOpen(false);
    } catch (e: any) { throw e; }
  };

  const handleManualRegister = async (name: string, email: string, password: string, phone: string, address: string) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      const response = await api.post('/register', { 
        name, email, password, password_confirmation: password, phone, address 
      });
      setUser({ ...response.data.user, role: 'User' });
      setIsRegisterOpen(false);
    } catch (e: any) { throw e; }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } finally {
      googleLogout();
      setUser(null);
      setBookings([]);
      setView('home');
    }
  };

  // --- 5. Booking Logic ---
  const handleConfirmBooking = async (vehicle: Vehicle, start: string, end: string, total: number) => {
    try {
      // Data yang dikirim ke Laravel tetap menggunakan snake_case jika API-nya mengharapkannya
      const res = await api.post('/bookings', {
        vehicle_id: vehicle.id,
        start_date: start,
        end_date: end,
        total_price: total
      });
      // Pastikan response dipetakan kembali ke format Booking frontend jika perlu
      setBookings(prev => [res.data, ...prev]);
      setIsBookingFormOpen(false);
      setView('history');
    } catch (e) { alert("Booking failed. Please check your connection."); }
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-600/30 overflow-x-hidden">
      <Navbar 
        user={user} currentView={view} 
        onLoginClick={() => setIsLoginOpen(true)} 
        onRegisterClick={() => setIsRegisterOpen(true)} 
        onLogout={handleLogout} 
        onViewChange={(v) => { 
          if (v === 'admin' && user?.role !== 'Admin') return;
          setView(v); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }} 
      />

      <main className="relative">
        {view === 'home' && (
          <div className="animate-in fade-in duration-700">
            <Hero onFilterChange={setFilter} onSearchChange={setSearchQuery} currentFilter={filter} />
            <About />
            <NearbyLocation />
            
            <section id="catalog" className="max-w-7xl mx-auto py-24 px-6">
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">Our Fleet</h2>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-32">
                  <div className="w-14 h-14 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <BentoGrid vehicles={filteredVehicles} onBooking={(v) => { setSelectedVehicle(v); setIsDetailOpen(true); }} />
              )}
            </section>
            <Contact />
          </div>
        )}

        {view === 'history' && (
          <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
             <h2 className="text-4xl font-black italic text-blue-600 uppercase mb-12 tracking-tighter">My Journey</h2>
             {bookings.length > 0 ? (
               <div className="grid gap-4">
                 {bookings.map((booking) => (
                    <div key={booking.id} className="p-8 bg-zinc-950 rounded-[2.5rem] border border-white/5 hover:border-blue-600/30 transition-all group">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div>
                            <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-2">Booking ID #{booking.id}</p>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">
                              {booking.vehicleName || "Luxury Vehicle"}
                            </h3>
                            <div className="flex gap-4 text-zinc-500 text-xs font-bold uppercase tracking-tighter">
                              <span className="px-3 py-1 bg-white/5 rounded-lg">{booking.startDate}</span>
                              <span className="text-blue-500 opacity-50">—</span>
                              <span className="px-3 py-1 bg-white/5 rounded-lg">{booking.endDate}</span>
                            </div>
                          </div>
                          <div className="md:text-right flex md:flex-col justify-between items-end">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-auto ${
                              booking.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                            }`}>
                              {booking.status}
                            </span>
                            <div>
                               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Total Investment</p>
                               <p className="text-2xl font-black text-white italic tracking-tighter">
                                 Rp {Number(booking.totalPrice).toLocaleString('id-ID')}
                               </p>
                            </div>
                          </div>
                        </div>
                    </div>
                 ))}
               </div>
             ) : (
               <div className="py-32 text-center border border-dashed border-white/10 rounded-[4rem]">
                  <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">No rental records found in our database.</p>
               </div>
             )}
          </div>
        )}

        {view === 'admin' && user?.role === 'Admin' && (
          <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setAdminSubView('stats')} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${adminSubView === 'stats' ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Overview</button>
              <button onClick={() => setAdminSubView('fleet')} className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${adminSubView === 'fleet' ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}>Fleet Manager</button>
            </div>
            {adminSubView === 'stats' ? <AdminDashboard /> : <VehicleManager />}
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-white/5 text-center bg-zinc-950">
        <h3 className="text-xl font-black italic mb-4">KING RENTAL</h3>
        <p className="text-zinc-600 text-[10px] tracking-[0.8em] uppercase font-bold">© 2026 - The Royal Experience</p>
      </footer>

      <FloatingContact />

      {/* Modals */}
      <VehicleDetailModal 
        isOpen={isDetailOpen} vehicle={selectedVehicle} 
        onClose={() => setIsDetailOpen(false)} 
        onBooking={(v) => { 
          if(!user) { setIsLoginOpen(true); setIsDetailOpen(false); } 
          else { setSelectedVehicle(v); setIsDetailOpen(false); setIsBookingFormOpen(true); } 
        }} 
      />

      <BookingFormModal 
        isOpen={isBookingFormOpen} vehicle={selectedVehicle} 
        onClose={() => setIsBookingFormOpen(false)} onConfirm={handleConfirmBooking} 
      />
      
      <LoginModal 
        isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onManualLogin={handleManualLogin}
        onSuccess={() => setIsLoginOpen(false)} onError={() => {}}
        onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} 
      />
      
      <RegisterModal 
        isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onManualRegister={handleManualRegister} 
        onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
      />
    </div>
  );
}