import React from 'react';
import { Award, ShieldCheck, Clock, Star } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: <Star size={20} />, label: "Premium Fleet", value: "50+" },
    { icon: <ShieldCheck size={20} />, label: "Satisfaction", value: "100%" },
    { icon: <Clock size={20} />, label: "Support", value: "24/7" },
    { icon: <Award size={20} />, label: "Experience", value: "10 Yrs" },
  ];

  return (
    <section id="about" className="relative py-32 px-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT: Visual/Image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-700"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[4/5] lg:aspect-square shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000" 
                alt="Luxury Car" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              
              {/* Overlay Badge */}
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                <p className="text-blue-500 font-black italic tracking-widest text-xs uppercase mb-2">The Standard</p>
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">
                  "Not just a journey, but a statement."
                </h3>
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h4 className="text-blue-500 font-black tracking-[0.5em] text-[10px] uppercase">About The King</h4>
              <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white leading-[0.9] uppercase">
                Redefining <br /> 
                <span className="text-zinc-700">The Royal</span> <br /> 
                Mobility.
              </h2>
            </div>

            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              King Rental exists to serve your most exclusive needs in Bali. 
              Since 2016, we have catered to thousands of VIP clients, travelers, and 
              professionals with a five-star service standard. We believe that every second 
              on the road should be savored with absolute comfort and a sense of pride.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-600/30 transition-all group text-center">
                  <div className="text-zinc-500 group-hover:text-blue-500 transition-colors flex justify-center mb-3">
                    {stat.icon}
                  </div>
                  <h5 className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</h5>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button className="flex items-center gap-4 group">
                <div className="h-[1px] w-12 bg-blue-600 group-hover:w-20 transition-all duration-500"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Experience More</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}