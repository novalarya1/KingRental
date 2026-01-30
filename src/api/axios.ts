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
    // Ambil token dengan key 'token'
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Otomatis tambah prefix /api jika belum ada
    if (config.url && !config.url.startsWith('http')) {
        const isSanctumRoute = config.url.includes('sanctum/csrf-cookie');
        const alreadyHasApi = config.url.startsWith('/api') || config.url.startsWith('api');
        
        if (!isSanctumRoute && !alreadyHasApi) {
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
      
      // Jika session expired atau unauthorized
      if (status === 401 || status === 419) {
        localStorage.removeItem('token');
        // Opsi: window.location.href = '/'; jika ingin paksa redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;