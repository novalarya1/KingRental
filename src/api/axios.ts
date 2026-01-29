import axios from 'axios';

const api = axios.create({
  baseURL: 'https://unobserving-dorinda-variatively.ngrok-free.dev', 
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(
  (config) => {
    // 1. JWT Fallback
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. CSRF Token Sync
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // 3. Smart URL Prefixing
    if (config.url && !config.url.startsWith('http')) {
        // Daftar route yang TIDAK butuh prefix /api (Route bawaan Sanctum)
        const isSanctumRoute = config.url.includes('sanctum/csrf-cookie');
        const alreadyHasApi = config.url.startsWith('/api') || config.url.startsWith('api');
        
        if (!isSanctumRoute && !alreadyHasApi) {
            // Pastikan URL bersih dari double slash
            const cleanUrl = config.url.startsWith('/') ? config.url : `/${config.url}`;
            config.url = `/api${cleanUrl}`;
        }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Jika session expired atau token mismatch
      if (status === 401 || status === 419) {
        console.warn("Session Expired/Invalid. Cleaning up...");
        // Jangan langsung redirect jika sedang di halaman home, 
        // cukup bersihkan state jika perlu.
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;