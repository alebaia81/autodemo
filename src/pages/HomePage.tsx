import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  Zap, 
  ArrowDown, 
  Banknote, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Filter,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Vehicle } from '../types/vehicle';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleRowCard } from '../components/VehicleRowCard';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

type QuickFilter = 'all' | 'incoming' | 'neopatentati' | 'diesel' | 'benzina' | 'under10k' | 'hybrid_gpl' | 'available';

export const HomePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout View Switcher: 'list' (orizzontale come nel benchmark) vs 'grid' (griglia)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Search & Active Quick Filter
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const catalogRef = useRef<HTMLDivElement>(null);

  // Advanced Sidebar Filters
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'km_asc' | 'year_desc'>('price_desc');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [maxKm, setMaxKm] = useState<number>(300000);
  const [minYear, setMinYear] = useState<string>('all');
  const [maxYear, setMaxYear] = useState<string>('all');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Errore caricamento veicoli:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleSync = () => {
      api.getVehicles().then(setVehicles).catch(console.error);
    };

    window.addEventListener('gz_vehicles_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('gz_vehicles_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Unique makes
  const availableMakes = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => set.add(v.make));
    return Array.from(set).sort();
  }, [vehicles]);

  // Unique body types
  const availableBodyTypes = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => {
      if (v.body_type) set.add(v.body_type);
    });
    return Array.from(set).sort();
  }, [vehicles]);

  // Unique years for filtering (Da... A...)
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    vehicles.forEach(v => {
      if (v.year) set.add(v.year);
    });
    const current = new Date().getFullYear();
    for (let y = current; y >= 2008; y--) set.add(y);
    return Array.from(set).sort((a, b) => b - a);
  }, [vehicles]);

  // Filtered and Sorted vehicles
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(v => {
      // Quick Chip filter logic
      switch (activeFilter) {
        case 'incoming':
          if (v.status !== 'incoming') return false;
          break;
        case 'neopatentati':
          if (v.is_for_neopatentati !== 1) return false;
          break;
        case 'diesel':
          if (v.fuel_type.toLowerCase() !== 'diesel') return false;
          break;
        case 'benzina':
          if (v.fuel_type.toLowerCase() !== 'benzina') return false;
          break;
        case 'under10k':
          if (v.price > 10000) return false;
          break;
        case 'hybrid_gpl':
          if (!v.fuel_type.toLowerCase().includes('ibrid') && !v.fuel_type.toLowerCase().includes('gpl')) return false;
          break;
        case 'available':
          if (v.status !== 'available') return false;
          break;
        case 'all':
        default:
          break;
      }

      // Sidebar Filters
      if (maxPrice < 100000 && v.price > maxPrice) return false;
      if (maxKm < 300000 && v.mileage > maxKm) return false;
      if (minYear !== 'all' && v.year < Number(minYear)) return false;
      if (maxYear !== 'all' && v.year > Number(maxYear)) return false;
      if (selectedMake !== 'all' && v.make.toLowerCase() !== selectedMake.toLowerCase()) return false;
      if (selectedBodyType !== 'all' && v.body_type?.toLowerCase() !== selectedBodyType.toLowerCase()) return false;
      if (selectedFuel !== 'all' && v.fuel_type.toLowerCase() !== selectedFuel.toLowerCase()) return false;
      if (selectedTransmission !== 'all' && !v.transmission.toLowerCase().includes(selectedTransmission.toLowerCase())) return false;

      // Full-text search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const fullString = `${v.make} ${v.model} ${v.fuel_type} ${v.transmission} ${v.year} ${v.plate || ''} ${v.gabriel_notes}`.toLowerCase();
        if (!fullString.includes(q)) return false;
      }

      return true;
    });

    // Sorting: VEICOLI "IN EVIDENZA" (is_featured === 1) VENGONO SEMPRE POSIZIONATI IN CIMA (TOP PAGINA)!
    result.sort((a, b) => {
      const featA = a.is_featured === 1 ? 1 : 0;
      const featB = b.is_featured === 1 ? 1 : 0;
      if (featA !== featB) {
        return featB - featA; // 1 prima di 0 (In Evidenza Top Pagina)
      }

      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'km_asc':
          return a.mileage - b.mileage;
        case 'year_desc':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    return result;
  }, [
    vehicles, 
    activeFilter, 
    maxPrice, 
    maxKm,
    minYear,
    maxYear,
    selectedMake, 
    selectedBodyType, 
    selectedFuel, 
    selectedTransmission, 
    search, 
    sortBy
  ]);

  const resetAllFilters = () => {
    setActiveFilter('all');
    setSearch('');
    setMaxPrice(100000);
    setMaxKm(300000);
    setMinYear('all');
    setMaxYear('all');
    setSelectedMake('all');
    setSelectedBodyType('all');
    setSelectedFuel('all');
    setSelectedTransmission('all');
    setSortBy('price_desc');
  };

  const hasActiveFilters = 
    activeFilter !== 'all' || 
    search.trim().length > 0 || 
    maxPrice < 100000 || 
    maxKm < 300000 || 
    minYear !== 'all' ||
    maxYear !== 'all' ||
    selectedMake !== 'all' || 
    selectedBodyType !== 'all' || 
    selectedFuel !== 'all' || 
    selectedTransmission !== 'all' || 
    sortBy !== 'price_desc';

  return (
    <div className="min-h-screen bg-[#0F1015]">
      {/* 1. CINEMATIC LUXURY HERO HEADER (ISPIRATO AL BENCHMARK PREMIUMCARS.NL) */}
      <section className="relative min-h-[82vh] sm:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#0A0B0E]">
        {/* Background Vettura ad Altissima Definizione in Movimento */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=95"
            alt="G.Z. Auto Usate Castelvetro Piacentino"
            className="w-full h-full object-cover object-[78%_center] sm:object-[70%_center] md:object-[62%_center] transform scale-105 transition-transform duration-1000 ease-out brightness-105 contrast-105"
          />

          {/* Overlay Cinematico: Sfumatura dall'alto su mobile per proteggere il testo lasciando nitida la vettura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1015]/90 via-[#0F1015]/35 to-transparent sm:hidden" />
          {/* Overlay Desktop: Sfumatura morbida sul testo a sinistra, lasciando nitido e illuminato il retro della Porsche a destra */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#0F1015]/95 via-[#0F1015]/55 md:via-[#0F1015]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1015]/85 via-transparent to-[#0F1015]/10" />
        </div>

        {/* Spazio Superiore per Navbar */}
        <div className="pt-2 sm:pt-8" />

        {/* Contenuto Hero: Posizionato in alto su mobile per non coprire la vettura, centrato su desktop */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-2 sm:py-12 sm:my-auto">
          <div className="max-w-2xl">
            {/* Headline Principale in Font Serif Editoriale (Identica a PREMIUMCARS.NL) */}
            <h1 className="font-serif text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.12] sm:leading-[1.08] mb-3 sm:mb-6 max-w-xl">
              Il viaggio verso la tua <span className="italic font-medium text-[#FFFFFF]">prossima auto.</span>
            </h1>

            {/* Pulsanti di Azione: Compatti e affiancati su mobile per non coprire l'auto, ampi su desktop */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-4 mt-4 sm:mt-12">
              <button
                onClick={scrollToCatalog}
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-base transition-all duration-300 shadow-xl shadow-[#E5A93C]/20 active:scale-95 cursor-pointer shrink-0 sm:shrink"
              >
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-black text-[#E5A93C] flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="sm:hidden">Parco auto</span>
                <span className="hidden sm:inline">Guarda subito il nostro parco auto</span>
              </button>

              <Link
                to="/vendi-auto"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-base border border-white/20 backdrop-blur-md transition-all active:scale-95 shrink-0 sm:shrink"
              >
                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5A93C] shrink-0" />
                <span className="sm:hidden">Vendi auto</span>
                <span className="hidden sm:inline">Vuoi vendere la tua auto?</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Barra Inferiore dell'Hero (Identico a PREMIUMCARS.NL) */}
        <div className="relative z-10 border-t border-white/10 bg-[#0F1015]/60 backdrop-blur-md py-2.5 sm:py-3.5 px-4 sm:px-8 text-xs text-[#94A3B8]">
          <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2">
            {/* Sinistra: Stato e Orario */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <span className="text-white font-medium">Castelvetro Piacentino</span>
              <span className="text-[#64748B]">•</span>
              <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="text-[#94A3B8]">Aperto fino alle 19:30</span>
            </div>

            {/* Centro: Scroll con freccia animata */}
            <button
              onClick={scrollToCatalog}
              className="hidden md:flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="text-xs font-semibold tracking-wider">Scroll</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATALOGO STOCK CON SIDEBAR FILTRI & VISTA LISTA ORIZZONTALE */}
      <section id="catalogo" ref={catalogRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 scroll-mt-20">
        {/* Barra di Ricerca & Quick Chips Touch */}
        <div className="bg-[#16181F] p-4 sm:p-5 rounded-2xl border border-[#272A34] mb-6 shadow-xl">
          <div className="relative mb-3.5">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca per marca, modello, targa o parola chiave (es. Golf, 500, GPL, Diesel)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E5A93C] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar select-none touch-pan-x">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
              }`}
            >
              Tutte ({vehicles.length})
            </button>

            <button
              onClick={() => setActiveFilter('incoming')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'incoming'
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                  : 'bg-[#1C1E26] text-[#C4B5FD] border-[#272A34] hover:text-white'
              }`}
            >
              <span>In Arrivo ({vehicles.filter(v => v.status === 'incoming').length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('neopatentati')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'neopatentati'
                  ? 'bg-[#38BDF8] text-black border-[#38BDF8]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-[#38BDF8]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Neopatentati</span>
            </button>

            <button
              onClick={() => setActiveFilter('diesel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'diesel'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
              }`}
            >
              Diesel
            </button>

            <button
              onClick={() => setActiveFilter('benzina')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'benzina'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
              }`}
            >
              Benzina
            </button>

            <button
              onClick={() => setActiveFilter('under10k')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'under10k'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
              }`}
            >
              Meno di 10.000 €
            </button>

            <button
              onClick={() => setActiveFilter('hybrid_gpl')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'hybrid_gpl'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
              }`}
            >
              Ibrida / GPL
            </button>

            <button
              onClick={() => setActiveFilter('available')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                activeFilter === 'available'
                  ? 'bg-[#10B981] text-black border-[#10B981]'
                  : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-[#10B981]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Disponibili</span>
            </button>
          </div>
        </div>

        {/* Toolbar Superiore: Conteggio, Filtri Mobile Toggle & Switcher Vista Griglia/Lista */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#272A34]">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-[#94A3B8]">
              Mostrando <strong className="text-white font-extrabold">{filteredVehicles.length}</strong> auto
            </span>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1E26] text-white text-xs font-bold border border-[#272A34]"
            >
              <Filter className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Filtri Avanzati</span>
            </button>
          </div>

          {/* Toggle Vista Griglia vs Vista Lista Orizzontale */}
          <div className="flex items-center gap-1 bg-[#16181F] p-1 rounded-xl border border-[#272A34]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                viewMode === 'list'
                  ? 'bg-[#E5A93C] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Vista Orizzontale a Lista"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                viewMode === 'grid'
                  ? 'bg-[#E5A93C] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Vista Griglia Compatta"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Griglia</span>
            </button>
          </div>
        </div>

        {/* GRID PRINCIPALE: SIDEBAR FILTRI A SINISTRA + ELENCO VEICOLI A DESTRA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR FILTRI */}
          <aside className={`lg:col-span-3 lg:block ${showMobileFilters ? 'block' : 'hidden'} bg-[#16181F] p-5 rounded-3xl border border-[#272A34] space-y-6 shadow-xl`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#272A34]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E5A93C]" />
                <h3 className="font-black text-white text-base uppercase tracking-wider">FILTRI</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="px-2.5 py-1 rounded-lg bg-[#E5A93C]/20 hover:bg-[#E5A93C]/30 text-[#E5A93C] text-[11px] font-bold border border-[#E5A93C]/30 transition-colors"
                >
                  Reset Filtri
                </button>
              )}
            </div>

            {/* 1. ORDINA PER */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                ORDINA PER
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="price_desc">Prezzo: decrescente</option>
                <option value="price_asc">Prezzo: crescente</option>
                <option value="km_asc">Chilometri: minori prima</option>
                <option value="year_desc">Anno: più recenti</option>
              </select>
            </div>

            {/* 2. FILTRA PER PREZZO (Range Slider) */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[#94A3B8]">FILTRA PER PREZZO</span>
                <span className="font-black text-white">
                  {maxPrice >= 100000 ? 'Tutti i prezzi' : `Fino a ${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(maxPrice)}`}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={2500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1C1E26] rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
                <span>Da 5.000 €</span>
                <span>100.000 €+ (Tutti)</span>
              </div>
            </div>

            {/* 3. FILTRA PER KM (Range Slider) */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[#94A3B8]">FILTRA PER KM</span>
                <span className="font-black text-white">
                  {maxKm >= 300000 ? 'Tutti i km' : `Fino a ${maxKm.toLocaleString()} km`}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={300000}
                step={10000}
                value={maxKm}
                onChange={(e) => setMaxKm(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1C1E26] rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
                <span>10.000 km</span>
                <span>300.000 km+ (Tutti)</span>
              </div>
            </div>

            {/* 4. ANNO IMMATRICOLAZIONE (DA... A...) */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                ANNO IMMATRICOLAZIONE
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-[#64748B] mb-0.5">Da anno:</span>
                  <select
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C] cursor-pointer"
                  >
                    <option value="all">Da (qualsiasi)</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block text-[10px] text-[#64748B] mb-0.5">A anno:</span>
                  <select
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C] cursor-pointer"
                  >
                    <option value="all">A (qualsiasi)</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 5. MARCA */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                MARCA
              </label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="all">Tutte le marche</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 5. CARROZZERIA */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                CARROZZERIA
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="all">Tutti i tipi</option>
                {availableBodyTypes.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 6. ALIMENTAZIONE */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                ALIMENTAZIONE
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="all">Tutti i carburanti</option>
                <option value="Benzina">Benzina</option>
                <option value="Diesel">Diesel</option>
                <option value="Ibrida">Ibrida</option>
                <option value="Benzina/GPL">GPL</option>
              </select>
            </div>

            {/* 7. CAMBIO */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                CAMBIO
              </label>
              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="all">Tutti i cambi</option>
                <option value="Manuale">Manuale</option>
                <option value="Automatico">Automatico</option>
              </select>
            </div>
          </aside>

          {/* ELENCO VEICOLI */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#16181F] rounded-2xl h-64 animate-pulse border border-[#272A34]" />
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="bg-[#16181F] rounded-3xl border border-[#272A34] p-10 text-center max-w-md mx-auto">
                <SlidersHorizontal className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-2">Nessun veicolo corrisponde ai filtri</h3>
                <p className="text-xs text-[#94A3B8] mb-6">
                  Modifica i parametri o chiedi a Gabriel se ha un modello in arrivo non ancora pubblicato.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#E5A93C] text-black font-extrabold text-xs"
                >
                  Azzera tutti i filtri
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleRowCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Funnel Box Ritiro Immediato */}
        <div className="mt-16 bg-gradient-to-r from-[#1C1E26] via-[#16181F] to-[#1C1E26] border border-[#E5A93C]/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] bg-[#E5A93C]/10 px-3 py-1 rounded-full border border-[#E5A93C]/20">
              Castelvetro Piacentino
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
              Acquistiamo la tua auto usata in 24 ore
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mb-6 leading-relaxed">
              Ricevi una stima reale e trasparente. Pagamento con bonifico istantaneo garantito e tutte le pratiche di passaggio a carico nostro.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/vendi-auto"
                className="px-6 py-3 rounded-xl bg-[#E5A93C] text-black font-extrabold text-xs sm:text-sm hover:bg-[#F59E0B] transition-transform active:scale-95 shadow-md shadow-[#E5A93C]/25"
              >
                Compila il modulo di valutazione
              </Link>
              <a
                href="https://wa.me/393487051158?text=Ciao%20Gabriel,%20vorrei%20vendere%20la%20mia%20auto"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Scrivi direttamente su WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
