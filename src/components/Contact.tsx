import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 relative overflow-hidden">
      {/* Glow Effect Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white">GET IN TOUCH</h2>
          <p className="text-zinc-500 max-w-xl mx-auto uppercase text-[10px] tracking-[0.3em] font-bold">
            Contact us for exclusive services or detailed inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* WhatsApp / Support */}
          <div className="group bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/50 transition-all duration-500">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="text-blue-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">WhatsApp</h3>
            <p className="text-zinc-500 text-sm mb-6">24/7 fast response for emergency and instant bookings.</p>
            <a href="https://wa.me/628123456789" className="text-blue-500 font-black text-sm tracking-widest uppercase hover:underline">
              +62 812 3456 789
            </a>
          </div>

          {/* Email Inquiry */}
          <div className="group bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/50 transition-all duration-500">
            <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail className="text-purple-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Email Inquiry</h3>
            <p className="text-zinc-500 text-sm mb-6">Corporate partnerships or long-term rental agreements.</p>
            <a href="mailto:kingrental@gmail.com" className="text-purple-500 font-black text-sm tracking-widest uppercase hover:underline">
              kingrental@gmail.com
            </a>
          </div>

          {/* Showroom / Office */}
          <div className="group bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500">
            <div className="w-14 h-14 bg-zinc-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="text-zinc-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Showroom</h3>
            <p className="text-zinc-500 text-sm mb-6">Visit our executive garage for unit inspections.</p>
            <p className="text-zinc-300 font-bold text-sm tracking-tight uppercase">
              Denpasar, Bali
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}