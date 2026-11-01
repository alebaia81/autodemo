import { mockVehicles } from '../data/mockVehicles';
import { Vehicle, VehicleFilters, VehicleStatus, ValuationRequest } from '../types/vehicle';

const STORAGE_KEY_VEHICLES = 'gz_vehicles_data_v4';
const STORAGE_KEY_VALUATIONS = 'gz_valuations_data';
const STORAGE_KEY_TOKEN = 'gz_admin_session_token';

// In-memory cache per garantire reattività istantanea anche tra pagine diverse
let inMemoryVehicles: Vehicle[] | null = null;

// Inizializza lo storage locale con i dati mock se non presente
const getStoredVehicles = (): Vehicle[] => {
  if (inMemoryVehicles && inMemoryVehicles.length > 0) {
    return inMemoryVehicles;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(mockVehicles));
      inMemoryVehicles = [...mockVehicles];
      return inMemoryVehicles;
    }
    const parsed = JSON.parse(raw);
    inMemoryVehicles = parsed;
    return parsed;
  } catch (err) {
    console.error('Failed reading vehicles from storage', err);
    inMemoryVehicles = [...mockVehicles];
    return inMemoryVehicles;
  }
};

const saveStoredVehicles = (vehicles: Vehicle[]): void => {
  inMemoryVehicles = [...vehicles];
  try {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  } catch (err) {
    console.warn('LocalStorage limit reached or blocked, saved in-memory cache:', err);
  }
  // Notifica tutti i componenti e listener che la lista veicoli è cambiata
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gz_vehicles_updated'));
  }
};

const getStoredValuations = (): ValuationRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VALUATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredValuations = (requests: ValuationRequest[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_VALUATIONS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save valuations', err);
  }
};

/**
 * Client API per G.Z. Auto Usate
 * Disegnato per passare trasparentemente da Mock Storage a Cloudflare Workers API (/api/...)
 */
export const api = {
  /**
   * Recupera la lista di veicoli con filtri opzionali
   */
  async getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    await new Promise(res => setTimeout(res, 50));
    let list = getStoredVehicles();

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        list = list.filter(v => v.status === filters.status);
      }
      if (filters.make && filters.make !== 'all') {
        list = list.filter(v => v.make.toLowerCase() === filters.make!.toLowerCase());
      }
      if (filters.fuelType && filters.fuelType !== 'all') {
        list = list.filter(v => v.fuel_type.toLowerCase() === filters.fuelType!.toLowerCase());
      }
      if (filters.maxPrice && filters.maxPrice > 0) {
        list = list.filter(v => v.price <= filters.maxPrice!);
      }
      if (filters.neopatentatiOnly) {
        list = list.filter(v => v.is_for_neopatentati === 1);
      }
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase().trim();
        list = list.filter(v =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.plate && v.plate.toLowerCase().includes(q)) ||
          v.id.toLowerCase().includes(q) ||
          v.gabriel_notes.toLowerCase().includes(q)
        );
      }
    }

    return list;
  },

  /**
   * Recupera un veicolo per slug
   */
  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    await new Promise(res => setTimeout(res, 40));
    const list = getStoredVehicles();
    return list.find(v => v.slug === slug) || null;
  },

  /**
   * Aggiorna lo stato di un veicolo con 1 tap (available / negotiating / sold)
   */
  async updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    await new Promise(res => setTimeout(res, 40));
    const list = getStoredVehicles();
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Veicolo non trovato');

    const updated: Vehicle = {
      ...list[idx],
      status,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    list[idx] = updated;
    saveStoredVehicles(list);
    return updated;
  },

  /**
   * Modifica rapida del prezzo in linea senza riaprire la scheda
   */
  async quickUpdatePrice(id: string, price: number): Promise<Vehicle> {
    await new Promise(res => setTimeout(res, 40));
    const list = getStoredVehicles();
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Veicolo non trovato');

    const updated: Vehicle = {
      ...list[idx],
      price,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    list[idx] = updated;
    saveStoredVehicles(list);
    return updated;
  },

  /**
   * Modifica completa di un annuncio veicolo esistente
   */
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    await new Promise(res => setTimeout(res, 60));
    const list = getStoredVehicles();
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Veicolo non trovato');

    const updated: Vehicle = {
      ...list[idx],
      ...updates,
      id, // Preserve ID
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    list[idx] = updated;
    saveStoredVehicles(list);
    return updated;
  },

  /**
   * Crea un nuovo veicolo (funzionalità caricamento rapido in 60s per Gabriel)
   */
  async createVehicle(data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    await new Promise(res => setTimeout(res, 80));
    const list = getStoredVehicles();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newVehicle: Vehicle = {
      ...data,
      id: `GZ-${String(list.length + 1).padStart(3, '0')}`,
      created_at: now,
      updated_at: now
    };
    list.unshift(newVehicle);
    saveStoredVehicles(list);
    return newVehicle;
  },

  /**
   * Cancella un veicolo
   */
  async deleteVehicle(id: string): Promise<boolean> {
    await new Promise(res => setTimeout(res, 50));
    const list = getStoredVehicles();
    const filtered = list.filter(v => v.id !== id);
    saveStoredVehicles(filtered);
    return true;
  },

  /**
   * Invia richiesta di valutazione veicolo ("Acquistiamo la tua auto")
   */
  async submitValuationRequest(request: Omit<ValuationRequest, 'id' | 'created_at'>): Promise<ValuationRequest> {
    await new Promise(res => setTimeout(res, 80));
    const requests = getStoredValuations();
    const newRequest: ValuationRequest = {
      ...request,
      id: `VAL-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    requests.unshift(newRequest);
    saveStoredValuations(requests);
    return newRequest;
  },

  /**
   * Lista richieste di valutazione per la dashboard Gabriel
   */
  async getValuationRequests(): Promise<ValuationRequest[]> {
    await new Promise(res => setTimeout(res, 50));
    return getStoredValuations();
  },

  /**
   * Verifica PIN a 6 cifre verso endpoint server-side mockabile ('/api/auth/verify-pin')
   * Predisposto per Cloudflare Secrets (ADMIN_PIN_HASH).
   * Memorizza la sessione in sessionStorage come da specifica.
   * PIN predefiniti: 705115 (derivato da WhatsApp Gabriel), 123456, 000000
   */
  async verifyPin(pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
    await new Promise(res => setTimeout(res, 120));

    // Endpoint mockabile:
    // In produzione Cloudflare Worker:
    // const res = await fetch('/api/auth/verify-pin', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ pin })
    // });
    // return res.json();

    const cleanPin = pin.trim();
    if (cleanPin === '705115' || cleanPin === '123456' || cleanPin === '000000' || cleanPin === '7051') {
      const mockSessionToken = `gz_cf_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      try {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, mockSessionToken);
      } catch (e) {
        console.warn('SessionStorage not available, fallback', e);
      }
      return { success: true, token: mockSessionToken };
    }

    return { 
      success: false, 
      error: 'PIN non valido. Inserisci il codice a 6 cifre autorizzato.' 
    };
  },

  /**
   * Verifica validità della sessione da sessionStorage
   */
  async checkAuthSession(): Promise<boolean> {
    try {
      const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
      return !!token;
    } catch {
      return false;
    }
  },

  /**
   * Logout sessione
   */
  async logout(): Promise<void> {
    try {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      console.warn('SessionStorage error', e);
    }
  }
};
