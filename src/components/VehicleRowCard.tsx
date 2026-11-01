import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Layers, 
  Car, 
  Cog, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Star
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Vehicle } from '../types/vehicle';

interface VehicleRowCardProps {
  vehicle: Vehicle;
}

export const VehicleRowCard: React.FC<VehicleRowCardProps> = ({ vehicle }) => {
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Parse images
  let images: string[] = [];
  try {
    images = JSON.parse(vehicle.images);
    if (!Array.isArray(images) || images.length === 0) {
      images = ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];
    }
  } catch {
    images = ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];
  }

  const nextImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      e.preventDefault();
      nextImage();
    } else if (distance < -40) {
      e.preventDefault();
      prevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  };

  const cv = vehicle.power_cv || (vehicle.power_kw ? Math.round(vehicle.power_kw * 1.35962) : null);

  const whatsappUrl = `https://wa.me/393487051158?text=${encodeURIComponent(
    `Ciao Gabriel! Ti contatto dal catalogo per ${vehicle.make} ${vehicle.model} a ${formatPrice(vehicle.price)}. È disponibile per una visione?`
  )}`;

  return (
    <div
      onClick={() => navigate(`/auto/${vehicle.slug}`)}
      className="group bg-[#16181F] rounded-2xl border border-[#272A34] hover:border-[#E5A93C]/50 transition-all duration-200 hover:shadow-2xl hover:shadow-[#E5A93C]/5 cursor-pointer overflow-hidden flex flex-col md:flex-row mb-4"
    >
      {/* 1. FOTO A SINISTRA (CON MINI SLIDER & BADGE RATA) */}
      <div
        className="relative md:w-[380px] lg:w-[420px] aspect-[16/10] md:aspect-auto shrink-0 bg-[#1C1E26] overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImgIndex]}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          loading="lazy"
        />

        {/* Badge In Evidenza */}
        {vehicle.is_featured === 1 && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-[#E5A93C] text-black font-black text-[10px] tracking-wider uppercase shadow-lg shadow-black/60 flex items-center gap-1 border border-[#E5A93C]/40">
            <Star className="w-3 h-3 fill-black text-black" />
            <span>IN EVIDENZA</span>
          </div>
        )}

        {/* Frecce Navigazione Foto su Hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Foto precedente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Foto successiva"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 z-10 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white">
              {currentImgIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* 2. CONTENUTO A DESTRA: TITOLO, PREZZO GIGANTE & MATRICE 3x3 SPECIFICHE */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Card: Nome a sinistra, Prezzo in alto a destra (come nel benchmark) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[#272A34]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-[#E5A93C] transition-colors">
                  {vehicle.make} {vehicle.model.split(' ')[0]}
                </span>
                {vehicle.is_for_neopatentati === 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
                    Neopatentati
                  </span>
                )}
                {vehicle.status === 'incoming' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#8B5CF6]/50">
                    In Arrivo
                  </span>
                )}
                {vehicle.status === 'negotiating' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                    In Trattativa
                  </span>
                )}
                {vehicle.status === 'sold' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#64748B]/30 text-[#94A3B8] border border-[#64748B]/40">
                    Venduta
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#94A3B8] font-medium mt-0.5">
                {vehicle.model}
              </p>
            </div>

            {/* Prezzo in alto a destra in evidenza (come nel benchmark Auto Lazeta) */}
            <div className="sm:text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatPrice(vehicle.price)}
              </span>
              {vehicle.is_vat_deductible && (
                <span className="block text-[10px] text-[#94A3B8]">iva esposta</span>
              )}
            </div>
          </div>

          {/* MATRICE SPECIFICHE A 3 COLONNE x 3 RIGHE (ESATTO BENCHMARK IMMAGINE) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 py-4 text-xs">
            {/* RIGA 1 / COLONNA 1: ANNO */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Anno</span>
                <strong className="text-white font-bold">{vehicle.month || vehicle.year}</strong>
              </div>
            </div>

            {/* RIGA 1 / COLONNA 2: ALIMENTAZIONE */}
            <div className="flex items-start gap-2">
              <Fuel className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Alimentazione</span>
                <strong className="text-white font-bold">{vehicle.fuel_type}</strong>
              </div>
            </div>

            {/* RIGA 1 / COLONNA 3: TRAZIONE */}
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Trazione</span>
                <strong className="text-white font-bold">{vehicle.traction || 'Anteriore'}</strong>
              </div>
            </div>

            {/* RIGA 2 / COLONNA 1: KM */}
            <div className="flex items-start gap-2">
              <Gauge className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Km</span>
                <strong className="text-white font-bold">{vehicle.mileage.toLocaleString()} Km</strong>
              </div>
            </div>

            {/* RIGA 2 / COLONNA 2: CILINDRATA */}
            <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Cilindrata</span>
                <strong className="text-white font-bold">{vehicle.displacement || 'N/D'}</strong>
              </div>
            </div>

            {/* RIGA 2 / COLONNA 3: CAMBIO */}
            <div className="flex items-start gap-2">
              <Cog className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Cambio</span>
                <strong className="text-white font-bold truncate max-w-[130px]">{vehicle.transmission}</strong>
              </div>
            </div>

            {/* RIGA 3 / COLONNA 1: NORMATIVA */}
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Normativa</span>
                <strong className="text-white font-bold">{vehicle.euro_class || 'Euro 6D'}</strong>
              </div>
            </div>

            {/* RIGA 3 / COLONNA 2: POSTI */}
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Posti</span>
                <strong className="text-white font-bold">{vehicle.seats || 5}</strong>
              </div>
            </div>

            {/* RIGA 3 / COLONNA 3: POTENZA */}
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-tight">Potenza</span>
                <strong className="text-white font-bold">{vehicle.power_kw} kW {cv ? `(${cv} cv)` : ''}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card con Tasto Scheda e Tasto Rapido WhatsApp */}
        <div className="pt-3 border-t border-[#272A34] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
            <span className="text-[#10B981] font-bold">✓ Tagliando preconsegna incluso</span>
            {vehicle.plate && <span className="hidden sm:inline font-mono text-[11px] text-[#64748B]">Targa: {vehicle.plate}</span>}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#25D366]/20 active:scale-95"
              title="Chiedi a Gabriel"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => navigate(`/auto/${vehicle.slug}`)}
              className="px-4 py-2 rounded-xl bg-[#1C1E26] hover:bg-[#E5A93C] text-white hover:text-black font-extrabold text-xs transition-colors border border-[#272A34] hover:border-[#E5A93C] shadow-sm flex items-center gap-1"
            >
              <span>Vedi Scheda</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

