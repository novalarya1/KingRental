import React, { useState } from 'react';
import type { Vehicle } from '../../types';

const VehicleManager = () => {
  const [fleet, setFleet] = useState<Vehicle[]>([
    { id: '1', name: 'Toyota Alphard', type: 'Car', price: 2500000, status: 'Available', seats: 7, transmission: 'AT', img: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600' },
    { id: '2', name: 'Porsche 911', type: 'Car', price: 5000000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600' },
    { id: '3', name: 'Vespa Primavera', type: 'Motorcycle', price: 250000, status: 'Available', seats: 2, transmission: 'AT', img: 'https://www.thedrive.com/wp-content/uploads/content/archive-images/vespareview_inline4.jpg?strip=all&quality=85' },
    { id: '4', name: 'Kawasaki ZX25R', type: 'Motorcycle', price: 600000, status: 'On Rent', seats: 2, transmission: 'MT', img: 'https://img.autofun.co.id/file/4a1fba86ab0c4118a6f240b4ba6cb3f7.jpg' },
  ]);

  // --- State untuk UI Modal & Form ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = Add Mode, string = Edit Mode
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    type: 'Car',
    price: 0,
    status: 'Available',
    seats: 4,
    transmission: 'AT',
    img: ''
  });

  // --- Handlers ---
  
  // Membuka modal untuk Tambah Baru
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'Car', price: 0, status: 'Available', seats: 4, transmission: 'AT', img: '' });
    setIsModalOpen(true);
  };

  // Membuka modal untuk Edit Unit yang sudah ada
  const openEditModal = (unit: Vehicle) => {
    setEditingId(unit.id);
    setFormData(unit);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Logic Update (Edit)
      setFleet(prev => prev.map(v => v.id === editingId ? { ...v, ...formData } as Vehicle : v));
    } else {
      // Logic Create (Add)
      const vehicleToAdd: Vehicle = {
        ...formData as Vehicle,
        id: Date.now().toString(),
      };
      setFleet([vehicleToAdd, ...fleet]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to remove this unit?')) {
        setFleet(fleet.filter(v => v.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Fleet Management</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Total Units: {fleet.length} Active Vehicles</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
        >
          <span className="flex items-center gap-2">+ Add New Unit</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {fleet.map((unit) => (
          <div key={unit.id} className="group bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-8 transition-all hover:border-blue-500/30 shadow-xl">
            <div className="w-full md:w-48 h-32 rounded-[1.5rem] overflow-hidden bg-black border border-white/5">
              <img src={unit.img} alt={unit.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                <span className="text-[9px] font-black uppercase px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">{unit.type}</span>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${unit.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{unit.status}</span>
              </div>
              <h3 className="text-xl font-black uppercase italic text-white">{unit.name}</h3>
              <p className="text-zinc-500 text-sm font-medium">Rp {unit.price.toLocaleString()} <span className="text-[10px]">/ Day</span></p>
            </div>

            {/* Tombol Aksi: Edit & Delete */}
            <div className="flex gap-2">
              <button 
                onClick={() => openEditModal(unit)}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-inner"
                title="Edit Unit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button 
                onClick={() => handleDelete(unit.id)} 
                className="p-4 bg-red-500/5 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all shadow-inner"
                title="Delete Unit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FORM (ADD & EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                {editingId ? 'Edit Fleet Unit' : 'Register New Unit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Vehicle Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="e.g. Lamborghini Aventador" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none">
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Daily Price (Rp)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none" />
              </div>

              {/* Status hanya muncul saat EDIT (opsional, tapi bagus untuk kontrol admin) */}
              {editingId && (
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Maintenance Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none">
                    <option value="Available">Available</option>
                    <option value="On Rent">On Rent</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Transmission</label>
                <select value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none">
                  <option value="AT">Automatic (AT)</option>
                  <option value="MT">Manual (MT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Seats</label>
                <input type="number" value={formData.seats} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Image URL</label>
                <input required type="url" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none" placeholder="https://images.unsplash.com/..." />
              </div>

              <button type="submit" className="md:col-span-2 bg-white text-black font-black uppercase py-5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all tracking-widest mt-4 shadow-xl">
                {editingId ? 'Update Unit Details' : 'Confirm & Add to Fleet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;