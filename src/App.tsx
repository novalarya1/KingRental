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
import VehicleDetailModal from './components/VehicleDetailModal'; // Import Komponen Baru

// Styles
import './App.css';

// --- Types ---
type Vehicle = {
  id: string;
  name: string;
  type: 'Mobil' | 'Motor';
  price: number;
  status: 'Available' | 'Booked';
  img: string;
  seats: number;
  transmission: string;
};

type Booking = {
  id: string;
  vehicleName: string;
  price: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'On Rent' | 'Finished';
};

export default function App() {
  // --- 1. Authentication State ---
  const [user, setUser] = useState<{ 
    name: string; 
    email: string; 
    picture?: string; 
    role: 'User' | 'Admin' 
  } | null>(null);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // --- 2. Navigation & UI State ---
  const [view, setView] = useState<'home' | 'history' | 'admin'>('home');
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW STATE FOR DETAIL ---
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- 3. Mock Data ---
  const [vehicles] = useState<Vehicle[]>([
    { id: '1', name: 'Toyota Alphard', type: 'Mobil', price: 2500000, status: 'Available', seats: 7, transmission: 'AT', img: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600' },
    { id: '2', name: 'Porsche 911', type: 'Mobil', price: 5000000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600' },
    { id: '3', name: 'Vespa Primavera', type: 'Motor', price: 250000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://images.unsplash.com/photo-1591123109285-125038b47361?q=80&w=600' },
    { id: '4', name: 'Kawasaki ZX25R', type: 'Motor', price: 600000, status: 'Booked', seats: 2, transmission: 'MT', img: 'https://images.unsplash.com/photo-1635073910831-2463b158093d?q=80&w=600' },
  ]);
  
  const [bookings, setBookings] = useState<Booking[]>([]);

  // --- 4. Logic Search & Filter (Optimized) ---
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesCategory = filter === 'Semua' || v.type === filter;
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [vehicles, filter, searchQuery]);

  // Loading effect for smooth transition
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filter]);

  // --- 5. Auth Handlers ---
  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const isAdmin = decoded.email === 'baiqdewi2626@gmail.com'; 
      
      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        role: isAdmin ? 'Admin' : 'User'
      });
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
    } catch (error) {
      console.error("Gagal decode token:", error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 6. Booking Handlers ---
  const handleBooking = (vehicle: Vehicle) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleName: vehicle.name,
      price: vehicle.price,
      status: 'Pending'
    };
    setBookings([newBooking, ...bookings]);
    setView('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = (id: string, nextStatus: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
  };

  // --- HANDLER FOR DETAIL ---
  const handleOpenDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailOpen(true);
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <Navbar 
        user={user} 
        currentView={view}
        onLoginClick={() => setIsLoginOpen(true)} 
        onRegisterClick={() => setIsRegisterOpen(true)}
        onLogout={handleLogout} 
        onViewChange={(v) => {
          if (v === 'admin' && user?.role !== 'Admin') return;
          if (v === 'history' && !user) {
            setIsLoginOpen(true);
            return;
          }
          setView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <main className="relative">
        {/* --- HOME VIEW --- */}
        {view === 'home' && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <Hero 
              onFilterChange={setFilter} 
              onSearchChange={setSearchQuery} 
              currentFilter={filter} 
            />
            
            <About />
            
            <section id="catalog" className="max-w-7xl mx-auto py-24 px-6">
              <div className="flex items-center gap-6 mb-16">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-center bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    Our Fleet
                  </h2>
                  <p className="text-[10px] text-blue-500 font-bold tracking-[0.5em] uppercase mt-2">Elite Selection</p>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-14 h-14 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Filtering Engine...</p>
                </div>
              ) : filteredVehicles.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <BentoGrid 
                    vehicles={filteredVehicles} 
                    onBooking={handleOpenDetail} // Sekarang klik unit membuka detail
                  />
                </div>
              ) : (
                <div className="text-center py-32 bg-zinc-900/10 rounded-[4rem] border border-dashed border-white/5 backdrop-blur-sm">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm italic">
                    Unit "{searchQuery}" tidak tersedia saat ini
                  </p>
                </div>
              )}
            </section>

            <Contact />
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {view === 'history' && user && (
          <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="text-4xl font-black italic text-blue-600 uppercase tracking-tighter">My Bookings</h2>
               <div className="h-1 flex-1 bg-blue-600/10 rounded-full"></div>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-24 border border-white/5 rounded-[3rem] bg-zinc-900/20 backdrop-blur-sm">
                <p className="text-zinc-600 uppercase tracking-[0.3em] text-[11px] font-bold">Riwayat pesanan kosong</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map(b => (
                  <div key={b.id} className="group bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center transition-all hover:border-blue-500/40 hover:bg-zinc-900/60 shadow-2xl">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                      <p className="text-[10px] font-mono text-blue-500/50 mb-2 tracking-widest">{b.id}</p>
                      <h3 className="font-black text-2xl leading-tight mb-1 uppercase tracking-tighter">{b.vehicleName}</h3>
                      <p className="text-zinc-400 font-medium">Total: <span className="text-white italic">Rp {b.price.toLocaleString()}</span></p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-4">
                      <span className={`text-[10px] font-black uppercase px-6 py-2 rounded-full border border-white/10 ${
                        b.status === 'Pending' ? 'text-amber-500 bg-amber-500/5' : 'text-emerald-500 bg-emerald-500/5'
                      }`}>
                        {b.status}
                      </span>
                      {b.status === 'Approved' && (
                        <button 
                          onClick={() => updateStatus(b.id, 'Paid')} 
                          className="bg-blue-600 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-600/20"
                        >
                          Lanjutkan Pembayaran
                        </button>
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
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-blue-500 to-white bg-clip-text text-transparent">Admin Center</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Authorized Access Only</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                    <tr>
                      <th className="p-10">Transaction</th>
                      <th>Unit Name</th>
                      <th>Current Status</th>
                      <th className="p-10 text-right">Operational Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm border-t border-white/5">
                    {bookings.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-zinc-600 italic uppercase text-[10px] tracking-widest">No transactions found in system</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                        <td className="p-10 font-mono text-xs text-blue-500/50">{b.id}</td>
                        <td className="font-black uppercase italic tracking-tight text-lg">{b.vehicleName}</td>
                        <td>
                          <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase ${
                            b.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-10 text-right">
                          <div className="flex justify-end gap-3">
                            {b.status === 'Pending' && (
                              <button onClick={() => updateStatus(b.id, 'Approved')} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Verify Order</button>
                            )}
                            {b.status === 'Paid' && (
                              <button onClick={() => updateStatus(b.id, 'On Rent')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all">Handover Key</button>
                            )}
                            {b.status === 'On Rent' && (
                              <button onClick={() => updateStatus(b.id, 'Finished')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">Mark Finished</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- UTILITIES --- */}
      <FloatingContact />

      {/* --- MODALS --- */}
      <VehicleDetailModal 
        isOpen={isDetailOpen}
        vehicle={selectedVehicle}
        onClose={() => setIsDetailOpen(false)}
        onBooking={handleBooking}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleGoogleSuccess}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onError={() => alert("Authentication Failed.")}
      />

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* FOOTER */}
      <footer className="py-24 border-t border-white/5 text-center bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-xl font-black italic mb-4">KING RENTAL</h3>
            <p className="text-zinc-600 text-[10px] tracking-[0.8em] uppercase font-bold">
              © 2026 - The Royal Experience in Mobility
            </p>
        </div>
      </footer>
    </div>
  );
}