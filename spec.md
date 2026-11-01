# SPECIFICA TECNICA & FUNZIONALE: PIATTAFORMA G.Z. AUTO USATE

## 1. CONTESTO & OBIETTIVI
- **Cliente**: G.Z. Auto Usate di Gabriel
- **Sede**: Via Statale 30, Castelvetro Piacentino (PC)
- **Canale Primario**: WhatsApp (+39 348 7051158)
- **Dimensioni Parco Auto**: 40-50 veicoli in stock
- **Obiettivo Frontend**: Portale mobile-first ad altissime prestazioni (< 1s da 4G), catalogo filtrabile istantaneamente, schede singole con "Note di Gabriel" e funnel "Acquistiamo la tua auto"[cite: 1].
- **Obiettivo Backend/Dashboard**: Gestionale mobile privato per Gabriel protetto da autenticazione server-side su Cloudflare, con caricamento veicolo in 60 secondi e aggiornamento stato ad 1 tap.

---

## 2. STACK TECNOLOGICO & ARCHITETTURA
- **Frontend Framework**: React 19 + Vite + Tailwind CSS + Lucide React.
- **Routing**: React Router per navigazione fluida (`/`, `/auto/:slug`, `/vendi-auto`, `/admin`).
- **Database & Backend**: Cloudflare D1 (SQLite serverless) gestito tramite Cloudflare Workers / API routes.
- **Storage Asset**: Cloudflare R2 per immagini, servite in formato compresso ad alte prestazioni (AVIF).
- **Sicurezza & Autenticazione**:
  - Nessuna password o PIN in chiaro nel client.
  - Secret memorizzato su Cloudflare Secrets (`ADMIN_PIN_HASH`).
  - Endpoint `/api/auth/verify-pin` con validazione server-side e rilascio di token di sessione (JWT o cookie `HttpOnly`, `SameSite=Strict`).

---

## 3. DESIGN SYSTEM & PALETTE COLORI (Da Cartellone Fisico)
- **Background Primario (Dark / Asfalto)**: `#0F1015` (base) e `#16181F` / `#1C1E26` (card e riquadri).
- **Accento Oro / Ocra Energetico**: `#E5A93C` / `#F59E0B` (richiamo brand G.Z.[cite: 1], bordi attivi e CTA primarie).
- **Testo**:
  - Bianco puro (`#FFFFFF`) per titoli, prezzi e valori primari[cite: 1].
  - Grigio argento (`#94A3B8`) per specifiche tecniche e testi secondari.
- **Badge di Stato**:
  - `Disponibile`: Verde smeraldo (`#10B981`)
  - `In Trattativa`: Ambra / Ocra (`#F59E0B`)
  - `Venduta`: Grigio ardesia (`#64748B`)
  - `Neopatentati`: Azzurro tech (`#38BDF8`)

---

## 4. SCHEMA DATABASE (Cloudflare D1 / SQLite)

```sql
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  price REAL NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  power_kw INTEGER,
  is_for_neopatentati INTEGER DEFAULT 0,
  gabriel_notes TEXT,
  status TEXT DEFAULT 'available',
  images TEXT NOT NULL,
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE valuation_requests (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  make_model TEXT NOT NULL,
  year INTEGER,
  mileage INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

