import axios from 'axios';

const api = axios.create({
  // Gunakan baseURL TANPA slash di akhir agar penggabungan URL lebih konsisten
  baseURL: 'https://unobserving-dorinda-variatively.ngrok-free.dev', 
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    // Tambahkan header ini agar Laravel mengenali request sebagai AJAX
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor untuk Request
api.interceptors.request.use(
  (config) => {
    // 1. JWT fallback (opsional jika Sanctum menggunakan cookie-based)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. CSRF Token Manual (Hanya diperlukan jika Axios tidak membacanya otomatis)
    // Sebenarnya Axios secara default mencari cookie bernama 'XSRF-TOKEN' 
    // dan memasukkannya ke header 'X-XSRF-TOKEN'.
    // Namun, cara manual Anda di bawah ini adalah backup yang bagus:
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // 3. Otomatisasi Prefix /api (DIPERBAIKI)
    if (config.url && !config.url.startsWith('http')) {
       const isSanctum = config.url.includes('sanctum');
       const alreadyHasApi = config.url.startsWith('/api') || config.url.startsWith('api');
       
       if (!isSanctum && !alreadyHasApi) {
          // Pastikan format URL benar: /api/resource
          const cleanUrl = config.url.startsWith('/') ? config.url : `/${config.url}`;
          config.url = `/api${cleanUrl}`;
       }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangani Session Expired secara proaktif
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401 || status === 419) {
        console.error("Sesi berakhir atau CSRF token tidak valid. Mengarahkan ke login...");
        
        // Opsional: Hapus data user di local jika session habis
        // localStorage.removeItem('token');
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;