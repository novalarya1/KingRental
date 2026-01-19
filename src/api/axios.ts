import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', 
  timeout: 10000,
  withCredentials: true, // Wajib untuk mengirim cookie session & XSRF-TOKEN
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk Request
api.interceptors.request.use(
  (config) => {
    // 1. Ambil token dari localStorage (Jika Anda menggunakan JWT)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Penanganan Otomatis XSRF-TOKEN (Sanctum)
    // Laravel menyimpan CSRF token di cookie bernama XSRF-TOKEN. 
    // Browser biasanya mengirim ini otomatis, tapi membacanya secara manual memastikan konsistensi.
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // 3. Otomatisasi Prefix /api
    // Pastikan tidak merusak URL yang sudah lengkap atau request ke sanctum
    if (config.url && !config.url.startsWith('http') && !config.url.includes('sanctum')) {
      config.url = `/api${config.url.startsWith('/') ? config.url : '/' + config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend mengembalikan 401 (Unauthorized) atau 419 (Page Expired/CSRF mismatch)
    if (error.response && (error.response.status === 401 || error.response.status === 419)) {
      console.error("Sesi berakhir atau CSRF token tidak valid.");
      // localStorage.removeItem('token'); // Bersihkan jika perlu
      // window.location.href = '/login'; // Opsional: redirect
    }
    return Promise.reject(error);
  }
);

export default api;