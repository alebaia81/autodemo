import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Car, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: 'Chilometraggio Contrattuale Garantito',
      desc: 'Nessun dubbio sul passato della vettura: la percorrenza reale è verificata, documentata e certificata per iscritto sia in fattura che nell\'atto di vendita.'
    },
    {
      icon: CheckCircle2,
      title: 'Protocollo di 68 Controlli Tecnici',
      desc: 'Prima di essere consegnata, ogni auto viene sottoposta a una perizia rigorosa di officina: meccanica, freni, pneumatici, telaio, elettronica e igienizzazione profonda ad ozono.'
    },
    {
      icon: Lock,
      title: 'Prezzi Reali, Zero Vincoli Nascosti',
      desc: 'Crediamo nell\'onestà intellettuale: il prezzo che vedi è reale e non è vincolato a finanziamenti forzati o polizze assicurative capestro.'
    },
    {
      icon: ShieldCheck,
      title: 'Garanzia di Conformità Reale',
      desc: 'Copertura legale di conformità 12 mesi inclusa, con possibilità di estensione fino a 36 o 48 mesi con assistenza stradale h24 su tutto il territorio europeo.'
    }
  ];

  const stats = [
    { value: '100%', label: 'Chilometri Certificati a Contratto' },
    { value: '68+', label: 'Controlli Tecnici Preconsegna' },
    { value: '12-48', label: 'Mesi di Garanzia Estendibile' },
    { value: '4.9 ★', label: 'Valutazione Soddisfazione Clienti' }
  ];

  return (
    <div className="min-h-screen bg-[#0F1015] text-white">
      {/* 1. HERO HEADER */}
      <section className="relative py-16 sm:py-24 border-b border-[#272A34] overflow-hidden">
        {/* Glow circolare d'atmosfera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E5A93C]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16181F] border border-[#E5A93C]/40 text-[#E5A93C] text-xs font-mono font-bold tracking-wider uppercase mb-5 shadow-lg shadow-[#E5A93C]/10">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
            <span>CHI SIAMO • G.Z. AUTO USATE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight">
            L&apos;auto giusta, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E5A93C] to-[#E5A93C]">
              con la massima trasparenza.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Fondata a Castelvetro Piacentino, G.Z. Auto Usate nasce con un obiettivo preciso: restituire fiducia e serenità all&apos;acquisto dell&apos;auto usata attraverso rigore tecnico, chiarezza contrattuale e un rapporto umano autentico.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/#catalogo"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#E5A93C]/20"
            >
              <Car className="w-4 h-4" />
              <span>Esplora il Parco Auto</span>
            </Link>
            <a
              href="https://wa.me/393487051158?text=Buongiorno,%20vorrei%20maggiori%20informazioni%20su%20GZ%20Auto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/25"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Consulenza su WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATISTICHE DI AUTOREVOLEZZA */}
      <section className="border-b border-[#272A34] bg-[#121318] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#16181F]/70 border border-[#272A34]">
                <div className="text-2xl sm:text-4xl font-black text-[#E5A93C] font-mono">
                  {s.value}
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. IL NOSTRO MANIFESTO: TRASPARENZA RADICALE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] bg-[#E5A93C]/10 px-3.5 py-1.5 rounded-full border border-[#E5A93C]/20 inline-block mb-3">
              LA NOSTRA FILOSOFIA
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-snug">
              Non vendiamo promesse. <br />
              Certifichiamo la realtà.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed mt-6">
              <p>
                Nel mercato dell&apos;auto usata, il consumatore si trova spesso di fronte a prezzi civetta, contratti poco chiari e chilometraggi non verificabili. G.Z. Auto Usate è nata per essere l&apos;esatto contrario.
              </p>
              <p>
                Selezioniamo direttamente ogni singolo veicolo, rifiutando vetture con cronologia dubbia o danni strutturali. Prima di pubblicare un annuncio, l&apos;auto viene controllata scrupolosamente in officina e collaudata su strada.
              </p>
              <p>
                Vogliamo che chi sceglie G.Z. Auto guidi con la certezza di aver fatto un acquisto sicuro, protetto e conforme a quanto concordato.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/servizi"
                className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#E5A93C] hover:text-white transition-colors"
              >
                <span>Scopri tutti i nostri servizi integrati</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Box I 4 Pilastri */}
          <div className="space-y-4">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={idx}
                  className="bg-[#16181F] p-5 sm:p-6 rounded-2xl border border-[#272A34] hover:border-[#E5A93C]/40 transition-colors shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SEDE, ORARI & CONTATTI SHOWROOM */}
      <section className="bg-[#121318] py-16 border-t border-b border-[#272A34]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Vieni a Trovarci in Showroom
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
              Siamo a Castelvetro Piacentino, a 8 minuti da Cremona e 15 minuti da Piacenza. Test drive gratuito senza impegno su qualsiasi veicolo disponibile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Indirizzo Showroom</h3>
              <p className="text-[#94A3B8] leading-relaxed">
                Via Statale 30<br />
                29010 Castelvetro Piacentino (PC)<br />
                <span className="text-[#E5A93C] font-semibold text-xs mt-1 block">Ampio parcheggio clienti interno</span>
              </p>
            </div>

            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Orari di Apertura</h3>
              <div className="text-[#94A3B8] space-y-1">
                <p><strong className="text-white">Lun - Ven:</strong> 08:30 - 12:30 / 14:30 - 19:00</p>
                <p><strong className="text-white">Sabato:</strong> 08:30 - 12:30 / 14:30 - 18:30</p>
                <p><strong className="text-white">Domenica:</strong> su appuntamento dedicato</p>
              </div>
            </div>

            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C]">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Contatti Diretti</h3>
              <div className="text-[#94A3B8] space-y-1.5">
                <p>Telefono: <strong className="text-white">+39 348 7051158</strong></p>
                <p>WhatsApp: <strong className="text-[#25D366]">Attivo 7 giorni su 7</strong></p>
                <p>Email: <span className="text-white">info@gzautousate.it</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BANNER CTA FINALE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-r from-[#16181F] via-[#1C1E26] to-[#16181F] p-8 sm:p-12 rounded-3xl border border-[#E5A93C]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5A93C]/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Cerchi un&apos;auto specifica o vuoi permutare la tua?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto mt-3">
            Siamo a tua completa disposizione per guidarti con la massima trasparenza e professionalità.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/393487051158?text=Buongiorno,%20vorrei%20fissare%20un%20appuntamento%20presso%20il%20vostro%20showroom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-[#25D366]/30 active:scale-95"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              <span>Avvia Chat su WhatsApp</span>
            </a>
            <a
              href="tel:+393487051158"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black hover:bg-gray-100 font-extrabold text-xs sm:text-sm transition-all shadow-md"
            >
              <Phone className="w-4 h-4 text-black fill-current" />
              <span>Chiama Showroom</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
