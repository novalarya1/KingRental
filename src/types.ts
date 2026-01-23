export type UserRole = 'Super Admin' | 'Branch Admin' | 'Customer';

// Tambahkan interface Branch agar referensi di Vehicle & Booking valid
export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface Vehicle {
  id: number;
  brand?: string;
  name: string;
  // Gunakan Union Type yang konsisten
  type: 'Car' | 'Motorcycle' | 'Luxury' | 'Sport' | 'SUV' | 'Electric';
  price_per_day: number;
  status: 'Available' | 'On Rent' | 'Maintenance';
  img: string | null; // Pastikan handle null saat render image src
  seats: number; // Disarankan number saja agar mudah dikalkulasi
  transmission: 'Automatic' | 'Manual'; 
  is_available: boolean; // Gunakan boolean murni, jangan mixed dengan number
  description?: string;
  // Relasi bisa berupa string (ID/Nama) atau Object detail
  branch?: Branch; 
}

export interface Booking {
  id: number; // ID dari DB biasanya number
  vehicle_id: number;
  user_id?: number;
  start_date: string; // ISO Date String
  end_date: string;
  total_price: number;
  status: 'pending' | 'approved' | 'paid' | 'completed' | 'returned' | 'success';
  
  // Relasi (Eager Loading)
  vehicle?: Vehicle;
  user?: Pick<User, 'name' | 'email'>; // Mengambil properti dari interface User
  branch?: Branch;
  customer_name?: string; // Fallback jika user_id tidak ada (Guest)
}

export interface Review {
  id: number;
  booking_id: number;
  user_name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  picture?: string;
}