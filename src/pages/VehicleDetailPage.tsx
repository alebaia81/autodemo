import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Phone, 
  ArrowLeft, 
  Calendar, 
  Gauge, 
  Fuel, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Cog, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Car, 
  Clock, 
  Banknote, 
  Copy, 
  Check, 
  Award
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { api } from '../services/api';
import { Vehicle } from '../types/vehicle';

export const VehicleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Tabs specifiche tecniche
  const [activeSpecTab, setActiveSpecTab] = useState<'info' | 'consumi' | 'optional'>('info');

  // Simulatore Finanziamento interattivo
  const [downPayment, setDownPayment] = useState<number>(2000);
  const [durationMonths, setDurationMonths] = useState<number>(60);

  // Form contatti laterale
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getVehicleBySlug(slug);
        setVehicle(data);
        if (data) {
          // Inizializza anticipo predefinito a circa il 15-20% del prezzo
          setDownPayment(Math.round((data.price * 0.15) / 500) * 500);
        }
      } catch (err) {
        console.error('Errore recupero dettagli veicolo', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
    window.scrollTo(0, 0);
  }, [slug]);

  let images: string[] = [];
  if (vehicle) {
    try {
      images = JSON.parse(vehicle.images);
      if (!Array.isArray(images) || images.length === 0) {
        images = ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=85'];
      }
    } catch {
      images = ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=85'];
    }
  }

  const nextImage = () => {
    if (images.length === 0) return;
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) nextImage();
    else if (distance < -40) prevImage();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Calcolo Rata Finanziamento Mensile
  const monthlyRate = useMemo(() => {
    if (!vehicle) return 0;
    const principal = Math.max(1000, vehicle.price - downPayment);
    const annualRate = 0.0695; // TAN indicativo 6.95%
    const monthlyRatePercentage = annualRate / 12;
    const rate = 
      (principal * monthlyRatePercentage) / 
      (1 - Math.pow(1 + monthlyRatePercentage, -durationMonths));
    return Math.round(rate);
  }, [vehicle, downPayment, durationMonths]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 bg-[#16181F] w-48 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 aspect-[16/10] bg-[#16181F] rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-10 bg-[#16181F] rounded-xl" />
            <div className="h-28 bg-[#16181F] rounded-xl" />
            <div className="h-60 bg-[#16181F] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1C1E26] border border-[#272A34] flex items-center justify-center mx-auto mb-4 text-[#E5A93C]">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Veicolo non trovato</h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] mb-6">
          Il veicolo potrebbe essere stato venduto o rimosso dal piazzale.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E5A93C] text-black font-extrabold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna al catalogo completo</span>
        </Link>
      </div>
    );
  }

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
  };

  const cv = vehicle.power_cv || (vehicle.power_kw ? Math.round(vehicle.power_kw * 1.35962) : null);

  // Link WhatsApp con messaggio strutturato
  const whatsappUrl = `https://wa.me/393487051158?text=${encodeURIComponent(
    `Ciao Gabriel! Ti contatto per ${vehicle.make} ${vehicle.model} (Targa: ${vehicle.plate || vehicle.id}) al prezzo di ${formatPrice(vehicle.price)}.\nVorrei verificare la disponibilità e prenotare una visione a Castelvetro Piacentino.`
  )}`;

  // Link WhatsApp specifico per finanziamento
  const whatsappFinanceUrl = `https://wa.me/393487051158?text=${encodeURIComponent(
    `Ciao Gabriel! Ti contatto per il finanziamento di ${vehicle.make} ${vehicle.model}:\n• Prezzo: ${formatPrice(vehicle.price)}\n• Anticipo: ${formatPrice(downPayment)}\n• Durata: ${durationMonths} mesi\n• Rata stimata: circa ${monthlyRate} €/mese.\nPossiamo procedere con una simulazione ufficiale?`
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-16 bg-[#0F1015]">
      {/* 1. TOP STICKY MINI-BAR RAPIDA CON NOME, PREZZO E TORNA ALLA LISTA */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#16181F]/95 backdrop-blur-md border-b border-[#272A34] py-2.5 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1E26] hover:bg-[#272A34] text-xs font-bold text-[#94A3B8] hover:text-white transition-colors border border-[#272A34]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span className="hidden sm:inline">Torna alla lista auto</span>
            <span className="sm:hidden">Catalogo</span>
          </Link>

          <div className="flex items-center gap-3 truncate">
            <span className="font-extrabold text-xs sm:text-sm text-white truncate hidden xs:inline">
              {vehicle.make} {vehicle.model}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#E5A93C] shrink-0">
              {formatPrice(vehicle.price)}
              {vehicle.is_vat_deductible && <span className="text-[10px] text-[#94A3B8] ml-1 font-normal">iva esposta</span>}
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-transform active:scale-95 shadow-md shadow-[#25D366]/20"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
            <span>Contatta Gabriel</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        {/* 2. HERO PRINCIPALE: GALLERIA FOTOGRAFICA + PANNELLO PREZZO & 8 MICRO-INDICATORI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* COLONNA SINISTRA: FOTO CON RIBBON FINANZIAMENTO & CAROSELLO */}
          <div className="lg:col-span-7 space-y-3">
            {/* Foto Principale */}
            <div
              className="relative aspect-[16/10] bg-[#16181F] rounded-2xl overflow-hidden border border-[#272A34] shadow-2xl select-none group touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[activeImgIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* Ingrandisci Schermo Intero */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md z-10 transition-colors"
                title="Schermo intero"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Frecce Navigazione */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    aria-label="Precedente"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    aria-label="Successiva"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Contatore foto */}
              <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white z-10">
                {activeImgIndex + 1} / {images.length}
              </div>
            </div>

            {/* Carosello Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                      activeImgIndex === idx
                        ? 'border-[#E5A93C] scale-105 shadow-md shadow-[#E5A93C]/30'
                        : 'border-[#272A34] opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`anteprima ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNA DESTRA: TITOLO, PREZZO, CTA PRENOTAZIONE E GRIGLIA SPECIFICHE 8-BOX */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Badge Marca & Neopatentati */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#E5A93C]">
                  {vehicle.make}
                </span>
                {vehicle.status === 'incoming' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#8B5CF6]/50 animate-pulse">
                    In Arrivo
                  </span>
                )}
                {vehicle.status === 'negotiating' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                    In Trattativa
                  </span>
                )}
                {vehicle.status === 'sold' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#64748B]/30 text-[#94A3B8] border border-[#64748B]/40">
                    Venduta
                  </span>
                )}
                {vehicle.is_for_neopatentati === 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
                    Idonea Neopatentati
                  </span>
                )}
                {vehicle.is_vat_deductible && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                    IVA Deducibile
                  </span>
                )}
              </div>

              {/* Titolo & Allestimento */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                {vehicle.model}
              </h1>

              {/* Prezzo & Listino da nuova */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatPrice(vehicle.price)}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {vehicle.is_vat_deductible ? 'iva esposta' : 'chiavi in mano'}
                </span>
                {vehicle.original_price && (
                  <span className="text-xs text-[#64748B] line-through ml-2">
                    Listino: {formatPrice(vehicle.original_price)}
                  </span>
                )}
              </div>

              {/* GRIGLIA A 8-10 MICRO-INDICATORI CON ICONE (identica al benchmark Auto Lazeta) */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#16181F] rounded-2xl border border-[#272A34] text-xs">
                {/* 1. Anno */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Calendar className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Anno</span>
                    <strong className="text-white font-bold">{vehicle.month || vehicle.year}</strong>
                  </div>
                </div>

                {/* 2. Km */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Gauge className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Km certificati</span>
                    <strong className="text-white font-bold">{vehicle.mileage.toLocaleString()} Km</strong>
                  </div>
                </div>

                {/* 3. Alimentazione */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Fuel className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Alimentazione</span>
                    <strong className="text-white font-bold truncate">{vehicle.fuel_type}</strong>
                  </div>
                </div>

                {/* 4. Cilindrata */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Layers className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Cilindrata</span>
                    <strong className="text-white font-bold">{vehicle.displacement || 'N/D'}</strong>
                  </div>
                </div>

                {/* 5. Trazione */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Car className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Trazione</span>
                    <strong className="text-white font-bold">{vehicle.traction || 'Anteriore'}</strong>
                  </div>
                </div>

                {/* 6. Cambio */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Cog className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Cambio</span>
                    <strong className="text-white font-bold truncate">{vehicle.transmission}</strong>
                  </div>
                </div>

                {/* 7. Normativa */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <ShieldCheck className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Normativa</span>
                    <strong className="text-white font-bold">{vehicle.euro_class || 'Euro 6D'}</strong>
                  </div>
                </div>

                {/* 8. Potenza */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1E26] border border-[#272A34]/60">
                  <Zap className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#94A3B8] leading-none">Potenza</span>
                    <strong className="text-white font-bold">{vehicle.power_kw} kW {cv ? `(${cv} cv)` : ''}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Condividi Su */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-semibold text-white">Condividi annuncio:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Guarda questa ${vehicle.make} ${vehicle.model} su G.Z. Auto Usate: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] font-bold flex items-center gap-1 border border-[#10B981]/30 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1C1E26] hover:bg-[#272A34] text-[#94A3B8] hover:text-white font-bold flex items-center gap-1 border border-[#272A34] transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiato' : 'Copia Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMULATORE FINANZIAMENTO INTERATTIVO (Esattamente come in Immagine 3) */}
        <section className="bg-[#16181F] border border-[#272A34] rounded-3xl p-5 sm:p-8 mb-12 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 w-full space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] bg-[#E5A93C]/10 px-3 py-1 rounded-full border border-[#E5A93C]/20">
                  Piano Personalizzato
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Simulazione Finanziamento G.Z.
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Calcola la rata su misura. Finanziabile anche con <strong>anticipo zero</strong> e nessun vincolo assicurativo.
                </p>
              </div>

              {/* Slider 1: Anticipo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-extrabold text-white">ANTICIPO</span>
                  <span className="text-base font-black text-[#E5A93C]">{formatPrice(downPayment)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.min(vehicle.price * 0.7, 15000)}
                  step={500}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C1E26] rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
                />
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Anticipo 0 €</span>
                  <span>Max {formatPrice(Math.min(vehicle.price * 0.7, 15000))}</span>
                </div>
              </div>

              {/* Slider 2: Durata Mesi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-extrabold text-white">DURATA</span>
                  <span className="text-base font-black text-[#E5A93C]">{durationMonths} mesi ({Math.round(durationMonths / 12)} anni)</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={96}
                  step={12}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full h-2 bg-[#1C1E26] rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>24 mesi</span>
                  <span>96 mesi</span>
                </div>
              </div>
            </div>

            {/* Riquadro / Gauge Rata Circolare (come nello screenshot benchmark) */}
            <div className="w-full lg:w-72 bg-[#1C1E26] p-6 rounded-2xl border-2 border-[#E5A93C]/40 text-center flex flex-col items-center justify-center shrink-0 shadow-xl">
              <div className="relative w-36 h-36 rounded-full border-4 border-rose-600/30 border-t-rose-600 flex flex-col items-center justify-center mb-4">
                <span className="text-xs text-[#94A3B8]">Rata da</span>
                <span className="text-3xl font-black text-white">{monthlyRate} €</span>
                <span className="text-xs text-[#94A3B8]">al mese</span>
              </div>

              <a
                href={whatsappFinanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#25D366]/20"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                <span>Richiedi su WhatsApp</span>
              </a>

              <span className="text-[10px] text-[#64748B] mt-2 block">
                TAN 6.95% - TAEG indicativo. Salvo approvazione finanziaria.
              </span>
            </div>
          </div>
        </section>

        {/* 4. LAYOUT SCHEDA DETTAGLIATA (SPECIFICHE CON TABS + FORM RICHIEDI INFORMAZIONI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* COLONNA SINISTRA (7 col): SPECIFICHE CON TABS & NOTE DI GABRIEL */}
          <div className="lg:col-span-7 space-y-8">
            {/* Box Specifiche Tecniche con Tab: Informazioni / Consumi / Optional */}
            <div className="bg-[#16181F] p-5 sm:p-7 rounded-3xl border border-[#272A34] shadow-xl">
              <h2 className="text-xl font-black text-white mb-4">Specifiche Tecniche</h2>

              {/* Tab Selector (Informazioni, Consumi, Dotazioni/Optional) */}
              <div className="flex gap-2 border-b border-[#272A34] pb-3 mb-6 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveSpecTab('info')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    activeSpecTab === 'info'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-[#1C1E26] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Informazioni
                </button>
                <button
                  onClick={() => setActiveSpecTab('consumi')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    activeSpecTab === 'consumi'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-[#1C1E26] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Consumi & Emissioni
                </button>
                <button
                  onClick={() => setActiveSpecTab('optional')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    activeSpecTab === 'optional'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-[#1C1E26] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Optional & Dotazioni ({vehicle.features_list?.length || 20})
                </button>
              </div>

              {/* TAB 1: INFORMAZIONI GENERALI (Motore, Trasmissione, Altre Informazioni con Targa e Telaio) */}
              {activeSpecTab === 'info' && (
                <div className="space-y-6 text-xs sm:text-sm">
                  {/* Sezione Motore */}
                  <div>
                    <h3 className="text-rose-500 font-extrabold text-sm uppercase tracking-wider mb-2.5 pb-1 border-b border-[#272A34]">
                      Motore
                    </h3>
                    <div className="divide-y divide-[#272A34]">
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Cilindrata:</span>
                        <strong className="text-white font-bold">{vehicle.displacement || 'N/D'}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Potenza:</span>
                        <strong className="text-white font-bold">{vehicle.power_kw} kW {cv ? `(${cv} cv)` : ''}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Cilindri:</span>
                        <strong className="text-white font-bold">{vehicle.cylinders || 4}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Normativa Euro:</span>
                        <strong className="text-white font-bold">{vehicle.euro_class || 'Euro 6D'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Sezione Trasmissione */}
                  <div>
                    <h3 className="text-rose-500 font-extrabold text-sm uppercase tracking-wider mb-2.5 pb-1 border-b border-[#272A34]">
                      Trasmissione
                    </h3>
                    <div className="divide-y divide-[#272A34]">
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Cambio:</span>
                        <strong className="text-white font-bold">{vehicle.transmission_gears || vehicle.transmission}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Trazione:</span>
                        <strong className="text-white font-bold">{vehicle.traction || 'Anteriore'}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Porte / Posti:</span>
                        <strong className="text-white font-bold">{vehicle.doors || 5} porte • {vehicle.seats || 5} posti</strong>
                      </div>
                    </div>
                  </div>

                  {/* Sezione Altre Informazioni (Trasparenza Targa & Telaio VIN) */}
                  <div>
                    <h3 className="text-rose-500 font-extrabold text-sm uppercase tracking-wider mb-2.5 pb-1 border-b border-[#272A34]">
                      Altre Informazioni & Trasparenza
                    </h3>
                    <div className="divide-y divide-[#272A34]">
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Garanzia:</span>
                        <strong className="text-[#10B981] font-bold">12 mesi inclusa (estendibile fino a 60 mesi)</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Targa Vettura:</span>
                        <strong className="text-white font-mono font-bold bg-[#1C1E26] px-2 py-0.5 rounded border border-[#272A34]">
                          {vehicle.plate || 'In fase di immatricolazione'}
                        </strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Numero di Telaio (VIN):</span>
                        <strong className="text-[#E5A93C] font-mono font-bold text-xs">
                          {vehicle.vin || 'Disponibile su richiesta'}
                        </strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Revisione Valida fino a:</span>
                        <strong className="text-white font-bold">{vehicle.revision_valid_until || '24 mesi da consegna'}</strong>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[#94A3B8]">Colore Interni:</span>
                        <strong className="text-white font-bold">{vehicle.interior_color || 'Tessuto comfort'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONSUMI & EMISSIONI */}
              {activeSpecTab === 'consumi' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-[#1C1E26] border border-[#272A34] space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-[#272A34]">
                      <span className="text-[#94A3B8]">Consumo Misto Combinato:</span>
                      <strong className="text-white font-bold">{vehicle.consumption || '4.5 l/100 km'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#272A34]">
                      <span className="text-[#94A3B8]">Consumo Urbano:</span>
                      <strong className="text-white font-bold">{vehicle.consumption_urban || '5.2 l/100 km'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#272A34]">
                      <span className="text-[#94A3B8]">Consumo Extraurbano:</span>
                      <strong className="text-white font-bold">{vehicle.consumption_extra || '3.8 l/100 km'}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#94A3B8]">Omologazione Ambientale:</span>
                      <strong className="text-[#10B981] font-bold">{vehicle.euro_class || 'Euro 6D'}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    I valori di consumo sono dichiarati secondo ciclo WLTP/NEDC ufficiale del costruttore.
                  </p>
                </div>
              )}

              {/* TAB 3: OPTIONAL & DOTAZIONI COMPLETE */}
              {activeSpecTab === 'optional' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                    {(vehicle.features_list || []).map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1C1E26] border border-[#272A34] text-xs text-gray-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BOX PROTAGONISTA "DESCRIZIONE - CERTIFICAZIONE 68 CONTROLLI" */}
            <div className="bg-gradient-to-br from-[#1C1E26] via-[#16181F] to-[#1C1E26] border-2 border-[#E5A93C] rounded-3xl p-6 sm:p-7 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#272A34] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E5A93C] to-[#B37B1B] flex items-center justify-center font-black text-black text-sm tracking-wider shadow-md shadow-[#E5A93C]/30 shrink-0">
                    GZ
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Descrizione</h3>
                    <p className="text-xs text-[#E5A93C] font-semibold">G.Z. Auto Usate • Castelvetro Piacentino</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#E5A93C]/15 text-[#E5A93C] px-3 py-1 rounded-full border border-[#E5A93C]/30 hidden sm:inline-block">
                  Certificazione Reale
                </span>
              </div>

              {/* Testo Descrizione */}
              <div className="bg-[#0F1015]/90 p-4 rounded-xl border border-[#272A34] mb-4 text-xs sm:text-sm text-gray-200 leading-relaxed italic whitespace-pre-line">
                "{vehicle.gabriel_notes}"
              </div>

              {/* Protocollo 68 Controlli & Igienizzazione (ispirato al benchmark) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#16181F] p-3 rounded-xl border border-[#272A34] flex items-center gap-2 text-[#94A3B8]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span><strong>68 controlli</strong> prima della consegna</span>
                </div>
                <div className="bg-[#16181F] p-3 rounded-xl border border-[#272A34] flex items-center gap-2 text-[#94A3B8]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span><strong>Igienizzazione profonda</strong> con ozono</span>
                </div>
                <div className="bg-[#16181F] p-3 rounded-xl border border-[#272A34] flex items-center gap-2 text-[#94A3B8]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span><strong>Attestato lavori</strong> rilasciato</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNA DESTRA (5 col): CARD "RICHIEDI INFORMAZIONI" STICKY (Come nello screenshot benchmark) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 bg-[#16181F] p-6 rounded-3xl border border-[#272A34] shadow-2xl">
              <h3 className="text-xl font-black text-rose-500 mb-1">Richiedi Informazioni</h3>
              <p className="text-xs text-[#94A3B8] mb-5">
                Contatta Gabriel per avere ogni dettaglio, storico o concordare un appuntamento in sede.
              </p>

              {contactSent ? (
                <div className="bg-[#1C1E26] p-6 rounded-2xl border border-[#10B981]/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Richiesta Ricevuta!</h4>
                  <p className="text-xs text-[#94A3B8]">
                    Gabriel ti contatterà entro breve al recapito indicato.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-md shadow-[#25D366]/20"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>Scrivici subito su WhatsApp</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSendContact} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Il tuo Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Mario Rossi"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="mario@esempio.it"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Telefono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="348 1234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-[11px] text-[#94A3B8]">
                    <input type="checkbox" required id="privacy" className="mt-0.5 rounded text-rose-500 bg-[#1C1E26] border-[#272A34]" />
                    <label htmlFor="privacy" className="cursor-pointer">
                      Accetto che questo sito memorizzi le informazioni inviate in modo da rispondere alla mia richiesta.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-900/30 transition-transform active:scale-95 cursor-pointer"
                  >
                    INVIA RICHIESTA
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[#272A34]" />
                    <span className="flex-shrink mx-2 text-[10px] text-[#64748B] uppercase font-bold">oppure</span>
                    <div className="flex-grow border-t border-[#272A34]" />
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#25D366]/20"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Contatta Gabriel su WhatsApp</span>
                  </a>
                </form>
              )}

              {/* Garanzia G.Z. Trasparenza Box */}
              <div className="mt-6 pt-5 border-t border-[#272A34] space-y-2 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Garanzie G.Z. Auto di Gabriel:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ✓ Nessun vincolo di finanziamento obbligatorio.<br />
                  ✓ Chilometraggio contrattuale garantito e certificato.<br />
                  ✓ Tagliando preconsegna e lavaggio interni con ozono inclusi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SEZIONE "MASSIMA TRASPARENZA & SERVIZI AGGIUNTIVI G.Z." (Ispirata al testo dell'annuncio) */}
        <section className="bg-[#16181F] border border-[#272A34] rounded-3xl p-6 sm:p-10 mb-12 shadow-2xl">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] bg-[#E5A93C]/10 px-3.5 py-1.5 rounded-full border border-[#E5A93C]/20 inline-flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Trasparenza Totale • Premium Selection</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Perché acquistare da G.Z. Auto Usate
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#1C1E26] border border-[#272A34] space-y-1.5">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#E5A93C]" />
                  <span>Chilometri Garantiti & Targa Visibile</span>
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Numero di targa e telaio sempre visibili in chiaro prima dell'acquisto. I chilometri percorsi sono garantiti e certificati per iscritto in fattura e a contratto.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1E26] border border-[#272A34] space-y-1.5">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>68 Controlli Tecnici & Tagliando Preconsegna</span>
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Ogni veicolo viene sottoposto a 68 verifiche approfondite di officina (freni, ammortizzatori, impianto elettrico, pneumatici) con attestato dei lavori effettuati.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1E26] border border-[#272A34] space-y-1.5">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#38BDF8]" />
                  <span>Valutazione Usato & Permuta Immediata</span>
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Valutiamo il tuo usato in modo trasparente e competitivo scalando l'importo direttamente dal saldo o dalla rata del finanziamento, oppure lo ritiriamo in caso di rottamazione.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1E26] border border-[#272A34] space-y-1.5">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Pacchetti Assicurativi Personalizzati</span>
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Disponibilità di pacchetti RCA, furto, incendio, atti vandalici, cristalli e kasko con valore a nuovo garantito e franchigie azzerate.
                </p>
              </div>
            </div>

            {/* DOVE SIAMO & ORARI (Castelvetro Piacentino PC) */}
            <div className="pt-6 border-t border-[#272A34] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#94A3B8]">
              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E5A93C]" />
                  <span>Sede Espositiva & Vendita:</span>
                </h4>
                <p className="text-white font-medium">G.Z. Auto Usate di Gabriel</p>
                <p>Via Statale 30, Castelvetro Piacentino (PC) – CAP 29010</p>
                <p className="mt-1 text-[11px] text-[#E5A93C]">A 8 minuti da Cremona e 15 minuti da Piacenza</p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#E5A93C]" />
                  <span>Orari di Apertura:</span>
                </h4>
                <p>Lunedì - Venerdì: 08:30 - 12:30 / 14:30 - 19:00</p>
                <p>Sabato: 08:30 - 12:30 / 14:30 - 18:30 (Domenica su appuntamento)</p>
                <p className="mt-1 text-white font-bold">Telefono diretto Gabriel: +39 348 7051158</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 6. STICKY ACTION BAR FISSA IN BASSO DA MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16181F]/95 backdrop-blur-lg border-t border-[#272A34] px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#94A3B8] block">Prezzo Chiavi in Mano</span>
            <span className="text-lg font-black text-white leading-none">
              {formatPrice(vehicle.price)}
            </span>
            <span className="text-[10px] text-[#E5A93C] block font-bold mt-0.5">
              o da {monthlyRate} €/mese
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] active:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#25D366]/30 transition-transform active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span className="truncate">Prenota visione WhatsApp</span>
          </a>
        </div>
      </div>

      {/* LIGHTBOX GALLERIA A SCHERMO INTERO RESPONSIVE */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full py-2">
            <div>
              <span className="font-bold text-sm sm:text-base">{vehicle.make} {vehicle.model}</span>
              <span className="text-xs text-[#94A3B8] ml-3">Foto {activeImgIndex + 1} di {images.length}</span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Chiudi"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative max-w-6xl mx-auto w-full my-2">
            <img
              src={images[activeImgIndex]}
              alt=""
              className="max-h-[75vh] max-w-full object-contain rounded-xl select-none"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          <div className="max-w-4xl mx-auto w-full flex gap-2 overflow-x-auto justify-center py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 ${
                  activeImgIndex === idx ? 'border-[#E5A93C]' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
