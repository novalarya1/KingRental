import { useState, useEffect, useMemo, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import api from './api/axios';

// Components & UI
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

// Styles & Types
import './App.css';
import type { Vehicle, Booking, Branch, UserRole } from './types';

interface UserState {
  name: string;
  email: string;
  picture?: string;
  role: UserRole;
}

export default function App() {
  // --- State Management ---
  const [user, setUser] = useState<UserState | null>(null);
  
  const [view, setView] = useState<'home' | 'history' | 'admin'>(() => {
    return (localStorage.getItem('king_rental_view') as 'home' | 'history' | 'admin') || 'home';
  });

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

  // --- Helper: Role Checker ---
  const isAdmin = useMemo(() => {
    if (!user?.role) return false;
    const roleStr = String(user.role).toLowerCase();
    return roleStr.includes('admin');
  }, [user]);

  // Sync view to localStorage
  useEffect(() => {
    localStorage.setItem('king_rental_view', view);
  }, [view]);

  // --- 1. Fetch Bookings ---
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    // Fetch hanya jika di view history atau admin
    if (isAdmin || view === 'history') {
      try {
        const res = await api.get('/bookings');
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setBookings(data);
      } catch (err) {
        console.error("Fetch bookings error:", err);
      }
    }
  }, [user, isAdmin, view]);

  // --- 2. Initial Bootstrapping ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Ambil CSRF Cookie
        await api.get('/sanctum/csrf-cookie').catch(() => null);
        
        // Step 2: Cek User Session
        try {
            const userRes = await api.get('/user');
            if (userRes?.data) {
              setUser(userRes.data);
              const role = String(userRes.data.role).toLowerCase();
              if (!role.includes('admin') && view === 'admin') setView('home');
            }
        } catch (err: any) {
            // Jika 401 berarti belum login, abaikan error log
            if (err.response?.status !== 401) console.error("User Check Error:", err);
            if (view === 'admin' || view === 'history') setView('home');
            setUser(null);
        }
        
        // Step 3: Load Fleet Data
        const vehicleRes = await api.get('/vehicles');
        const vehicleData = Array.isArray(vehicleRes.data) ? vehicleRes.data : vehicleRes.data?.data;
        if (vehicleData) setVehicles(vehicleData);

      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // --- 3. Helper: Resolve Branch Name ---
  const resolveBranchName = useCallback((branchData?: string | Branch): string => {
    if (!branchData) return 'Main Branch';
    if (typeof branchData === 'object' && branchData !== null) return branchData.name;
    return String(branchData);
  }, []);

  // --- 4. Data Transformation for Admin ---
  const adminBookingRecords = useMemo(() => {
    return bookings.map(b => ({
      id: b.id,
      user: b.user?.name || b.customer_name || 'Guest',
      unit: b.vehicle?.name || 'Unknown Unit',
      status: b.status || 'pending',
      price: Number(b.total_price) || 0, 
      date: b.start_date || '-',
      branch: resolveBranchName(b.vehicle?.branch || b.branch)
    }));
  }, [bookings, resolveBranchName]);

  // --- 5. Handlers ---

  const handleUpdateBookingStatus = async (id: string | number, newStatus: string) => {
    const originalBookings = [...bookings];
    let statusForBackend = newStatus.toLowerCase();
    if (statusForBackend === 'active') statusForBackend = 'on_rent';

    try {
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b)
      );
      await api.post(`/bookings/${id}`, { 
        _method: 'PUT', 
        status: statusForBackend 
      });
    } catch (error: any) {
      setBookings(originalBookings);
      alert("Gagal memperbarui status.");
      fetchBookings(); 
    }
  };

  const handleManualLogin = async (email: string, password: string) => {
    try {
        // Menggunakan instance api (axios) yang sudah dikonfigurasi
        const response = await api.post('/login', { email, password });
        
        // SINKRONISASI: Backend mengirim 'access_token', Frontend menyimpan sebagai 'token'
        if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state user di App.tsx
        setUser(response.data.user);

        // PERBAIKAN DI SINI:
        // Ganti setIsLoginModalOpen(false) menjadi setIsLoginOpen(false)
        setIsLoginOpen(false); 
        
        // Memuat ulang data booking setelah login berhasil
        fetchBookings();
        }
    } catch (error) {
        // Error ini akan ditangkap oleh LoginModal.tsx untuk ditampilkan ke user
        throw error; 
    }
  };

  const handleManualRegister = async (data: any) => {
    try {
      await api.get('/sanctum/csrf-cookie');
      await api.post('/register', data);
      // Auto login setelah register jika API Laravel mendukung, 
      // atau arahkan ke login modal
      setIsRegisterOpen(false);
      setIsLoginOpen(true);
      alert("Registration successful! Please login.");
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try { 
      await api.post('/logout'); 
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      googleLogout();
      setUser(null);
      setBookings([]);
      setView('home');
      localStorage.removeItem('king_rental_view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmBooking = async (vehicle: Vehicle, start: string, end: string, total: number) => {
    try {
      const bookingRes = await api.post('/bookings', {
        vehicle_id: vehicle.id, 
        start_date: start, 
        end_date: end, 
        total_price: total
      });

      const bookingId = (bookingRes.data.data || bookingRes.data).id;
      const tokenRes = await api.get(`/payments/token/${bookingId}`);
      const snapToken = tokenRes.data.snap_token;

      if (!snapToken) throw new Error("Snap Token tidak ditemukan.");

      return new Promise((resolve, reject) => {
        (window as any).snap.pay(snapToken, {
          onSuccess: (result: any) => {
            setIsBookingFormOpen(false);
            fetchBookings();
            setView('history');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            resolve(result);
          },
          onPending: (result: any) => {
            setIsBookingFormOpen(false);
            fetchBookings();
            setView('history');
            resolve(result);
          },
          onError: (err: any) => {
            alert("Terjadi kesalahan pada pembayaran.");
            reject(err);
          },
          onClose: () => {
            setIsBookingFormOpen(false);
            fetchBookings();
            setView('history');
            resolve(null);
          }
        });
      });

    } catch (e: any) { 
      const errorMsg = e.response?.data?.message || e.message || "Proses booking gagal.";
      alert(errorMsg);
      throw e; 
    }
  };

  const handlePayExistingBooking = async (bookingId: number | string) => {
    try {
      const res = await api.get(`/payments/token/${bookingId}`);
      const snapToken = res.data.snap_token;

      if (snapToken) {
        (window as any).snap.pay(snapToken, {
          onSuccess: () => fetchBookings(),
          onPending: () => fetchBookings(),
          onClose: () => fetchBookings()
        });
      }
    } catch (e: any) {
      alert("Gagal memuat pembayaran.");
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesCategory = filter === 'All' || v.type === filter;
      const matchesSearch = v.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) || false;
      return matchesCategory && matchesSearch;
    });
  }, [vehicles, filter, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-600/30 overflow-x-hidden">
      <Navbar 
        user={user} currentView={view} 
        onLoginClick={() => setIsLoginOpen(true)} 
        onRegisterClick={() => setIsRegisterOpen(true)} 
        onLogout={handleLogout} 
        onViewChange={(v: any) => setView(v)} 
      />

      <main className="relative z-10">
        {view === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <Hero onFilterChange={setFilter} onSearchChange={setSearchQuery} currentFilter={filter} />
            <About />
            <NearbyLocation />
            
            <section id="catalog" className="max-w-7xl mx-auto py-24 px-6">
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">The Fleet</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Warming up engines...</p>
                </div>
              ) : (
                <BentoGrid 
                  vehicles={filteredVehicles} 
                  onBooking={(v) => { setSelectedVehicle(v); setIsDetailOpen(true); }} 
                />
              )}
            </section>
            <Contact />
          </div>
        )}

        {view === 'history' && user && (
          <div className="pt-40 pb-20 px-6 max-w-5xl mx-auto min-h-screen animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-16">My Journey</h2>
            {bookings.length > 0 ? (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="group p-8 bg-zinc-900/30 rounded-[2.5rem] border border-white/5 hover:border-blue-600/40 transition-all backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-4">
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-lg border border-blue-500/20">#{booking.id}</span>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">{booking.vehicle?.name || 'Unit'}</h3>
                        <div className="flex gap-4 text-zinc-500 text-[11px] font-black uppercase">
                          <span>{booking.start_date}</span>
                          <span>→</span>
                          <span>{resolveBranchName(booking.vehicle?.branch || booking.branch)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <p className="text-3xl font-black text-white italic">
                          Rp {(Number(booking.total_price) || 0).toLocaleString('id-ID')}
                        </p>
                        
                        <div className="flex flex-col items-end gap-2">
                            <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full ${
                            ['paid', 'approved', 'on_rent', 'finished'].includes(booking.status) ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {booking.status}
                            </span>

                            {booking.status === 'pending' && (
                                <button 
                                    onClick={() => handlePayExistingBooking(booking.id)}
                                    className="text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Pay Now
                                </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-xs">Your royal garage is empty</p>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="pt-32 pb-20 px-4 md:px-10 w-full max-w-[1600px] mx-auto min-h-screen block animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">KING <span className="text-blue-600">OPS</span></h1>
              <div className="flex p-1 bg-zinc-900 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setAdminSubView('stats')} 
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminSubView === 'stats' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                > Insights </button>
                <button 
                  onClick={() => setAdminSubView('fleet')} 
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminSubView === 'fleet' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                > Fleet </button>
              </div>
            </div>
            
            <div className="transition-all duration-500">
              {adminSubView === 'stats' ? (
                <AdminDashboard 
                  role={user?.role} 
                  bookings={adminBookingRecords} 
                  vehicles={vehicles} 
                  isLoading={isLoading} 
                  onUpdateStatus={handleUpdateBookingStatus}
                />
              ) : (
                <VehicleManager />
              )}
            </div>
          </div>
        )}
      </main>

      <FloatingContact />
      
      <div className="modal-root">
        <LoginModal 
            isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} 
            onManualLogin={handleManualLogin} 
            onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} 
            onSuccess={() => setIsLoginOpen(false)}
            onError={(err: any) => console.error(err)} 
        />
        <RegisterModal 
          isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} 
          onManualRegister={handleManualRegister} 
          onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} 
        />
        <VehicleDetailModal 
          isOpen={isDetailOpen} vehicle={selectedVehicle} 
          onClose={() => { setIsDetailOpen(false); setSelectedVehicle(null); }} 
          onBooking={(v) => { 
            if(!user) { setIsLoginOpen(true); setIsDetailOpen(false); } 
            else { setSelectedVehicle(v); setIsDetailOpen(false); setIsBookingFormOpen(true); } 
          }} 
        />
        <BookingFormModal 
          isOpen={isBookingFormOpen} vehicle={selectedVehicle} 
          onClose={() => { setIsBookingFormOpen(false); setSelectedVehicle(null); }} 
          onConfirm={handleConfirmBooking} 
        />
      </div>
    </div>
  );
}