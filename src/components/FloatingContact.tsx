import { Instagram, Phone } from 'lucide-react';

export default function FloatingContact() {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
      {/* Tombol Instagram */}
      <a
        href="https://instagram.com/KingRental"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 shadow-2xl"
      >
        <Instagram size={24} />
        {/* Tooltip */}
        <span className="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Instagram
        </span>
      </a>

      {/* Tombol Phone/WhatsApp */}
      <a
        href="https://wa.me/628123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-bounce-subtle"
      >
        <Phone size={24} />
        {/* Tooltip */}
        <span className="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Contact Us
        </span>
      </a>
    </div>
  );
}