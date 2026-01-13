import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix untuk icon default Leaflet yang sering tidak muncul di React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk otomatis geser kamera peta
function RecenterMap({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 13);
  }, [coords, map]);
  return null;
}

export default function NearbyLocation() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const branches = [
    { name: "King Rental Sanur", lat: -8.6826, lng: 115.2625, address: "Jl. Bypass Ngurah Rai No.162" },
    { name: "King Rental Denpasar", lat: -8.7185, lng: 115.2227, address: "Jl. Bypass Ngurah Rai No.330" },
    { name: "King Rental Renon", lat: -8.6792, lng: 115.2435, address: "Jl. Tukad Balian No.144A" }
  ];

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoading(false);
        },
        () => {
          alert("Gagal mendapatkan lokasi. Harap izinkan akses lokasi.");
          setLoading(false);
        }
      );
    }
  };

  return (
    <section className="max-w-7xl mx-auto py-24 px-6 border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Find Nearest Spot
          </h2>
          <p className="text-[10px] text-blue-500 font-bold tracking-[0.5em] uppercase mt-2">Dapatkan unit lebih cepat dari titik terdekat anda</p>
        </div>
        
        <button 
          onClick={getLocation}
          disabled={loading}
          className="group relative px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-blue-600 hover:text-white active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
            {userCoords ? "Location Updated" : "Update Location"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {branches.map((branch, index) => (
          <div key={index} className="group bg-zinc-900/30 border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
              <MapPin size={20} />
            </div>
            <h3 className="text-lg font-black text-white italic uppercase mb-2">{branch.name}</h3>
            <p className="text-zinc-500 text-[11px] mb-6 leading-relaxed">{branch.address}</p>
            
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              Open In Maps <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>

      {/* PETA LEAFLET */}
      <div className="h-[450px] w-full rounded-[3rem] overflow-hidden border border-white/10 z-0 relative">
        <MapContainer 
          center={[-8.68, 115.24]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', background: '#18181b' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles" // Kita beri filter gelap via CSS
          />
          
          {branches.map((branch, idx) => (
            <Marker key={idx} position={[branch.lat, branch.lng]}>
              <Popup>
                <div className="font-sans">
                  <strong className="block uppercase">{branch.name}</strong>
                  <span className="text-xs">{branch.address}</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {userCoords && (
            <>
              <Marker position={[userCoords.lat, userCoords.lng]}>
                <Popup>Lokasi Anda Sekarang</Popup>
              </Marker>
              <RecenterMap coords={userCoords} />
            </>
          )}
        </MapContainer>
      </div>
    </section>
  );
}