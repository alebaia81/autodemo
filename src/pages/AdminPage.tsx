import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Car, 
  RefreshCw, 
  Search, 
  X, 
  Check, 
  Copy, 
  Share2, 
  Edit3, 
  Camera, 
  Upload, 
  MessageSquare,
  Delete,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { Vehicle, VehicleStatus, ValuationRequest } from '../types/vehicle';

// Comprime le immagini lato client (max 1280px, JPEG 0.8) per evitare di saturare la quota del browser
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1990 + 2 }, (_, i) => CURRENT_YEAR + 1 - i);

const MONTH_OPTIONS = [
  { value: '01', label: '01 - Gennaio' },
  { value: '02', label: '02 - Febbraio' },
  { value: '03', label: '03 - Marzo' },
  { value: '04', label: '04 - Aprile' },
  { value: '05', label: '05 - Maggio' },
  { value: '06', label: '06 - Giugno' },
  { value: '07', label: '07 - Luglio' },
  { value: '08', label: '08 - Agosto' },
  { value: '09', label: '09 - Settembre' },
  { value: '10', label: '10 - Ottobre' },
  { value: '11', label: '11 - Novembre' },
  { value: '12', label: '12 - Dicembre' },
];

const DISPLACEMENT_OPTIONS = [
  '800 cc',
  '900 cc',
  '999 cc (1.0)',
  '1.000 cc',
  '1.199 cc (1.2)',
  '1.200 cc',
  '1.248 cc (1.3 Multijet)',
  '1.300 cc',
  '1.332 cc (1.3 Turbo)',
  '1.395 cc (1.4 TSI/TFSI)',
  '1.400 cc',
  '1.461 cc (1.5 dCi)',
  '1.498 cc (1.5 TSI)',
  '1.500 cc',
  '1.560 cc (1.6 HDi/TDCi)',
  '1.598 cc (1.6 TDI/CRDi)',
  '1.600 cc',
  '1.798 cc (1.8 Hybrid)',
  '1.800 cc',
  '1.896 cc (1.9 TDI)',
  '1.900 cc',
  '1.968 cc (2.0 TDI)',
  '1.995 cc (2.0 Diesel/Benzina)',
  '1.998 cc (2.0 Turbo Benzina)',
  '2.000 cc',
  '2.143 cc (2.2 CDI)',
  '2.179 cc (2.2 HDi/JTD)',
  '2.200 cc',
  '2.480 cc (2.5 TFSI)',
  '2.500 cc',
  '2.894 cc (2.9 V6 Biturbo)',
  '2.967 cc (3.0 V6 TDI)',
  '2.979 cc (3.0 TwinPower)',
  '2.995 cc (3.0 V6 TFSI)',
  '3.000 cc',
  '3.500 cc',
  '3.996 cc (4.0 V8 Biturbo)',
  '4.000 cc',
  '5.000 cc',
  '0 cc (100% Elettrica)'
];

const EURO_CLASS_OPTIONS = [
  'Euro 6D',
  'Euro 6D-Temp',
  'Euro 6D-ISC-FCM',
  'Euro 6D-Final',
  'Euro 6C',
  'Euro 6B',
  'Euro 6',
  'Euro 5B',
  'Euro 5A',
  'Euro 5',
  'Euro 4',
  'Euro 3',
  'Euro 2',
  'Euro 1',
  'Zero Emissioni (Elettrica)'
];

const BODY_TYPE_OPTIONS = [
  { value: 'SUV', label: 'SUV / Crossover' },
  { value: 'Station Wagon', label: 'Station Wagon' },
  { value: 'Berlina', label: 'Berlina' },
  { value: 'Compatta', label: 'Compatta (2 Volumi)' },
  { value: 'City car', label: 'Utilitaria / City Car' },
  { value: 'Coupé', label: 'Coupé' },
  { value: 'Cabrio', label: 'Cabriolet / Spider' },
  { value: 'Monovolume', label: 'Monovolume / Minivan' },
  { value: 'Furgone', label: 'Furgone / Van' },
  { value: 'Fuoristrada', label: 'Fuoristrada / Pick-up' }
];

const FUEL_TYPE_OPTIONS = [
  'Diesel',
  'Benzina',
  'Ibrida',
  'Elettrica',
  'Benzina/GPL',
  'Metano'
];

const TRANSMISSION_OPTIONS = [
  'Manuale',
  'Automatico',
  'Automatico DSG',
  'Automatico S-Tronic',
  'Sequenziale'
];

const TRACTION_OPTIONS = [
  'Anteriore',
  'Posteriore',
  'Integrale (4x4)'
];

const DOORS_OPTIONS = [2, 3, 4, 5, 6];
const SEATS_OPTIONS = [2, 4, 5, 6, 7, 8, 9];

const COLOR_OPTIONS = [
  'Grigio Metallizzato',
  'Nero Metallizzato',
  'Nero Pastello',
  'Bianco Pastello',
  'Bianco Perlato',
  'Grigio Scuro / Antracite',
  'Grigio Chiaro / Argento',
  'Grigio Nardo / Gesso',
  'Blu Metallizzato',
  'Blu Notte',
  'Rosso Corsa / Metallizzato',
  'Bordeaux',
  'Verde Metallizzato',
  'Marrone / Bronzo',
  'Giallo / Oro',
  'Arancione'
];

const INTERIOR_OPTIONS = [
  'Pelle Totale Nera',
  'Pelle Totale Marrone / Cognac',
  'Pelle Totale Beige / Crema',
  'Pelle Totale Bianca / Ghiaccio',
  'Pelle Totale Rossa',
  'Pelle & Alcantara Sportiva Nera',
  'Misto Pelle / Tessuto Nero',
  'Tessuto Nero',
  'Tessuto Grigio / Antracite',
  'Tessuto Beige',
  'Alcantara Totale'
];

const REVISION_YEARS = Array.from({ length: 9 }, (_, i) => CURRENT_YEAR + i - 1);

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [pinShake, setPinShake] = useState(false);

  // Dashboard Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [valuations, setValuations] = useState<ValuationRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'valuations'>('inventory');

  // Search & Filter state in Inventory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'incoming' | 'negotiating' | 'sold'>('all');

  // Inline price editing state: { [vehicleId]: string (temporary price input) }
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New vehicle form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    plate: '',
    vin: '',
    price: '',
    original_price: '',
    status: 'available' as VehicleStatus,
    is_for_neopatentati: 0,
    is_featured: 0,
    is_vat_deductible: false,
    year: new Date().getFullYear(),
    month: '',
    mileage: '45000',
    fuel_type: 'Benzina',
    transmission: 'Manuale',
    traction: 'Anteriore',
    power_kw: '70',
    power_cv: '95',
    displacement: '1.200 cc',
    euro_class: 'Euro 6D-Temp',
    body_type: 'SUV',
    doors: 5,
    seats: 5,
    color: 'Grigio Metallizzato',
    interior_color: '',
    revision_valid_until: '',
    gabriel_notes: '',
  });

  // Edit vehicle modal state
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Track custom input visibility for dropdowns with "Personalizzato"
  const [customFieldsNew, setCustomFieldsNew] = useState<Record<string, boolean>>({});
  const [customFieldsEdit, setCustomFieldsEdit] = useState<Record<string, boolean>>({});

  // Check existing session in sessionStorage
  useEffect(() => {
    const checkSession = async () => {
      const active = await api.checkAuthSession();
      if (active) {
        setIsAuthenticated(true);
        loadDashboardData();
      }
    };
    checkSession();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [vList, valList] = await Promise.all([
        api.getVehicles(),
        api.getValuationRequests()
      ]);
      setVehicles(vList);
      setValuations(valList);
    } catch (err) {
      console.error('Errore caricamento dati admin:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // 1. PIN KEYPAD LOGIC (6 CIFRE CON POLLICE)
  const handleDigitPress = (digit: string) => {
    if (pinDigits.length >= 6) return;
    const newDigits = [...pinDigits, digit];
    setPinDigits(newDigits);
    setAuthError('');

    // Se raggiunge la 6° cifra, esegue verifica automatica
    if (newDigits.length === 6) {
      triggerPinVerification(newDigits.join(''));
    }
  };

  const handleBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
    setAuthError('');
  };

  const handleClearPin = () => {
    setPinDigits([]);
    setAuthError('');
  };

  const triggerPinVerification = async (pinString: string) => {
    setLoadingAuth(true);
    try {
      const res = await api.verifyPin(pinString);
      if (res.success) {
        setIsAuthenticated(true);
        setPinDigits([]);
        loadDashboardData();
      } else {
        setAuthError(res.error || 'PIN errato.');
        setPinShake(true);
        setTimeout(() => setPinShake(false), 500);
        setTimeout(() => setPinDigits([]), 600);
      }
    } catch {
      setAuthError('Errore di connessione server Cloudflare.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setPinDigits([]);
  };

  // 2. INVENTARIO: 1-TAP STATUS & INLINE PRICE & SHARE
  const handleStatusChange = async (id: string, newStatus: VehicleStatus) => {
    try {
      await api.updateVehicleStatus(id, newStatus);
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    } catch {
      alert('Errore aggiornamento stato');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: number) => {
    const nextVal = currentFeatured === 1 ? 0 : 1;
    try {
      await api.updateVehicle(id, { is_featured: nextVal });
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, is_featured: nextVal } : v));
    } catch {
      alert('Errore aggiornamento stato In Evidenza');
    }
  };

  const startEditPrice = (v: Vehicle) => {
    setEditingPriceId(v.id);
    setTempPriceValue(v.price.toString());
  };

  const saveInlinePrice = async (id: string) => {
    const num = Number(tempPriceValue);
    if (isNaN(num) || num <= 0) {
      alert('Inserisci un importo valido.');
      return;
    }
    try {
      await api.quickUpdatePrice(id, num);
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, price: num } : v));
      setEditingPriceId(null);
    } catch {
      alert('Errore aggiornamento prezzo');
    }
  };

  const copyVehicleLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/auto/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      prompt('Copia questo link:', url);
    }
  };

  const shareVehicleWhatsApp = (v: Vehicle) => {
    const url = `${window.location.origin}/auto/${v.slug}`;
    const text = encodeURIComponent(
      `Ciao! Ti invio la scheda della nostra ${v.make} ${v.model} (${v.year} - ${v.mileage.toLocaleString()} km) a ${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v.price)}:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDeleteVehicle = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler rimuovere dal sito: ${name}?`)) return;
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch {
      alert('Errore eliminazione veicolo');
    }
  };

  // 3. FOTO UPLOAD & NOTE GABRIEL
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          setUploadedPhotos(prev => [...prev, compressed]);
        }
      } catch (err) {
        console.error('Errore compressione foto:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const setAsCoverPhoto = (index: number) => {
    setUploadedPhotos(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [target, ...remaining];
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addQuickNote = (phrase: string) => {
    setNewVehicle(prev => ({
      ...prev,
      gabriel_notes: prev.gabriel_notes ? `${prev.gabriel_notes} ${phrase}` : phrase
    }));
  };

  const handlePublishVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.make.trim() || !newVehicle.model.trim() || !newVehicle.price) {
      alert('Inserisci almeno Marca, Modello e Prezzo.');
      return;
    }

    const defaultCover = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=85';
    const finalImages = uploadedPhotos.length > 0 ? uploadedPhotos : [defaultCover];

    const slug = `${newVehicle.make}-${newVehicle.model}-${newVehicle.year}-${Date.now().toString().slice(-4)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      await api.createVehicle({
        slug,
        make: newVehicle.make.trim(),
        model: newVehicle.model.trim(),
        plate: newVehicle.plate.trim() || undefined,
        vin: newVehicle.vin.trim() || undefined,
        price: Number(newVehicle.price),
        original_price: newVehicle.original_price ? Number(newVehicle.original_price) : undefined,
        status: newVehicle.status || 'available',
        is_for_neopatentati: newVehicle.is_for_neopatentati,
        is_featured: newVehicle.is_featured,
        is_vat_deductible: Boolean(newVehicle.is_vat_deductible),
        year: Number(newVehicle.year),
        month: newVehicle.month.trim() || undefined,
        mileage: Number(newVehicle.mileage) || 0,
        fuel_type: newVehicle.fuel_type,
        transmission: newVehicle.transmission,
        traction: newVehicle.traction,
        power_kw: Number(newVehicle.power_kw) || 0,
        power_cv: newVehicle.power_cv ? Number(newVehicle.power_cv) : undefined,
        displacement: newVehicle.displacement,
        euro_class: newVehicle.euro_class.trim() || undefined,
        body_type: newVehicle.body_type,
        doors: Number(newVehicle.doors) || 5,
        seats: Number(newVehicle.seats) || 5,
        color: newVehicle.color,
        interior_color: newVehicle.interior_color.trim() || undefined,
        revision_valid_until: newVehicle.revision_valid_until.trim() || undefined,
        gabriel_notes: newVehicle.gabriel_notes.trim(),
        images: JSON.stringify(finalImages),
      });

      alert('Veicolo pubblicato con successo!');
      setUploadedPhotos([]);
      setCustomFieldsNew({});
      setNewVehicle({
        make: '',
        model: '',
        plate: '',
        vin: '',
        price: '',
        original_price: '',
        status: 'available',
        is_for_neopatentati: 0,
        is_featured: 0,
        is_vat_deductible: false,
        year: new Date().getFullYear(),
        month: '',
        mileage: '45000',
        fuel_type: 'Benzina',
        transmission: 'Manuale',
        traction: 'Anteriore',
        power_kw: '70',
        power_cv: '95',
        displacement: '1.200 cc',
        euro_class: 'Euro 6D-Temp',
        body_type: 'SUV',
        doors: 5,
        seats: 5,
        color: 'Grigio Metallizzato',
        interior_color: '',
        revision_valid_until: '',
        gabriel_notes: '',
      });
      setActiveTab('inventory');
      loadDashboardData();
    } catch {
      alert('Errore durante la pubblicazione');
    }
  };

  // MODIFICA ANNUNCIO: APERTURA E SALVATAGGIO
  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
    setCustomFieldsEdit({});
    let photos: string[] = [];
    try {
      const parsed = JSON.parse(vehicle.images);
      if (Array.isArray(parsed)) photos = parsed;
      else if (typeof parsed === 'string') photos = [parsed];
    } catch {
      photos = vehicle.images ? [vehicle.images] : [];
    }
    setEditPhotos(photos);
  };

  const handlePhotoUploadForEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          setEditPhotos(prev => [...prev, compressed]);
        }
      } catch (err) {
        console.error('Errore compressione foto edit:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const setAsEditCoverPhoto = (index: number) => {
    setEditPhotos(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [target, ...remaining];
    });
  };

  const removeEditPhoto = (index: number) => {
    setEditPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addEditQuickNote = (phrase: string) => {
    if (!editingVehicle) return;
    setEditingVehicle(prev => prev ? ({
      ...prev,
      gabriel_notes: prev.gabriel_notes ? `${prev.gabriel_notes} ${phrase}` : phrase
    }) : null);
  };

  const handleSaveEditedVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    if (!editingVehicle.make.trim() || !editingVehicle.model.trim() || !editingVehicle.price) {
      alert('Marca, Modello e Prezzo sono obbligatori.');
      return;
    }

    const defaultCover = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=85';
    const finalImages = editPhotos.length > 0 ? editPhotos : [defaultCover];

    try {
      const updated = await api.updateVehicle(editingVehicle.id, {
        ...editingVehicle,
        price: Number(editingVehicle.price),
        original_price: editingVehicle.original_price ? Number(editingVehicle.original_price) : undefined,
        year: Number(editingVehicle.year),
        mileage: Number(editingVehicle.mileage) || 0,
        power_kw: Number(editingVehicle.power_kw) || 0,
        power_cv: editingVehicle.power_cv ? Number(editingVehicle.power_cv) : undefined,
        doors: Number(editingVehicle.doors) || 5,
        seats: Number(editingVehicle.seats) || 5,
        is_featured: editingVehicle.is_featured === 1 ? 1 : 0,
        images: JSON.stringify(finalImages),
      });

      setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
      setEditingVehicle(null);
      setEditPhotos([]);
      alert('Annuncio modificato e aggiornato con successo sul sito!');
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio delle modifiche.');
    }
  };

  // Filtered Inventory
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.plate && v.plate.toLowerCase().includes(q)) ||
          v.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [vehicles, statusFilter, searchQuery]);

  // 1. SCHERMATA LOGIN CON TASTIERINO A 6 CIFRE OTTIMIZZATO PER IL POLLICE
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-[#16181F] border border-[#272A34] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          {/* Lucchetto Oro */}
          <div className="w-14 h-14 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center mx-auto mb-3 text-[#E5A93C] shadow-lg shadow-[#E5A93C]/10">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-black text-white">Area Riservata Gabriel</h1>
          <p className="text-xs text-[#94A3B8] mb-6">
            Digita il PIN a 6 cifre per accedere al gestionale
          </p>

          {/* 6 Pallini Indicatori PIN */}
          <div className={`flex justify-center items-center gap-3 mb-6 transition-transform ${pinShake ? 'animate-shake translate-x-1 text-rose-500' : ''}`}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = pinDigits.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? 'bg-[#E5A93C] border-[#E5A93C] scale-110 shadow-md shadow-[#E5A93C]/40'
                      : 'border-[#272A34] bg-[#1C1E26]'
                  }`}
                />
              );
            })}
          </div>

          {authError && (
            <p className="text-xs text-rose-400 font-bold mb-4 bg-rose-950/30 py-1.5 px-3 rounded-lg border border-rose-900/40">
              {authError}
            </p>
          )}

          {/* TASTIERINO NUMERICO TOUCH PER SMARTPHONE */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                disabled={loadingAuth}
                className="h-14 rounded-2xl bg-[#1C1E26] hover:bg-[#272A34] active:bg-[#E5A93C] active:text-black active:scale-95 text-white font-extrabold text-xl border border-[#272A34] transition-all flex items-center justify-center shadow-sm cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Tasto Cancella */}
            <button
              type="button"
              onClick={handleClearPin}
              disabled={loadingAuth || pinDigits.length === 0}
              className="h-14 rounded-2xl bg-[#1C1E26] hover:bg-[#272A34] active:scale-95 text-[#94A3B8] font-bold text-xs border border-[#272A34] transition-all flex items-center justify-center cursor-pointer"
            >
              Canc
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              disabled={loadingAuth}
              className="h-14 rounded-2xl bg-[#1C1E26] hover:bg-[#272A34] active:bg-[#E5A93C] active:text-black active:scale-95 text-white font-extrabold text-xl border border-[#272A34] transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={loadingAuth || pinDigits.length === 0}
              className="h-14 rounded-2xl bg-[#1C1E26] hover:bg-[#272A34] active:scale-95 text-[#94A3B8] hover:text-white border border-[#272A34] transition-all flex items-center justify-center cursor-pointer"
              title="Cancella ultimo"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-[#272A34] text-[11px] text-[#64748B]">
            Verifica server-side su Cloudflare Workers Secrets. <br />
            PIN test: <strong className="text-[#E5A93C]">705115</strong> o <strong className="text-[#E5A93C]">123456</strong>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD GESTIONALE PRINCIPALE
  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 max-w-7xl mx-auto pb-24">
      {/* Header Gestionale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#272A34] mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">Gestionale G.Z. Auto</h1>
            <span className="text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 px-2 py-0.5 rounded-full">
              Cloudflare D1 Live
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">Stock 40-50 veicoli con switch 1-tap e condivisione WhatsApp</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-[#1C1E26] text-[#94A3B8] hover:text-white border border-[#272A34] transition-colors"
            title="Aggiorna dati"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1E26] hover:bg-rose-950/40 text-rose-400 border border-[#272A34] text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Esci</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#272A34] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
            activeTab === 'inventory' ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20' : 'bg-[#16181F] text-[#94A3B8] hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Inventario Parco ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
            activeTab === 'add' ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20' : 'bg-[#16181F] text-[#94A3B8] hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Veicolo</span>
        </button>

        <button
          onClick={() => setActiveTab('valuations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
            activeTab === 'valuations' ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20' : 'bg-[#16181F] text-[#94A3B8] hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Richieste Ritiro ({valuations.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTARIO PARCO AUTO (40-50 VEICOLI) */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Barra di Ricerca Istantanea per Targa, Marca o Modello + Filtro Stato */}
          <div className="bg-[#16181F] p-4 rounded-2xl border border-[#272A34] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca per targa, marca o modello (es. Golf, Fiat, FZ123AB)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E5A93C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['all', 'available', 'incoming', 'negotiating', 'sold'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${
                    statusFilter === st
                      ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                      : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
                  }`}
                >
                  {st === 'all' && `Tutti (${vehicles.length})`}
                  {st === 'available' && `Disponibili (${vehicles.filter(v => v.status === 'available').length})`}
                  {st === 'incoming' && `In Arrivo (${vehicles.filter(v => v.status === 'incoming').length})`}
                  {st === 'negotiating' && `Trattativa (${vehicles.filter(v => v.status === 'negotiating').length})`}
                  {st === 'sold' && `Vendute (${vehicles.filter(v => v.status === 'sold').length})`}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA COMPATTA INVENTARIO */}
          <div className="space-y-3">
            {filteredVehicles.length === 0 ? (
              <div className="bg-[#16181F] p-8 rounded-2xl border border-[#272A34] text-center text-[#94A3B8] text-xs">
                Nessun veicolo corrisponde alla ricerca.
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                let firstImg = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                try {
                  const arr = JSON.parse(vehicle.images);
                  if (Array.isArray(arr) && arr[0]) firstImg = arr[0];
                } catch {
                  // fallback
                }

                const isEditingPrice = editingPriceId === vehicle.id;

                return (
                  <div
                    key={vehicle.id}
                    className="bg-[#16181F] p-3.5 sm:p-4 rounded-2xl border border-[#272A34] hover:border-[#E5A93C]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
                  >
                    {/* Dettagli Essenziali & Thumbnail */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-[#1C1E26] shrink-0 border border-[#272A34]">
                        <img src={firstImg} alt="" className="w-full h-full object-cover" />
                        {vehicle.is_for_neopatentati === 1 && (
                          <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-[#38BDF8] text-black text-[9px] font-black rounded">
                            NEO
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#E5A93C] font-bold">
                            {vehicle.id}
                          </span>
                          {vehicle.plate && (
                            <span className="text-[10px] font-mono bg-[#1C1E26] px-1.5 py-0.2 rounded border border-[#272A34] text-white">
                              {vehicle.plate}
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleFeatured(vehicle.id, vehicle.is_featured)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              vehicle.is_featured === 1
                                ? 'bg-[#E5A93C] text-black border-[#E5A93C] shadow-sm font-black'
                                : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-[#E5A93C]'
                            }`}
                            title={vehicle.is_featured === 1 ? 'Attivo in Evidenza (Top Pagina) - Clicca per disattivare' : 'Clicca per mettere in Evidenza (Top Pagina)'}
                          >
                            <Star className={`w-3 h-3 ${vehicle.is_featured === 1 ? 'fill-black' : ''}`} />
                            <span>{vehicle.is_featured === 1 ? 'TOP' : 'Evidenza'}</span>
                          </button>
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                          {vehicle.make} {vehicle.model}
                        </h3>

                        <div className="text-xs text-[#94A3B8] flex items-center gap-2 flex-wrap">
                          <span>{vehicle.year}</span>
                          <span>•</span>
                          <span>{vehicle.mileage.toLocaleString()} km</span>
                          <span>•</span>
                          <span>{vehicle.fuel_type}</span>
                          <span>•</span>
                          <span>{vehicle.transmission}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prezzo in Linea (Inline Edit) & Gestione Stato 1-Tap */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#272A34]">
                      {/* MODIFICA RAPIDA PREZZO IN LINEA */}
                      <div className="shrink-0">
                        {isEditingPrice ? (
                          <div className="flex items-center gap-1.5 bg-[#1C1E26] p-1 rounded-xl border border-[#E5A93C]">
                            <input
                              type="number"
                              autoFocus
                              value={tempPriceValue}
                              onChange={(e) => setTempPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlinePrice(vehicle.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              className="w-20 bg-transparent text-white font-black text-sm px-1.5 focus:outline-none"
                            />
                            <button
                              onClick={() => saveInlinePrice(vehicle.id)}
                              className="p-1.5 rounded-lg bg-[#10B981] text-black hover:bg-[#059669]"
                              title="Salva"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1.5 rounded-lg bg-[#272A34] text-white hover:bg-rose-950"
                              title="Annulla"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(vehicle)}
                            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1E26] hover:bg-[#272A34] border border-[#272A34] transition-colors"
                            title="Tocca per modificare il prezzo al volo"
                          >
                            <span className="text-sm font-black text-white">
                              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(vehicle.price)}
                            </span>
                            <Edit3 className="w-3 h-3 text-[#94A3B8] group-hover:text-[#E5A93C]" />
                          </button>
                        )}
                      </div>

                      {/* GESTIONE STATO 1-TAP (SWITCH IMMEDIATO) */}
                      <div className="flex items-center gap-1 bg-[#1C1E26] p-1 rounded-xl border border-[#272A34]">
                        <button
                          onClick={() => handleStatusChange(vehicle.id, 'available')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            vehicle.status === 'available'
                              ? 'bg-[#10B981] text-black shadow-md shadow-[#10B981]/30 font-extrabold'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Disponibile
                        </button>

                        <button
                          onClick={() => handleStatusChange(vehicle.id, 'incoming')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            vehicle.status === 'incoming'
                              ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 font-extrabold'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          In Arrivo
                        </button>

                        <button
                          onClick={() => handleStatusChange(vehicle.id, 'negotiating')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            vehicle.status === 'negotiating'
                              ? 'bg-[#F59E0B] text-black shadow-md shadow-[#F59E0B]/30 font-extrabold'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Trattativa
                        </button>

                        <button
                          onClick={() => handleStatusChange(vehicle.id, 'sold')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            vehicle.status === 'sold'
                              ? 'bg-[#64748B] text-white shadow-md shadow-[#64748B]/30 font-extrabold'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          Venduta
                        </button>
                      </div>

                      {/* MODIFICA COMPLETA & ONE-CLICK ACTIONS */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5A93C]/15 hover:bg-[#E5A93C] text-[#E5A93C] hover:text-black font-extrabold text-xs border border-[#E5A93C]/40 transition-all shadow-sm cursor-pointer"
                          title="Modifica tutti i dati dell'annuncio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifica</span>
                        </button>

                        <button
                          onClick={() => copyVehicleLink(vehicle.slug, vehicle.id)}
                          className="p-2 rounded-xl bg-[#1C1E26] hover:bg-[#272A34] text-[#94A3B8] hover:text-white border border-[#272A34] transition-colors relative"
                          title="Copia link scheda"
                        >
                          {copiedId === vehicle.id ? (
                            <Check className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => shareVehicleWhatsApp(vehicle)}
                          className="p-2 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 transition-colors"
                          title="Invia scheda al cliente su WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                          className="p-2 rounded-xl bg-[#1C1E26] hover:bg-rose-950 text-rose-400 border border-[#272A34] transition-colors"
                          title="Elimina veicolo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORM AGGIUNGI VEICOLO (COMPLETO E SNELLO) */}
      {activeTab === 'add' && (
        <div className="bg-[#16181F] p-5 sm:p-8 rounded-3xl border border-[#272A34] max-w-4xl shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#272A34] mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Carica Nuovo Veicolo in Stock</h2>
              <p className="text-xs text-[#94A3B8]">Compila la scheda con tutti i dati tecnici e pubblica subito online</p>
            </div>
            <span className="text-[10px] font-bold bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30 px-2.5 py-1 rounded-full">
              Live Stock
            </span>
          </div>

          <form onSubmit={handlePublishVehicle} className="space-y-6 text-xs">
            {/* 1. Dati Principali & Prezzi */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                1. Dati Principali & Prezzi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Volkswagen, BMW, Audi..."
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Modello & Allestimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Golf 8 2.0 TDI R-Line DSG"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E5A93C] mb-1">Prezzo di Vendita (€) *</label>
                  <input
                    type="number"
                    required
                    placeholder="es. 16900"
                    value={newVehicle.price}
                    onChange={(e) => setNewVehicle({ ...newVehicle, price: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#E5A93C]/50 rounded-xl px-3 py-2 text-[#E5A93C] font-black text-sm focus:border-[#E5A93C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Targa (Trasparenza)</label>
                  <input
                    type="text"
                    placeholder="es. GA123XY"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono focus:border-[#E5A93C] outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Telaio / VIN</label>
                  <input
                    type="text"
                    placeholder="es. WVWZZZCDZPW..."
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono text-[10px] focus:border-[#E5A93C] outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Listino da nuova (€)</label>
                  <input
                    type="number"
                    placeholder="es. 38500"
                    value={newVehicle.original_price}
                    onChange={(e) => setNewVehicle({ ...newVehicle, original_price: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white focus:border-[#E5A93C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Stato Veicolo</label>
                  <select
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as VehicleStatus })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                  >
                    <option value="available">🟢 Disponibile</option>
                    <option value="incoming">🟣 In Arrivo</option>
                    <option value="negotiating">🟡 In Trattativa</option>
                    <option value="sold">⚪ Venduta</option>
                  </select>
                </div>
              </div>

              {/* Flag Switch / Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                  <input
                    type="checkbox"
                    checked={newVehicle.is_for_neopatentati === 1}
                    onChange={(e) => setNewVehicle({ ...newVehicle, is_for_neopatentati: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-[#38BDF8]"
                  />
                  <span className="text-white font-bold">Idonea Neopatentati</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                  <input
                    type="checkbox"
                    checked={newVehicle.is_featured === 1}
                    onChange={(e) => setNewVehicle({ ...newVehicle, is_featured: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-[#E5A93C]"
                  />
                  <span className="text-white font-bold">In Evidenza (Top Pagina)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                  <input
                    type="checkbox"
                    checked={Boolean(newVehicle.is_vat_deductible)}
                    onChange={(e) => setNewVehicle({ ...newVehicle, is_vat_deductible: e.target.checked })}
                    className="w-4 h-4 accent-[#10B981]"
                  />
                  <span className="text-white font-bold">IVA Esposta / Detraibile</span>
                </label>
              </div>
            </div>

            {/* 2. Specifiche Tecniche & Motorizzazione */}
            <div className="space-y-3 pt-4 border-t border-[#272A34]">
              <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                2. Specifiche Tecniche & Motorizzazione
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* Anno Immatricolazione */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Anno Immatricolazione</label>
                  <select
                    value={newVehicle.year}
                    onChange={(e) => {
                      const newYr = Number(e.target.value);
                      const currentMonthPart = newVehicle.month ? newVehicle.month.split('/')[0] : '';
                      setNewVehicle({
                        ...newVehicle,
                        year: newYr,
                        month: currentMonthPart ? `${currentMonthPart}/${newYr}` : newVehicle.month
                      });
                    }}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y} className="bg-[#1C1E26] text-white">{y}</option>
                    ))}
                  </select>
                </div>

                {/* Mese Immatricolazione */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Mese Immatricolazione</label>
                  <select
                    value={newVehicle.month ? newVehicle.month.split('/')[0] : ''}
                    onChange={(e) => {
                      const m = e.target.value;
                      const y = newVehicle.year || CURRENT_YEAR;
                      setNewVehicle({ ...newVehicle, month: m ? `${m}/${y}` : '' });
                    }}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                  >
                    <option value="" className="bg-[#1C1E26] text-[#94A3B8]">Seleziona Mese...</option>
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value} className="bg-[#1C1E26] text-white">{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Chilometri */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Chilometri (Certificati)</label>
                  <input
                    type="number"
                    value={newVehicle.mileage}
                    onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                  />
                </div>

                {/* Alimentazione */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Alimentazione</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['fuel_type'] || (!FUEL_TYPE_OPTIONS.includes(newVehicle.fuel_type) && newVehicle.fuel_type) ? 'custom' : newVehicle.fuel_type}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, fuel_type: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, fuel_type: false }));
                          setNewVehicle({ ...newVehicle, fuel_type: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {FUEL_TYPE_OPTIONS.map(f => (
                        <option key={f} value={f} className="bg-[#1C1E26] text-white">{f}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['fuel_type'] || (!FUEL_TYPE_OPTIONS.includes(newVehicle.fuel_type) && newVehicle.fuel_type)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Inserisci alimentazione..."
                        value={newVehicle.fuel_type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Cambio */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Cambio</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['transmission'] || (!TRANSMISSION_OPTIONS.includes(newVehicle.transmission) && newVehicle.transmission) ? 'custom' : newVehicle.transmission}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, transmission: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, transmission: false }));
                          setNewVehicle({ ...newVehicle, transmission: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {TRANSMISSION_OPTIONS.map(t => (
                        <option key={t} value={t} className="bg-[#1C1E26] text-white">{t}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['transmission'] || (!TRANSMISSION_OPTIONS.includes(newVehicle.transmission) && newVehicle.transmission)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Inserisci tipo cambio..."
                        value={newVehicle.transmission}
                        onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Trazione */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Trazione</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['traction'] || (!TRACTION_OPTIONS.includes(newVehicle.traction) && newVehicle.traction) ? 'custom' : newVehicle.traction}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, traction: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, traction: false }));
                          setNewVehicle({ ...newVehicle, traction: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {TRACTION_OPTIONS.map(tr => (
                        <option key={tr} value={tr} className="bg-[#1C1E26] text-white">{tr}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['traction'] || (!TRACTION_OPTIONS.includes(newVehicle.traction) && newVehicle.traction)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Inserisci trazione..."
                        value={newVehicle.traction}
                        onChange={(e) => setNewVehicle({ ...newVehicle, traction: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Potenza kW & CV */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Potenza (kW)</label>
                  <input
                    type="number"
                    placeholder="es. 110"
                    value={newVehicle.power_kw}
                    onChange={(e) => {
                      const kw = e.target.value;
                      const calculatedCv = kw ? Math.round(Number(kw) * 1.35962).toString() : '';
                      setNewVehicle(prev => ({
                        ...prev,
                        power_kw: kw,
                        power_cv: prev.power_cv ? prev.power_cv : calculatedCv
                      }));
                    }}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Potenza (CV)</label>
                  <input
                    type="number"
                    placeholder="es. 150"
                    value={newVehicle.power_cv}
                    onChange={(e) => setNewVehicle({ ...newVehicle, power_cv: e.target.value })}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                  />
                </div>

                {/* Cilindrata (Menu a Tendina) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Cilindrata</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['displacement'] || (!DISPLACEMENT_OPTIONS.includes(newVehicle.displacement) && newVehicle.displacement) ? 'custom' : newVehicle.displacement}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, displacement: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, displacement: false }));
                          setNewVehicle({ ...newVehicle, displacement: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                    >
                      {DISPLACEMENT_OPTIONS.map(d => (
                        <option key={d} value={d} className="bg-[#1C1E26] text-white">{d}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['displacement'] || (!DISPLACEMENT_OPTIONS.includes(newVehicle.displacement) && newVehicle.displacement)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Es. 1.750 cc o 3.800 cc"
                        value={newVehicle.displacement}
                        onChange={(e) => setNewVehicle({ ...newVehicle, displacement: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Normativa Euro (Menu a Tendina) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Normativa Euro</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['euro_class'] || (!EURO_CLASS_OPTIONS.includes(newVehicle.euro_class) && newVehicle.euro_class) ? 'custom' : newVehicle.euro_class}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, euro_class: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, euro_class: false }));
                          setNewVehicle({ ...newVehicle, euro_class: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                    >
                      {EURO_CLASS_OPTIONS.map(ec => (
                        <option key={ec} value={ec} className="bg-[#1C1E26] text-white">{ec}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['euro_class'] || (!EURO_CLASS_OPTIONS.includes(newVehicle.euro_class) && newVehicle.euro_class)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Es. Euro 6D-Temp EVAP"
                        value={newVehicle.euro_class}
                        onChange={(e) => setNewVehicle({ ...newVehicle, euro_class: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Carrozzeria (Menu a Tendina Spazioso e Ben Visibile) */}
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Carrozzeria</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['body_type'] || (!BODY_TYPE_OPTIONS.some(bt => bt.value === newVehicle.body_type) && newVehicle.body_type) ? 'custom' : newVehicle.body_type}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, body_type: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, body_type: false }));
                          setNewVehicle({ ...newVehicle, body_type: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                    >
                      {BODY_TYPE_OPTIONS.map(bt => (
                        <option key={bt.value} value={bt.value} className="bg-[#1C1E26] text-white">
                          {bt.label}
                        </option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['body_type'] || (!BODY_TYPE_OPTIONS.some(bt => bt.value === newVehicle.body_type) && newVehicle.body_type)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Es. Targa, Spider, ecc."
                        value={newVehicle.body_type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, body_type: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Porte e Posti (Menu a Tendina) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Porte / Posti</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newVehicle.doors}
                      onChange={(e) => setNewVehicle({ ...newVehicle, doors: Number(e.target.value) })}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white text-xs sm:text-sm font-semibold focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      {DOORS_OPTIONS.map(d => (
                        <option key={d} value={d} className="bg-[#1C1E26] text-white">{d} Porte</option>
                      ))}
                    </select>
                    <select
                      value={newVehicle.seats}
                      onChange={(e) => setNewVehicle({ ...newVehicle, seats: Number(e.target.value) })}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white text-xs sm:text-sm font-semibold focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      {SEATS_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-[#1C1E26] text-white">{s} Posti</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Colore Esterno (Menu a Tendina + Opzionale Custom) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Colore Esterno</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['color'] || (!COLOR_OPTIONS.includes(newVehicle.color) && newVehicle.color) ? 'custom' : newVehicle.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, color: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, color: false }));
                          setNewVehicle({ ...newVehicle, color: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      <option value="">Seleziona Colore...</option>
                      {COLOR_OPTIONS.map(c => (
                        <option key={c} value={c} className="bg-[#1C1E26] text-white">{c}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['color'] || (!COLOR_OPTIONS.includes(newVehicle.color) && newVehicle.color)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Specifica colore (es. Grigio Daytona Metallizzato)"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none animate-in fade-in duration-200"
                      />
                    )}
                  </div>
                </div>

                {/* Colore Interni (Menu a Tendina + Opzionale Custom) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Colore & Materiale Interni</label>
                  <div className="space-y-1.5">
                    <select
                      value={customFieldsNew['interior_color'] || (!INTERIOR_OPTIONS.includes(newVehicle.interior_color) && newVehicle.interior_color) ? 'custom' : newVehicle.interior_color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setCustomFieldsNew(prev => ({ ...prev, interior_color: true }));
                        } else {
                          setCustomFieldsNew(prev => ({ ...prev, interior_color: false }));
                          setNewVehicle({ ...newVehicle, interior_color: val });
                        }
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      <option value="">Seleziona Interni...</option>
                      {INTERIOR_OPTIONS.map(int => (
                        <option key={int} value={int} className="bg-[#1C1E26] text-white">{int}</option>
                      ))}
                      <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                    </select>
                    {(customFieldsNew['interior_color'] || (!INTERIOR_OPTIONS.includes(newVehicle.interior_color) && newVehicle.interior_color)) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Specifica interni (es. Pelle Totale Nera con cuciture rosse)"
                        value={newVehicle.interior_color}
                        onChange={(e) => setNewVehicle({ ...newVehicle, interior_color: e.target.value })}
                        className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none animate-in fade-in duration-200"
                      />
                    )}
                  </div>
                </div>

                {/* Scadenza Revisione (Menu a Tendina Mese + Anno) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Scadenza Revisione</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newVehicle.revision_valid_until ? newVehicle.revision_valid_until.split('/')[0] : ''}
                      onChange={(e) => {
                        const m = e.target.value;
                        const yr = newVehicle.revision_valid_until ? (newVehicle.revision_valid_until.split('/')[1] || CURRENT_YEAR + 2) : CURRENT_YEAR + 2;
                        setNewVehicle({ ...newVehicle, revision_valid_until: m ? `${m}/${yr}` : '' });
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      <option value="">Mese Revisione...</option>
                      {MONTH_OPTIONS.map(m => (
                        <option key={m.value} value={m.value} className="bg-[#1C1E26] text-white">{m.label}</option>
                      ))}
                    </select>

                    <select
                      value={newVehicle.revision_valid_until ? (newVehicle.revision_valid_until.split('/')[1] || '') : ''}
                      onChange={(e) => {
                        const yr = e.target.value;
                        const m = newVehicle.revision_valid_until ? (newVehicle.revision_valid_until.split('/')[0] || '05') : '05';
                        setNewVehicle({ ...newVehicle, revision_valid_until: yr ? `${m}/${yr}` : '' });
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                    >
                      <option value="">Anno Revisione...</option>
                      {REVISION_YEARS.map(y => (
                        <option key={y} value={y} className="bg-[#1C1E26] text-white">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Descrizione Veicolo */}
            <div className="space-y-2 pt-4 border-t border-[#272A34]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                  3. Descrizione Veicolo
                </h3>
                <span className="text-[10px] text-[#94A3B8]">In risalto nella scheda pubblica per il cliente</span>
              </div>
              <textarea
                rows={3}
                placeholder="Es. Vettura unico proprietario, cronologia tagliandi ufficiale completa, gomme nuove al 90%, igienizzata..."
                value={newVehicle.gabriel_notes}
                onChange={(e) => setNewVehicle({ ...newVehicle, gabriel_notes: e.target.value })}
                className="w-full bg-[#1C1E26] border border-[#E5A93C]/40 rounded-xl p-3 text-white focus:border-[#E5A93C] outline-none"
              />

              {/* Chip Rapidi Note */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-[#94A3B8] self-center mr-1">Inserisci al volo:</span>
                {[
                  'Unico proprietario.',
                  'Tagliandi regolari certificati.',
                  'Gomme al 90%.',
                  'Carrozzeria e interni pari al nuovo.',
                  'Garanzia 12 mesi estendibile a 5 anni.',
                  'Igienizzazione profonda eseguita.'
                ].map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addQuickNote(phrase)}
                    className="px-2 py-0.5 rounded-lg bg-[#1C1E26] hover:bg-[#272A34] text-[#94A3B8] hover:text-[#E5A93C] text-[10px] font-semibold border border-[#272A34] transition-colors cursor-pointer"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Galleria Fotografica Snella (Identica alla Modale di Modifica) */}
            <div className="space-y-3 pt-4 border-t border-[#272A34]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                    4. Foto Veicolo ({uploadedPhotos.length})
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    La prima foto con badge oro è la copertina dell'annuncio.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#272A34] hover:bg-[#323644] text-white font-bold text-xs border border-[#3b4050] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>Aggiungi Foto</span>
                  </button>
                </div>
              </div>

              {/* Griglia Anteprime Foto con scelta Cover e Slot Carica */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative group aspect-video rounded-xl overflow-hidden bg-[#1C1E26] border-2 transition-all ${
                      index === 0
                        ? 'border-[#E5A93C] shadow-lg shadow-[#E5A93C]/20 ring-1 ring-[#E5A93C]'
                        : 'border-[#272A34] hover:border-gray-500'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />

                    {index === 0 ? (
                      <div className="absolute top-1.5 left-1.5 bg-[#E5A93C] text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow flex items-center gap-1 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-black text-black" />
                        <span>COPERTINA</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCoverPhoto(index)}
                        className="absolute bottom-1.5 left-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 bg-black/75 hover:bg-[#E5A93C] text-white hover:text-black text-[9px] font-bold py-0.5 px-2 rounded-md transition-all flex items-center gap-1 border border-white/20 cursor-pointer shadow-md backdrop-blur-sm"
                        title="Imposta come copertina"
                      >
                        <Star className="w-2.5 h-2.5 text-[#E5A93C] group-hover:text-black" />
                        <span>Fai cover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Elimina foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Slot snello per caricare nuove foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-[#272A34] hover:border-[#E5A93C] flex flex-col items-center justify-center gap-1 text-[#94A3B8] hover:text-white transition-colors bg-[#1C1E26]/40 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#E5A93C]" />
                  <span className="text-[10px] font-bold">Carica</span>
                </button>
              </div>
            </div>

            {/* BOTTONE FINALE PUBBLICA SUBITO ONLINE */}
            <div className="pt-4 border-t border-[#272A34]">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#E5A93C]/20 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Pubblica Subito Online</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RICHIESTE DI VALUTAZIONE (DA /vendi-auto) */}
      {activeTab === 'valuations' && (
        <div className="space-y-3">
          {valuations.length === 0 ? (
            <div className="bg-[#16181F] p-8 rounded-2xl border border-[#272A34] text-center text-[#94A3B8] text-xs">
              Nessuna richiesta di valutazione ricevuta al momento.
            </div>
          ) : (
            valuations.map((val) => (
              <div key={val.id} className="bg-[#16181F] p-4 rounded-2xl border border-[#272A34] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-extrabold text-white text-base">
                    {val.client_name} • <span className="text-[#E5A93C]">{val.make_model}</span>
                  </h3>
                  <span className="text-xs text-[#64748B] font-mono">{val.created_at}</span>
                </div>
                <div className="text-xs text-[#94A3B8]">
                  Anno: <strong className="text-white">{val.year || 'N/D'}</strong> • Km:{' '}
                  <strong className="text-white">{val.mileage ? val.mileage.toLocaleString() : 'N/D'}</strong>
                  {val.condition && <span> • Condizioni: <strong className="text-white">{val.condition}</strong></span>}
                </div>
                {val.notes && (
                  <p className="text-xs bg-[#1C1E26] p-2.5 rounded-xl border border-[#272A34] text-gray-200">
                    "{val.notes}"
                  </p>
                )}
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={`https://wa.me/39${val.phone.replace(/[^0-9]/g, '')}?text=Ciao%20${encodeURIComponent(val.client_name)},%20ti%20contatto%20da%20G.Z.%20Auto%20per%20la%20valutazione%20della%20tua%20${encodeURIComponent(val.make_model)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-colors"
                  >
                    Rispondi su WhatsApp ({val.phone})
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE MODIFICA ANNUNCIO ESISTENTE */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#16181F] border border-[#E5A93C]/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modale */}
            <div className="px-5 py-4 border-b border-[#272A34] flex items-center justify-between bg-[#1C1E26]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A93C] uppercase tracking-wider">Modifica Scheda Annuncio</span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {editingVehicle.make} {editingVehicle.model} <span className="text-xs font-mono text-[#94A3B8]">({editingVehicle.id})</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="p-2 rounded-xl bg-[#272A34] hover:bg-[#323644] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                title="Chiudi senza salvare"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modale Scrollabile */}
            <form onSubmit={handleSaveEditedVehicle} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* 1. Dati Principali & Prezzo */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                  1. Dati Principali & Prezzi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      value={editingVehicle.make}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, make: e.target.value }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Modello & Allestimento *</label>
                    <input
                      type="text"
                      required
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, model: e.target.value }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#E5A93C] mb-1">Prezzo di Vendita (€) *</label>
                    <input
                      type="number"
                      required
                      value={editingVehicle.price}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#E5A93C]/50 rounded-xl px-3 py-2 text-[#E5A93C] font-black text-sm focus:border-[#E5A93C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Targa (Trasparenza)</label>
                    <input
                      type="text"
                      value={editingVehicle.plate || ''}
                      placeholder="es. GT476LN"
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, plate: e.target.value }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono focus:border-[#E5A93C] outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Telaio / VIN</label>
                    <input
                      type="text"
                      value={editingVehicle.vin || ''}
                      placeholder="es. ZAR93900000..."
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, vin: e.target.value }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-mono text-[10px] focus:border-[#E5A93C] outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Listino da nuova (€)</label>
                    <input
                      type="number"
                      value={editingVehicle.original_price || ''}
                      placeholder="es. 45000"
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, original_price: e.target.value ? Number(e.target.value) : undefined }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white focus:border-[#E5A93C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Stato Veicolo</label>
                    <select
                      value={editingVehicle.status}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, status: e.target.value as VehicleStatus }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2 text-white font-bold focus:border-[#E5A93C] outline-none"
                    >
                      <option value="available">🟢 Disponibile</option>
                      <option value="incoming">🟣 In Arrivo</option>
                      <option value="negotiating">🟡 In Trattativa</option>
                      <option value="sold">⚪ Venduta</option>
                    </select>
                  </div>
                </div>

                {/* Flag Switch / Checkboxes */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                    <input
                      type="checkbox"
                      checked={editingVehicle.is_for_neopatentati === 1}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, is_for_neopatentati: e.target.checked ? 1 : 0 }) : null)}
                      className="w-4 h-4 accent-[#38BDF8]"
                    />
                    <span className="text-white font-bold">Idonea Neopatentati</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                    <input
                      type="checkbox"
                      checked={editingVehicle.is_featured === 1}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, is_featured: e.target.checked ? 1 : 0 }) : null)}
                      className="w-4 h-4 accent-[#E5A93C]"
                    />
                    <span className="text-white font-bold">In Evidenza (Top Pagina)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#1C1E26] px-3 py-2 rounded-xl border border-[#272A34]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingVehicle.is_vat_deductible)}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, is_vat_deductible: e.target.checked }) : null)}
                      className="w-4 h-4 accent-[#10B981]"
                    />
                    <span className="text-white font-bold">IVA Esposta / Detraibile</span>
                  </label>
                </div>
              </div>

              {/* 2. Specifiche Tecniche Dettagliate */}
              <div className="space-y-3 pt-4 border-t border-[#272A34]">
                <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                  2. Specifiche Tecniche & Motorizzazione
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Anno Immatricolazione */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Anno Immatricolazione</label>
                    <select
                      value={editingVehicle.year}
                      onChange={(e) => {
                        const newYr = Number(e.target.value);
                        setEditingVehicle(prev => {
                          if (!prev) return null;
                          const currentMonthPart = prev.month ? prev.month.split('/')[0] : '';
                          return {
                            ...prev,
                            year: newYr,
                            month: currentMonthPart ? `${currentMonthPart}/${newYr}` : prev.month
                          };
                        });
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {YEAR_OPTIONS.map(y => (
                        <option key={y} value={y} className="bg-[#1C1E26] text-white">{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mese Immatricolazione */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Mese Immatricolazione</label>
                    <select
                      value={editingVehicle.month ? editingVehicle.month.split('/')[0] : ''}
                      onChange={(e) => {
                        const m = e.target.value;
                        setEditingVehicle(prev => {
                          if (!prev) return null;
                          const y = prev.year || CURRENT_YEAR;
                          return { ...prev, month: m ? `${m}/${y}` : '' };
                        });
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                    >
                      <option value="" className="bg-[#1C1E26] text-[#94A3B8]">Seleziona Mese...</option>
                      {MONTH_OPTIONS.map(m => (
                        <option key={m.value} value={m.value} className="bg-[#1C1E26] text-white">{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chilometri */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Chilometri (Certificati)</label>
                    <input
                      type="number"
                      value={editingVehicle.mileage}
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, mileage: Number(e.target.value) }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                    />
                  </div>

                  {/* Alimentazione */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Alimentazione</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['fuel_type'] || (!FUEL_TYPE_OPTIONS.includes(editingVehicle.fuel_type) && editingVehicle.fuel_type) ? 'custom' : editingVehicle.fuel_type}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, fuel_type: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, fuel_type: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, fuel_type: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                      >
                        {FUEL_TYPE_OPTIONS.map(f => (
                          <option key={f} value={f} className="bg-[#1C1E26] text-white">{f}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['fuel_type'] || (!FUEL_TYPE_OPTIONS.includes(editingVehicle.fuel_type) && editingVehicle.fuel_type)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Inserisci alimentazione..."
                          value={editingVehicle.fuel_type}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, fuel_type: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Cambio */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Cambio</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['transmission'] || (!TRANSMISSION_OPTIONS.includes(editingVehicle.transmission) && editingVehicle.transmission) ? 'custom' : editingVehicle.transmission}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, transmission: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, transmission: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, transmission: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                      >
                        {TRANSMISSION_OPTIONS.map(t => (
                          <option key={t} value={t} className="bg-[#1C1E26] text-white">{t}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['transmission'] || (!TRANSMISSION_OPTIONS.includes(editingVehicle.transmission) && editingVehicle.transmission)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Inserisci tipo cambio..."
                          value={editingVehicle.transmission}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, transmission: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Trazione */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Trazione</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['traction'] || (!TRACTION_OPTIONS.includes(editingVehicle.traction || '') && editingVehicle.traction) ? 'custom' : (editingVehicle.traction || 'Anteriore')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, traction: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, traction: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, traction: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-sm"
                      >
                        {TRACTION_OPTIONS.map(tr => (
                          <option key={tr} value={tr} className="bg-[#1C1E26] text-white">{tr}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['traction'] || (!TRACTION_OPTIONS.includes(editingVehicle.traction || '') && editingVehicle.traction)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Inserisci trazione..."
                          value={editingVehicle.traction || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, traction: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Potenza kW & CV */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Potenza (kW)</label>
                    <input
                      type="number"
                      value={editingVehicle.power_kw || ''}
                      placeholder="es. 110"
                      onChange={(e) => {
                        const kw = e.target.value ? Number(e.target.value) : 0;
                        const calculatedCv = kw ? Math.round(kw * 1.35962) : undefined;
                        setEditingVehicle(prev => prev ? ({
                          ...prev,
                          power_kw: kw,
                          power_cv: prev.power_cv ? prev.power_cv : calculatedCv
                        }) : null);
                      }}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Potenza (CV)</label>
                    <input
                      type="number"
                      value={editingVehicle.power_cv || ''}
                      placeholder="es. 150"
                      onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, power_cv: e.target.value ? Number(e.target.value) : undefined }) : null)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white focus:border-[#E5A93C] outline-none text-xs sm:text-sm"
                    />
                  </div>

                  {/* Cilindrata (Menu a Tendina) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Cilindrata</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['displacement'] || (!DISPLACEMENT_OPTIONS.includes(editingVehicle.displacement || '') && editingVehicle.displacement) ? 'custom' : (editingVehicle.displacement || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, displacement: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, displacement: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, displacement: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                      >
                        <option value="">Seleziona Cilindrata...</option>
                        {DISPLACEMENT_OPTIONS.map(d => (
                          <option key={d} value={d} className="bg-[#1C1E26] text-white">{d}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['displacement'] || (!DISPLACEMENT_OPTIONS.includes(editingVehicle.displacement || '') && editingVehicle.displacement)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Es. 1.750 cc o 3.800 cc"
                          value={editingVehicle.displacement || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, displacement: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Normativa Euro (Menu a Tendina) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Normativa Euro</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['euro_class'] || (!EURO_CLASS_OPTIONS.includes(editingVehicle.euro_class || '') && editingVehicle.euro_class) ? 'custom' : (editingVehicle.euro_class || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, euro_class: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, euro_class: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, euro_class: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                      >
                        <option value="">Seleziona Normativa Euro...</option>
                        {EURO_CLASS_OPTIONS.map(ec => (
                          <option key={ec} value={ec} className="bg-[#1C1E26] text-white">{ec}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['euro_class'] || (!EURO_CLASS_OPTIONS.includes(editingVehicle.euro_class || '') && editingVehicle.euro_class)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Es. Euro 6D-Temp EVAP"
                          value={editingVehicle.euro_class || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, euro_class: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Carrozzeria (Menu a Tendina Spazioso e Ben Visibile) */}
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Carrozzeria</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['body_type'] || (!BODY_TYPE_OPTIONS.some(bt => bt.value === editingVehicle.body_type) && editingVehicle.body_type) ? 'custom' : (editingVehicle.body_type || 'SUV')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, body_type: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, body_type: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, body_type: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white font-medium focus:border-[#E5A93C] outline-none cursor-pointer text-xs sm:text-[13px]"
                      >
                        {BODY_TYPE_OPTIONS.map(bt => (
                          <option key={bt.value} value={bt.value} className="bg-[#1C1E26] text-white">
                            {bt.label}
                          </option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['body_type'] || (!BODY_TYPE_OPTIONS.some(bt => bt.value === editingVehicle.body_type) && editingVehicle.body_type)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Es. Targa, Spider, ecc."
                          value={editingVehicle.body_type || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, body_type: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Porte e Posti (Menu a Tendina) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Porte / Posti</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingVehicle.doors || 5}
                        onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, doors: Number(e.target.value) }) : null)}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white text-xs sm:text-sm font-semibold focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        {DOORS_OPTIONS.map(d => (
                          <option key={d} value={d} className="bg-[#1C1E26] text-white">{d} Porte</option>
                        ))}
                      </select>
                      <select
                        value={editingVehicle.seats || 5}
                        onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, seats: Number(e.target.value) }) : null)}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-2.5 py-2.5 text-white text-xs sm:text-sm font-semibold focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        {SEATS_OPTIONS.map(s => (
                          <option key={s} value={s} className="bg-[#1C1E26] text-white">{s} Posti</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Colore Esterno (Menu a Tendina + Custom) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Colore Esterno</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['color'] || (!COLOR_OPTIONS.includes(editingVehicle.color || '') && editingVehicle.color) ? 'custom' : (editingVehicle.color || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, color: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, color: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, color: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        <option value="">Seleziona Colore...</option>
                        {COLOR_OPTIONS.map(c => (
                          <option key={c} value={c} className="bg-[#1C1E26] text-white">{c}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['color'] || (!COLOR_OPTIONS.includes(editingVehicle.color || '') && editingVehicle.color)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Specifica colore (es. Grigio Daytona Metallizzato)"
                          value={editingVehicle.color || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none animate-in fade-in duration-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* Colore Interni (Menu a Tendina + Custom) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Colore & Materiale Interni</label>
                    <div className="space-y-1.5">
                      <select
                        value={customFieldsEdit['interior_color'] || (!INTERIOR_OPTIONS.includes(editingVehicle.interior_color || '') && editingVehicle.interior_color) ? 'custom' : (editingVehicle.interior_color || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setCustomFieldsEdit(prev => ({ ...prev, interior_color: true }));
                          } else {
                            setCustomFieldsEdit(prev => ({ ...prev, interior_color: false }));
                            setEditingVehicle(prev => prev ? ({ ...prev, interior_color: val }) : null);
                          }
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        <option value="">Seleziona Interni...</option>
                        {INTERIOR_OPTIONS.map(int => (
                          <option key={int} value={int} className="bg-[#1C1E26] text-white">{int}</option>
                        ))}
                        <option value="custom" className="bg-[#1C1E26] text-[#E5A93C]">✏️ Personalizzato...</option>
                      </select>
                      {(customFieldsEdit['interior_color'] || (!INTERIOR_OPTIONS.includes(editingVehicle.interior_color || '') && editingVehicle.interior_color)) && (
                        <input
                          type="text"
                          autoFocus
                          placeholder="Specifica interni (es. Pelle Totale Nera con cuciture rosse)"
                          value={editingVehicle.interior_color || ''}
                          onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, interior_color: e.target.value }) : null)}
                          className="w-full bg-[#16181F] border border-[#E5A93C] rounded-xl px-3 py-2 text-white text-xs placeholder:text-[#64748B] focus:outline-none animate-in fade-in duration-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* Scadenza Revisione (Menu a Tendina Mese + Anno) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#94A3B8] mb-1">Scadenza Revisione</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingVehicle.revision_valid_until ? editingVehicle.revision_valid_until.split('/')[0] : ''}
                        onChange={(e) => {
                          const m = e.target.value;
                          setEditingVehicle(prev => {
                            if (!prev) return null;
                            const yr = prev.revision_valid_until ? (prev.revision_valid_until.split('/')[1] || CURRENT_YEAR + 2) : CURRENT_YEAR + 2;
                            return { ...prev, revision_valid_until: m ? `${m}/${yr}` : '' };
                          });
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        <option value="">Mese Revisione...</option>
                        {MONTH_OPTIONS.map(m => (
                          <option key={m.value} value={m.value} className="bg-[#1C1E26] text-white">{m.label}</option>
                        ))}
                      </select>

                      <select
                        value={editingVehicle.revision_valid_until ? (editingVehicle.revision_valid_until.split('/')[1] || '') : ''}
                        onChange={(e) => {
                          const yr = e.target.value;
                          setEditingVehicle(prev => {
                            if (!prev) return null;
                            const m = prev.revision_valid_until ? (prev.revision_valid_until.split('/')[0] || '05') : '05';
                            return { ...prev, revision_valid_until: yr ? `${m}/${yr}` : '' };
                          });
                        }}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm font-medium focus:border-[#E5A93C] outline-none cursor-pointer"
                      >
                        <option value="">Anno Revisione...</option>
                        {REVISION_YEARS.map(y => (
                          <option key={y} value={y} className="bg-[#1C1E26] text-white">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Descrizione Veicolo */}
              <div className="space-y-2 pt-4 border-t border-[#272A34]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                    3. Descrizione Veicolo
                  </h3>
                  <span className="text-[10px] text-[#94A3B8]">In risalto nella scheda pubblica per il cliente</span>
                </div>
                <textarea
                  rows={3}
                  value={editingVehicle.gabriel_notes || ''}
                  onChange={(e) => setEditingVehicle(prev => prev ? ({ ...prev, gabriel_notes: e.target.value }) : null)}
                  placeholder="Es: Vettura unico proprietario, cronologia tagliandi ufficiale completa, gomme nuove al 90%, igienizzata..."
                  className="w-full bg-[#1C1E26] border border-[#E5A93C]/40 rounded-xl p-3 text-white focus:border-[#E5A93C] outline-none"
                />

                {/* Chip Rapidi Note */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-[#94A3B8] self-center mr-1">Inserisci al volo:</span>
                  {[
                    'Unico proprietario.',
                    'Tagliandi regolari certificati.',
                    'Gomme al 90%.',
                    'Carrozzeria e interni pari al nuovo.',
                    'Garanzia 12 mesi estendibile a 5 anni.',
                    'Igienizzazione profonda eseguita.'
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addEditQuickNote(phrase)}
                      className="px-2 py-0.5 rounded-lg bg-[#1C1E26] hover:bg-[#272A34] text-[#94A3B8] hover:text-[#E5A93C] text-[10px] font-semibold border border-[#272A34] transition-colors cursor-pointer"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Galleria Fotografica & Gestione Immagini */}
              <div className="space-y-3 pt-4 border-t border-[#272A34]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-extrabold uppercase text-[#E5A93C] tracking-wider">
                      4. Foto Veicolo ({editPhotos.length})
                    </h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      La prima foto è la copertina principale visualizzata nel catalogo.
                    </p>
                  </div>
                  
                  <div>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUploadForEdit}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#272A34] hover:bg-[#323644] text-white font-bold text-xs border border-[#3b4050] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#E5A93C]" />
                      <span>Aggiungi Foto</span>
                    </button>
                  </div>
                </div>

                {/* Griglia Anteprime Foto con scelta Cover */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {editPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`relative group aspect-video rounded-xl overflow-hidden bg-[#1C1E26] border-2 transition-all ${
                        index === 0 
                          ? 'border-[#E5A93C] shadow-lg shadow-[#E5A93C]/20 ring-1 ring-[#E5A93C]' 
                          : 'border-[#272A34] hover:border-gray-500'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      
                      {index === 0 ? (
                        <div className="absolute top-1.5 left-1.5 bg-[#E5A93C] text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow flex items-center gap-1 backdrop-blur-sm">
                          <Star className="w-3 h-3 fill-black text-black" />
                          <span>COPERTINA</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAsEditCoverPhoto(index)}
                          className="absolute bottom-1.5 left-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 bg-black/75 hover:bg-[#E5A93C] text-white hover:text-black text-[9px] font-bold py-0.5 px-2 rounded-md transition-all flex items-center gap-1 border border-white/20 cursor-pointer shadow-md backdrop-blur-sm"
                          title="Imposta come copertina"
                        >
                          <Star className="w-2.5 h-2.5 text-[#E5A93C] group-hover:text-black" />
                          <span>Fai cover</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeEditPhoto(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                        title="Elimina foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Slot per caricare nuove foto */}
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-[#272A34] hover:border-[#E5A93C] flex flex-col items-center justify-center gap-1 text-[#94A3B8] hover:text-white transition-colors bg-[#1C1E26]/40 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#E5A93C]" />
                    <span className="text-[10px] font-bold">Carica</span>
                  </button>
                </div>
              </div>

              {/* Azioni Footer Form */}
              <div className="pt-4 border-t border-[#272A34] flex items-center justify-end gap-3 sticky bottom-0 bg-[#16181F] py-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1E26] hover:bg-[#272A34] text-[#94A3B8] hover:text-white font-bold transition-colors cursor-pointer"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-black font-extrabold transition-all shadow-lg shadow-[#E5A93C]/25 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salva Modifiche Annuncio</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
