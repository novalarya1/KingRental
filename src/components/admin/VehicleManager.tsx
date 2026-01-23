import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Save, Loader2, Users, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import type { Vehicle } from '../../types';

interface VehicleFormData {
  name: string;
  type: string;
  price_per_day: string;
  seats: string;
  transmission: string;
  is_available: string; 
  img: File | string | null;
}

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const STORAGE_URL = "http://localhost:8000/storage/";

  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    type: 'Luxury',
    price_per_day: '',
    seats: '4',
    transmission: 'Automatic',
    is_available: '1',
    img: null
  });

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/vehicles');
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setVehicles(data);
    } catch (err) {
      console.error("Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchVehicles(); 
  }, [fetchVehicles]);

  useEffect(() => {
    if (formData.img instanceof File) {
      const objectUrl = URL.createObjectURL(formData.img);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof formData.img === 'string' && formData.img !== '') {
      const fullUrl = formData.img.startsWith('http') ? formData.img : `${STORAGE_URL}${formData.img}`;
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.img]);

  const resetForm = () => {
    setFormData({ 
      name: '', type: 'Luxury', price_per_day: '', seats: '4', 
      transmission: 'Automatic', is_available: '1', img: null 
    });
    setEditingVehicle(null);
    setPreviewUrl(null);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    
    const rawPrice = (vehicle as any).price_per_day || (vehicle as any).price || 0;
    let numericPrice = typeof rawPrice === 'string' 
      ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) 
      : Number(rawPrice);
    
    if (numericPrice >= 1000) numericPrice = numericPrice / 1000;

    setFormData({
      name: vehicle.name || '',
      type: vehicle.type || 'Luxury',
      price_per_day: numericPrice.toString(),
      seats: vehicle.seats?.toString() || '4',
      transmission: vehicle.transmission || 'Automatic',
      // Mengatasi error 'is_available' property missing dengan any casting
      is_available: (vehicle as any).is_available ? '1' : '0',
      img: vehicle.img || null
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('type', formData.type);
    data.append('price_per_day', formData.price_per_day);
    data.append('seats', formData.seats);
    data.append('transmission', formData.transmission);
    data.append('is_available', formData.is_available);
    
    if (formData.img instanceof File) {
      data.append('img', formData.img);
    }

    try {
      if (editingVehicle) {
        data.append('_method', 'PUT'); 
        await api.post(`/vehicles/${editingVehicle.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/vehicles', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchVehicles();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perbaikan tipe ID: Menyesuaikan dengan Vehicle.id (number)
  const handleDelete = async (id: number) => {
    if (window.confirm("Permanent delete this unit?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Vehicle Inventory</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Database: <span className="text-blue-500">vehicles</span> | <span className="text-white">{vehicles.length} Units</span>
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-xl shadow-blue-600/30 active:scale-95"
        >
          <Plus size={16} /> Register New Unit
        </button>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-8 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Unit Info</th>
                <th className="p-8 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Availability</th>
                <th className="p-8 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Rate / Day</th>
                <th className="p-8 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-32 text-center text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">
                    <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                    Loading Database...
                  </td>
                </tr>
              ) : vehicles.map((v) => {
                const rawPrice = (v as any).price_per_day || (v as any).price || 0;
                let numericPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) : Number(rawPrice);
                if (numericPrice > 0 && numericPrice < 10000) numericPrice *= 1000;

                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-24 h-14 rounded-xl overflow-hidden bg-black border border-white/10">
                          <img 
                            src={v.img?.startsWith('http') ? v.img : `${STORAGE_URL}${v.img}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={v.name} 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800'; }}
                          />
                        </div>
                        <div>
                          <span className="font-black text-sm text-zinc-200 uppercase italic block">{v.name}</span>
                          <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">
                            {v.type} • {v.transmission} • {v.seats} Seats
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        (v as any).is_available 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {(v as any).is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-8 font-mono text-blue-500 font-black text-right">
                      Rp {numericPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(v)} className="p-3 bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"><Pencil size={14} /></button>
                        {/* Fix: Mengirim v.id (number) sesuai ekspektasi handleDelete */}
                        <button onClick={() => handleDelete(Number(v.id))} className="p-3 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SECTION TETAP SAMA SEPERTI SEBELUMNYA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <div className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                {editingVehicle ? 'Update Unit' : 'Launch Unit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 text-zinc-500 hover:text-white rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Vehicle Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-blue-500 outline-none font-bold uppercase italic transition-all"
                  placeholder="E.G. PORSCHE 911 GT3"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Category</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
                >
                  <option>Luxury</option>
                  <option>Sport</option>
                  <option>SUV</option>
                  <option>Electric</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Availability</label>
                <div className="relative">
                  <select 
                    value={formData.is_available} 
                    onChange={e => setFormData({...formData, is_available: e.target.value})}
                    className={`w-full bg-black border rounded-2xl p-5 text-sm font-bold appearance-none cursor-pointer outline-none transition-all duration-300 ${
                      formData.is_available === '1' 
                      ? 'border-emerald-500/50 text-emerald-500' 
                      : 'border-red-500/50 text-red-500'
                    }`}
                  >
                    <option value="1">Available (Aktif)</option>
                    <option value="0">Unavailable (Non-Aktif)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Daily Rate (k)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">Rp</span>
                  <input 
                    type="number" required value={formData.price_per_day}
                    onChange={e => setFormData({...formData, price_per_day: e.target.value})}
                    placeholder="350"
                    className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-12 pr-5 text-sm text-white focus:border-blue-500 outline-none font-bold"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-[10px]">.000</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Transmission</label>
                <select 
                  value={formData.transmission} 
                  onChange={e => setFormData({...formData, transmission: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Passenger Seats</label>
                <div className="relative">
                   <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                   <select 
                    value={formData.seats} 
                    onChange={e => setFormData({...formData, seats: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-12 pr-5 text-sm text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
                  >
                    <option value="2">2 Seater</option>
                    <option value="4">4 Seater</option>
                    <option value="5">5 Seater</option>
                    <option value="7">7 Seater</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-3">Vehicle Asset</label>
                <div className="relative group border-2 border-dashed border-white/10 rounded-[2.5rem] p-10 text-center hover:border-blue-500/50 transition-all cursor-pointer bg-black/40 overflow-hidden">
                  <input 
                    type="file" accept="image/*"
                    onChange={e => setFormData({...formData, img: e.target.files ? e.target.files[0] : formData.img})}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  {previewUrl ? (
                    <div className="relative z-10">
                      <img src={previewUrl} className="max-h-56 mx-auto rounded-2xl shadow-2xl border border-white/10 object-contain" alt="Preview" />
                      <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        <Upload size={12} /> Replace Image Asset
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5 group-hover:scale-110 transition-transform">
                        <Upload className="text-zinc-500" />
                      </div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Click or Drop Image Here</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="md:col-span-2 bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/40 disabled:opacity-50 active:scale-95 italic mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {editingVehicle ? 'Update Vehicle Data' : 'Save to Vehicles Table'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}