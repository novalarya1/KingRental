import api from '../../api/axios'; // Naik 2 kali: services -> components -> src
import type { Vehicle } from '../../types'; // Naik 2 kali: services -> components -> src

export const paymentService = {
  /**
   * Fungsi untuk memulai proses booking dan pembayaran
   */
  async createPayment(vehicle: Vehicle, start: string, end: string, total: number) {
    try {
      // 1. Hit ke Backend untuk buat transaksi & dapatkan Snap Token
      const response = await api.post('/bookings', {
        vehicle_id: vehicle.id,
        start_date: start,
        end_date: end,
        total_price: total
      });

      // Sesuaikan destructing dengan response Laravel Anda
      // Laravel biasanya membungkus data dalam properti 'data' jika menggunakan Resource
      const data = response.data.data || response.data;
      const { snap_token, id: booking_id } = data;

      if (!snap_token) {
        throw new Error("Token pembayaran tidak ditemukan.");
      }

      // 2. Eksekusi Midtrans Snap
      return new Promise((resolve, reject) => {
        (window as any).snap.pay(snap_token, {
          onSuccess: (result: any) => {
            resolve({ status: 'success', booking_id, result });
          },
          onPending: (result: any) => {
            resolve({ status: 'pending', booking_id, result });
          },
          onError: (err: any) => {
            reject(new Error("Pembayaran gagal diproses."));
          },
          onClose: () => {
            resolve({ status: 'cancelled', booking_id });
          }
        });
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghubungkan ke server pembayaran.");
    }
  }
};