export type VehicleStatus = 'available' | 'incoming' | 'negotiating' | 'sold';

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  price: number;
  original_price?: number; // Prezzo di listino da nuova es. 95.000€
  year: number;
  month?: string; // Mese immatricolazione es. "02/2024"
  mileage: number;
  fuel_type: string;
  transmission: string;
  transmission_gears?: string; // es. "Automatico 8 marce" o "Manuale 6 marce"
  power_kw: number;
  power_cv?: number;
  displacement?: string; // Cilindrata es. "2.995 cc"
  cylinders?: number; // es. 6 o 4
  traction?: string; // es. "Integrale" o "Anteriore" o "Posteriore"
  euro_class?: string; // es. "Euro 6D-Temp"
  seats?: number; // es. 5 posti
  doors?: number; // es. 5 porte
  body_type?: string; // Carrozzeria: "City car" | "SUV" | "Berlina" | "Station Wagon" | "Coupé"
  consumption?: string; // es. "4.8 l/100 km"
  consumption_urban?: string;
  consumption_extra?: string;
  color?: string; // Colore esterno
  interior_color?: string; // Colore interno es. "Pelle Nero / Rosso"
  plate?: string; // Targa es. "GT476LN"
  vin?: string; // Telaio es. "WP1ZZZ9Y1PDA26358"
  revision_valid_until?: string; // Scadenza revisione es. "02/2028"
  is_vat_deductible?: boolean; // IVA esposta / detraibile
  is_for_neopatentati: number; // 0 or 1 SQLite flag
  gabriel_notes: string;
  status: VehicleStatus;
  images: string; // JSON string array of URLs for D1 compatibility
  is_featured: number; // 0 or 1 SQLite flag
  features_list?: string[]; // Elenco optional e dotazioni
  created_at?: string;
  updated_at?: string;
}

export interface ValuationRequest {
  id: string;
  client_name: string;
  phone: string;
  make_model: string;
  year?: number;
  mileage?: number;
  notes?: string;
  condition?: string;
  created_at?: string;
}

export interface VehicleFilters {
  make?: string;
  maxPrice?: number;
  minPrice?: number;
  maxKm?: number;
  fuelType?: string;
  bodyType?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'km_asc' | 'year_desc';
  neopatentatiOnly?: boolean;
  status?: VehicleStatus | 'all';
  searchQuery?: string;
}
