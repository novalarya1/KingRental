import React, { useState } from 'react';
import { Calendar, MapPin, CreditCard, AlertCircle, X, ShieldCheck } from 'lucide-react';
import type { Vehicle } from '../types'; 
import api from '../api/axios'; // Ensure this path is correct
import axios from 'axios'; // Import axios directly for 'isAxiosError' check

// Global declaration for Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

interface PaymentSummaryProps {
  bookingId: number | string;
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  totalPrice: number;
  // Callbacks
  onPaymentSuccess: (result: any) => void;
  onPaymentPending: (result: any) => void;
  onPaymentError: (result: any) => void;
  onCancel: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  bookingId,
  vehicle,
  startDate,
  endDate,
  totalPrice,
  onPaymentSuccess,
  onPaymentPending,
  onPaymentError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- 1. Helper: Dynamically Load Midtrans Script ---
  const loadMidtransScript = (clientKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const scriptId = 'midtrans-script';
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

      // Detect Environment (Sandbox vs Production) based on Key
      const isSandbox = clientKey.includes('SB-');
      const scriptUrl = isSandbox 
        ? 'https://app.sandbox.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

      if (existingScript) {
        if (existingScript.src !== scriptUrl) {
           document.body.removeChild(existingScript); // Remove if environment changed
        } else {
           resolve(); // Script exists and matches
           return;
        }
      }

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.id = scriptId;
      script.setAttribute('data-client-key', clientKey);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Midtrans connection.'));
      document.body.appendChild(script);
    });
  };

  // --- 2. Main Logic: Handle Pay Button ---
  const handlePayment = async () => {
    if (!bookingId) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Initiating payment for Booking ID:", bookingId);

      // --- STEP A: Request Token from Backend ---
      // NOTE: If you are getting a 405 Method Not Allowed, change api.get to api.post
      const response = await api.get(`/bookings/${bookingId}/payment-token`);
      
      console.log("Backend Response:", response.data); 

      const { snap_token, client_key } = response.data;

      if (!snap_token || !client_key) {
        throw new Error("Invalid response: 'snap_token' or 'client_key' missing.");
      }

      // --- STEP B: Load Midtrans Script ---
      await loadMidtransScript(client_key);

      // --- STEP C: Open Snap Popup ---
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: (result: any) => {
            console.log("Success:", result);
            onPaymentSuccess(result);
            setIsLoading(false);
          },
          onPending: (result: any) => {
            console.log("Pending:", result);
            onPaymentPending(result);
            setIsLoading(false);
          },
          onError: (result: any) => {
            console.error("Midtrans Error:", result);
            setErrorMessage("Payment failed or declined.");
            onPaymentError(result);
            setIsLoading(false);
          },
          onClose: () => {
            console.log("Closed without pay");
            setIsLoading(false);
          }
        });
      } else {
        throw new Error("Midtrans failed to initialize (window.snap undefined).");
      }

    } catch (error: any) {
      // --- ROBUST ERROR HANDLING FOR 500 ERRORS ---
      console.group("Payment Error Debugging");

      if (axios.isAxiosError(error) && error.response) {
        // The server responded with a status code other than 2xx
        console.error("Server Status:", error.response.status);
        console.error("Server Headers:", error.response.headers);
        console.error("Server Data (Error Details):", error.response.data); // <--- CHECK THIS LOG

        // Try to extract a meaningful message from the backend response
        const backendMsg = error.response.data?.message || error.response.data?.error;
        setErrorMessage(backendMsg ? `Server Error: ${backendMsg}` : `Server Error (${error.response.status})`);
      
      } else if (axios.isAxiosError(error) && error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        setErrorMessage("No response from server. Check your internet connection.");
      
      } else {
        // Something else happened
        console.error("Error Message:", error.message);
        setErrorMessage(error.message || "An unexpected system error occurred.");
      }
      
      console.groupEnd();
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">
          Payment <span className="text-blue-600">Secure</span>
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Vehicle Info */}
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
        <div className="w-16 h-16 bg-black rounded-xl overflow-hidden relative">
           {vehicle.img ? (
             <img src={vehicle.img} className="w-full h-full object-cover opacity-80" alt={vehicle.name} />
           ) : <div className="w-full h-full bg-zinc-800" />}
        </div>
        <div>
          <h3 className="text-white font-bold uppercase italic">{vehicle.name}</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-black/50 px-2 py-1 rounded">
            {vehicle.type}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 mb-8 border-y border-white/5 py-6">
        <div className="flex items-center gap-3">
           <Calendar className="text-blue-600" size={18} />
           <div>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Period</p>
             <p className="text-sm text-zinc-300 font-medium">{startDate} — {endDate}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <MapPin className="text-blue-600" size={18} />
           <div>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Branch</p>
             <p className="text-sm text-zinc-300 font-medium">{vehicle.branch?.name || 'Main HQ'}</p>
           </div>
        </div>
      </div>

      {/* Total & Button */}
      <div className="flex justify-between items-end mb-6">
        <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Total Bill</span>
        <span className="text-3xl font-black italic text-white tracking-tighter">
           Rp {totalPrice.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
           <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      <button 
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <> <CreditCard size={18} /> Pay Now </>
        )}
      </button>

      <div className="mt-4 flex justify-center items-center gap-2 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
        <ShieldCheck size={12} /> Secured by Midtrans Gateway
      </div>
    </div>
  );
};

export default PaymentSummary;