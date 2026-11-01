import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Gauge, Fuel, Cog, ChevronLeft, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
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

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      e.preventDefault();
      nextImage();
    } else if (isRightSwipe) {
      e.preventDefault();
      prevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat('it-IT').format(km) + ' km';
  };

  const estimatedMonthly = Math.round((vehicle.price * 0.0695 / 12) / (1 - Math.pow(1 + 0.0695 / 12, -84)));

  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Disponibile
          </span>
        );
      case 'incoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#8B5CF6]/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-pulse" />
            In Arrivo
          </span>
        );
      case 'negotiating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            In Trattativa
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#64748B]/30 text-[#94A3B8] border border-[#64748B]/40 backdrop-blur-md">
            Venduta
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => navigate(`/auto/${vehicle.slug}`)}
      className="group flex flex-col bg-[#16181F] rounded-2xl overflow-hidden border border-[#272A34] hover:border-[#E5A93C]/60 transition-all duration-200 hover:shadow-2xl hover:shadow-[#E5A93C]/10 cursor-pointer"
    >
      {/* Mini Slider Foto con Swipe Mobile */}
      <div
        className="relative aspect-[16/10] bg-[#1C1E26] overflow-hidden select-none"
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

        {/* Gradiente Ombreggiatura */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16181F] via-transparent to-black/30 pointer-events-none" />

        {/* Badges in alto */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            {getStatusBadge()}
            {vehicle.is_for_neopatentati === 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/40 backdrop-blur-md">
                <Zap className="w-3 h-3 fill-current" />
                Neopatentati
              </span>
            )}
          </div>
        </div>

        {/* Controlli Mini Slider (frecce per desktop o tap rapido) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Foto precedente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Foto successiva"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator Foto */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1 z-10 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImgIndex === idx ? 'bg-[#E5A93C] w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Prezzo in risalto Bianco/Oro con rata mensile stimata */}
        <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-[26px] font-black text-white tracking-tight drop-shadow-md leading-none">
              {formatPrice(vehicle.price)}
            </span>
            <span className="text-[11px] font-extrabold text-[#E5A93C] drop-shadow-sm mt-0.5">
              o da {estimatedMonthly} €/mese
            </span>
          </div>
        </div>
      </div>

      {/* Contenuto Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#E5A93C]">
              {vehicle.make}
            </span>
            {vehicle.is_featured === 1 && (
              <span className="text-[10px] font-semibold text-[#E5A93C] bg-[#E5A93C]/10 px-2 py-0.5 rounded-md border border-[#E5A93C]/20">
                In Evidenza
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#E5A93C] transition-colors line-clamp-1">
            {vehicle.model}
          </h3>

          {/* Griglia 4 micro-indicatori (Anno, Km certificati, Cambio, Alimentazione) */}
          <div className="grid grid-cols-2 gap-2 my-3.5 p-2.5 rounded-xl bg-[#1C1E26] border border-[#272A34] text-xs">
            {/* 1. Anno */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-none">Anno</span>
                <span className="font-bold text-white">{vehicle.year}</span>
              </div>
            </div>

            {/* 2. Km Certificati */}
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-[#94A3B8] leading-none flex items-center gap-0.5">
                  <span>Km cert.</span>
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#10B981]" />
                </span>
                <span className="font-bold text-white truncate">{formatKm(vehicle.mileage)}</span>
              </div>
            </div>

            {/* 3. Cambio */}
            <div className="flex items-center gap-2">
              <Cog className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-none">Cambio</span>
                <span className="font-bold text-white truncate">{vehicle.transmission}</span>
              </div>
            </div>

            {/* 4. Alimentazione */}
            <div className="flex items-center gap-2">
              <Fuel className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <div>
                <span className="block text-[10px] text-[#94A3B8] leading-none">Carburante</span>
                <span className="font-bold text-white truncate">{vehicle.fuel_type}</span>
              </div>
            </div>
          </div>

          {/* Note di Gabriel preview */}
          {vehicle.gabriel_notes && (
            <p className="text-xs text-[#94A3B8] italic line-clamp-2 mb-3 bg-[#0F1015]/60 p-2 rounded-lg border border-[#272A34]/50">
              "{vehicle.gabriel_notes}"
            </p>
          )}
        </div>

        {/* Tasto "Vedi Scheda" */}
        <div className="pt-2">
          <Link
            to={`/auto/${vehicle.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C1E26] group-hover:bg-[#E5A93C] text-white group-hover:text-black font-bold text-xs sm:text-sm border border-[#272A34] group-hover:border-[#E5A93C] transition-all duration-200 shadow-md"
          >
            <span>Vedi Scheda Completa</span>
            <span className="text-sm font-bold">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
