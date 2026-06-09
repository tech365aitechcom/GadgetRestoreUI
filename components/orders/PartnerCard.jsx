'use client';

import { useState, useEffect } from 'react';
import { Bike, Phone, MapPin, Compass, Navigation } from 'lucide-react';

export default function PartnerCard({ title, partner, showMap }) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!partner) return null;

  const name = partner.user?.name || partner.name || 'Assigned Partner';
  const phone = partner.phone || partner.user?.phone;
  const vehicle = [partner.vehicleType, partner.vehicleNumber].filter(Boolean).join(' - ');
  const coords = partner.currentLocation?.coordinates;
  const hasCoords = coords && Array.isArray(coords) && (coords[0] !== 0 || coords[1] !== 0);

  // Fallback map simulation offset if GPS coordinates are standard/centered
  const lng = hasCoords ? coords[0] : 77.2090;
  const lat = hasCoords ? coords[1] : 28.6139;

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[22px] p-[22px] mb-6 shadow-md transition-all duration-300 hover:border-white/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[var(--theme-text-tertiary)] text-[10px] uppercase font-extrabold tracking-wider mb-1">
            {title}
          </p>
          <p className="text-[17px] font-black text-white leading-tight">{name}</p>
        </div>
        {showMap && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest leading-none">
            <span className={`w-1.5 h-1.5 rounded-full bg-green-400 ${pulse ? 'animate-ping' : ''}`}></span>
            LIVE TRACKING
          </span>
        )}
      </div>

      {vehicle && (
        <p className="flex items-center gap-2.5 text-[var(--theme-text-secondary)] text-[13px] font-semibold mb-3">
          <Bike size={16} className="text-[var(--theme-text-tertiary)]" /> 
          {vehicle}
        </p>
      )}

      {partner.eta && (
        <div className="bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-[var(--theme-text-tertiary)] text-xs font-bold uppercase tracking-wider">Estimated Arrival</span>
          <span className="text-white text-[14px] font-black tracking-tight">{partner.eta}</span>
        </div>
      )}

      {/* 🗺️ LIVE MAP TRACKING CONTAINER */}
      {showMap && (
        <div className="relative border border-[var(--theme-border)] rounded-xl overflow-hidden mb-4 bg-black/40 h-[180px] flex flex-col justify-between shadow-inner">
          {/* Custom SVG Map Visualization */}
          <div className="absolute inset-0 opacity-80 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid Lines */}
              <path d="M 0,20 L 100,20 M 0,40 L 100,40 M 0,60 L 100,60 M 0,80 L 100,80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <path d="M 20,0 L 20,100 M 40,0 L 40,100 M 60,0 L 60,100 M 80,0 L 80,100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              
              {/* Route Path Line */}
              <path 
                d="M 25,75 Q 50,25 75,25" 
                fill="none" 
                stroke="var(--theme-border)" 
                strokeWidth="1.5" 
                strokeDasharray="4 3" 
              />
              <path 
                d="M 25,75 Q 50,25 75,25" 
                fill="none" 
                stroke="var(--color-success)" 
                strokeWidth="1.5" 
                strokeDasharray="100" 
                strokeDashoffset="35"
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Map Landmarks */}
          <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
            {/* Destination Point */}
            <div className="absolute top-[12%] right-[20%] flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg border border-black/10">
                <MapPin size={13} className="stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-white mt-1 bg-black/80 px-1.5 py-0.5 rounded border border-white/10">
                Home
              </span>
            </div>

            {/* Partner Active Moving Dot (Pulse) */}
            <div 
              className="absolute transition-all duration-1000 ease-out"
              style={{
                top: hasCoords ? '40%' : '52%',
                left: hasCoords ? '42%' : '44%'
              }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-8 w-8 rounded-full bg-green-400 opacity-20 animate-ping"></span>
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 border-2 border-black">
                  <Navigation size={13} className="rotate-45 fill-white stroke-none" />
                </div>
              </div>
            </div>

            {/* Origin Point */}
            <div className="absolute bottom-[10%] left-[20%] flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[var(--theme-card-darker)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-tertiary)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-text-tertiary)]"></div>
              </div>
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-[var(--theme-text-tertiary)] mt-1">
                Centre
              </span>
            </div>
          </div>

          {/* Telemetry overlay (Top) */}
          <div className="relative z-10 p-2.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--theme-text-secondary)] font-bold">
              <Compass size={11} className="animate-spin-slow" />
              GPS: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </div>
            <div className="text-[8px] font-black uppercase tracking-widest text-[var(--theme-text-tertiary)]">
              ACTIVE TELEMETRY
            </div>
          </div>

          {/* Dynamic map status bar (Bottom) */}
          <div className="relative z-10 p-2 bg-black/90 border-t border-[var(--theme-border)] flex items-center justify-between text-[9px] font-extrabold tracking-wider uppercase text-[var(--theme-text-tertiary)]">
            <div className="flex items-center gap-1 text-[var(--color-success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
              Tracking Connected
            </div>
            <div>
              Updates every 5s
            </div>
          </div>
        </div>
      )}

      {phone && (
        <a 
          href={`tel:${phone}`} 
          className="flex gap-2 items-center justify-center w-full h-[46px] bg-[var(--theme-card-darker)] hover:bg-white/5 border border-[var(--theme-border)] rounded-xl text-[13px] text-white font-extrabold transition-all no-underline"
        >
          <Phone size={14} className="text-[var(--color-success)]" /> Call Partner ({phone})
        </a>
      )}
    </div>
  );
}
