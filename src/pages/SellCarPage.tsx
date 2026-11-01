import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Banknote, 
  Clock, 
  Phone, 
  Car, 
  Calendar, 
  Gauge, 
  FileCheck, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

export const SellCarPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [makeModel, setMakeModel] = useState('');
  const [fuelType, setFuelType] = useState('Benzina');
  const [year, setYear] = useState<number>(2018);
  const [mileage, setMileage] = useState<string>('85000');
  const [condition, setCondition] = useState('Ottime condizioni (nessun lavoro da fare)');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Format precompiled WhatsApp URL
  const generateWhatsAppUrl = () => {
    const text = 
`*RICHIESTA VALUTAZIONE AUTO - G.Z. AUTO USATE*

🚗 *Veicolo:* ${makeModel || 'Non specificato'}
⛽ *Alimentazione:* ${fuelType}
📅 *Anno:* ${year}
🛣️ *Chilometri:* ${mileage ? Number(mileage).toLocaleString('it-IT') : 'N/D'} km
🛠️ *Condizioni:* ${condition}
${notes ? `📝 *Note aggiuntive:* ${notes}\n` : ''}
👤 *Proprietario:* ${clientName || 'Cliente'}
📞 *Telefono:* ${phone || 'N/D'}

Ciao Gabriel, ti invio i dati per una valutazione immediata della mia auto con ritiro a Castelvetro Piacentino!`;

    return `https://wa.me/393487051158?text=${encodeURIComponent(text)}`;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !makeModel.trim()) {
      alert('Inserisci almeno la marca e il modello del veicolo (es. Fiat Panda 1.2 o Ford Fiesta).');
      return;
    }
    if (currentStep === 2 && (!year || !mileage)) {
      alert('Inserisci l\'anno e i chilometri approssimativi del veicolo.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) {
      alert('Inserisci il tuo nome e un recapito telefonico per la valutazione.');
      return;
    }

    setLoading(true);
    try {
      await api.submitValuationRequest({
        client_name: clientName,
        phone,
        make_model: makeModel,
        year: Number(year) || undefined,
        mileage: Number(mileage) || undefined,
        notes: `Condizioni: ${condition}. Note: ${notes}`,
        condition,
      });

      setSubmitted(true);

      // Apri automaticamente WhatsApp per inviare il messaggio precompilato
      window.open(generateWhatsAppUrl(), '_blank');
    } catch (err) {
      console.error(err);
      // In caso di errore API, apri comunque WhatsApp
      window.open(generateWhatsAppUrl(), '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#E5A93C]" />
          <span>Torna al catalogo veicoli</span>
        </Link>
      </div>

      {/* Header Funnel */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] bg-[#E5A93C]/10 px-3.5 py-1.5 rounded-full border border-[#E5A93C]/25 inline-flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span>Servizio Diretto Gabriel • Nessuna Perdita di Tempo</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Acquistiamo la Tua Auto Usata in 24 Ore
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          Valutazione onesta basata sul valore reale di mercato. Pagamento istantaneo con bonifico prima di consegnare le chiavi e passaggio di proprietà a carico nostro.
        </p>
      </div>

      {/* 3 Pillole Garanzie */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-[#16181F] p-4 rounded-xl border border-[#272A34] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Risposta in 60 minuti</h4>
            <p className="text-[11px] text-[#94A3B8]">Stima rapida direttamente da Gabriel</p>
          </div>
        </div>

        <div className="bg-[#16181F] p-4 rounded-xl border border-[#272A34] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Bonifico Istantaneo</h4>
            <p className="text-[11px] text-[#94A3B8]">Soldi subito sul conto, nessun assegno</p>
          </div>
        </div>

        <div className="bg-[#16181F] p-4 rounded-xl border border-[#272A34] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Passaggio Immediato</h4>
            <p className="text-[11px] text-[#94A3B8]">Pratiche a nostro carico in agenzia</p>
          </div>
        </div>
      </div>

      {/* BOX STEP-BY-STEP FUNNEL */}
      <div className="bg-[#16181F] border border-[#272A34] rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mx-auto mb-4 text-[#10B981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Richiesta Pronta su WhatsApp!</h2>
            <p className="text-[#94A3B8] text-xs sm:text-sm max-w-md mx-auto mb-6">
              I dati della tua auto sono stati organizzati. Se non si è aperta automaticamente la chat, clicca sul pulsante sottostante per inviare i dettagli a Gabriel:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Invia Dettagli su WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  setMakeModel('');
                  setNotes('');
                }}
                className="px-5 py-3 rounded-xl bg-[#1C1E26] text-white font-semibold text-xs border border-[#272A34]"
              >
                Inizia nuova valutazione
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
                <span className="font-bold text-[#E5A93C]">Step {currentStep} di 4</span>
                <span>
                  {currentStep === 1 && 'Veicolo & Allestimento'}
                  {currentStep === 2 && 'Anno & Chilometraggio'}
                  {currentStep === 3 && 'Condizioni Generali'}
                  {currentStep === 4 && 'Contatti & Invia su WhatsApp'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1C1E26] rounded-full overflow-hidden border border-[#272A34]">
                <div
                  className="h-full bg-gradient-to-r from-[#E5A93C] to-[#F59E0B] transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: MARCA & MODELLO */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#272A34]">
                  <Car className="w-5 h-5 text-[#E5A93C]" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Che auto desideri vendere?</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Marca e Modello con Allestimento *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Es. Fiat 500 1.2 Lounge, Golf 7 1.6 TDI, Yaris..."
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E5A93C]"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Indica anche la motorizzazione o allestimento se lo conosci.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Tipo di Carburante
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Benzina', 'Diesel', 'Ibrida', 'GPL / Metano'].map((fuel) => (
                      <button
                        key={fuel}
                        type="button"
                        onClick={() => setFuelType(fuel)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                          fuelType === fuel
                            ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                            : 'bg-[#1C1E26] text-[#94A3B8] border-[#272A34] hover:text-white'
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-[#E5A93C]/20"
                  >
                    <span>Continua</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ANNO & CHILOMETRAGGIO */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#272A34]">
                  <Calendar className="w-5 h-5 text-[#E5A93C]" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Anno e Chilometraggio</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                      Anno di Immatricolazione
                    </label>
                    <input
                      type="number"
                      min={2000}
                      max={new Date().getFullYear()}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E5A93C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                      Chilometri Attuali (stimati)
                    </label>
                    <div className="relative">
                      <Gauge className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        placeholder="85000"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#E5A93C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 rounded-xl bg-[#1C1E26] text-[#94A3B8] hover:text-white border border-[#272A34] text-xs font-bold"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-[#E5A93C]/20"
                  >
                    <span>Continua</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONDIZIONI GENERALI */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#272A34]">
                  <FileCheck className="w-5 h-5 text-[#E5A93C]" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Stato e Condizioni del Veicolo</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Come descriveresti le condizioni generali?
                  </label>
                  <div className="space-y-2">
                    {[
                      'Ottime condizioni (nessun lavoro da fare, sempre tagliandata)',
                      'Buone condizioni (normali segni di usura da parcheggio)',
                      'Da ripristinare (qualche segno di carrozzeria o tagliando da fare)',
                      'Incidentata o non marciante'
                    ].map((cond) => (
                      <label
                        key={cond}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          condition === cond
                            ? 'bg-[#1C1E26] border-[#E5A93C] text-white'
                            : 'bg-[#16181F] border-[#272A34] text-[#94A3B8] hover:border-[#94A3B8]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="condition"
                          checked={condition === cond}
                          onChange={() => setCondition(cond)}
                          className="w-4 h-4 text-[#E5A93C] focus:ring-0 bg-[#0F1015]"
                        />
                        <span className="text-xs font-medium">{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Note aggiuntive per Gabriel (opzionale)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Es. Unico proprietario, gomme 4 stagioni montate da poco, doppie chiavi presenti..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#E5A93C] resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 rounded-xl bg-[#1C1E26] text-[#94A3B8] hover:text-white border border-[#272A34] text-xs font-bold"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-[#E5A93C]/20"
                  >
                    <span>Continua ai Contatti</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RECAPITI & CTA FINALE WHATSAPP */}
            {currentStep === 4 && (
              <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#272A34]">
                  <Phone className="w-5 h-5 text-[#10B981]" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Ricevi la Valutazione da Gabriel</h2>
                </div>

                {/* Riepilogo Dati Inseriti */}
                <div className="bg-[#1C1E26] p-3.5 rounded-xl border border-[#272A34] text-xs text-[#94A3B8] space-y-1">
                  <div className="flex justify-between">
                    <span>Veicolo:</span>
                    <strong className="text-white">{makeModel} ({fuelType})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Anno / Km:</span>
                    <strong className="text-white">{year} • {Number(mileage).toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Condizioni:</span>
                    <strong className="text-white truncate max-w-[200px]">{condition}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                      Il tuo Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Es. Mario Rossi"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E5A93C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                      Numero di Telefono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Es. 348 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#1C1E26] border border-[#272A34] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E5A93C]"
                    />
                  </div>
                </div>

                {/* BOTTONE CTA FINALE WHATSAPP CON TUTTI I PARAMETRI IMPAGINATI */}
                <div className="pt-3 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#10B981]/30 cursor-pointer"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>{loading ? 'Preparazione in corso...' : 'Invia Dati & Ricevi Valutazione su WhatsApp'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      ← Modifica dati veicolo
                    </button>
                    <span className="text-[11px] text-[#64748B]">Nessun vincolo di vendita</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0F1015] rounded-xl border border-[#272A34] text-[11px] text-[#94A3B8] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <span>Potrai allegare anche le foto direttamente nella chat WhatsApp per una quotazione ancora più accurata.</span>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
