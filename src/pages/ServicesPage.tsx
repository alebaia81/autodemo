import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  RefreshCw, 
  Key, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Phone, 
  FileCheck,
  Award
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

import imgVendita from '../assets/services/servizio-vendita.jpg';
import imgPermuta from '../assets/services/servizio-permuta.jpg';
import imgNoleggio from '../assets/services/servizio-noleggio.jpg';
import imgFinanziamenti from '../assets/services/servizio-finanziamenti.jpg';

export const ServicesPage: React.FC = () => {
  const services = [
    {
      id: 'vendita',
      title: 'Vendita Auto Usate Certificate',
      subtitle: 'Perizia meccanica rigorosa, chilometri garantiti a contratto e 12 mesi di conformità reale',
      badge: 'Standard d\'Eccellenza',
      image: imgVendita,
      icon: Car,
      description: 'Ogni vettura del nostro parco auto a Castelvetro Piacentino viene periziata, collaudata su strada e controllata meticolosamente. Rifiutiamo auto con sinistri pregressi o chilometraggio non verificabile: certifichiamo la storia manutentiva in fattura e a contratto per garantirti la massima serenità.',
      features: [
        'Chilometraggio contrattualmente certificato e verificabile',
        'Oltre 60 controlli tecnici di meccanica, telaio e diagnosi computerizzata',
        'Tagliando completo di preconsegna e igienizzazione profonda all\'ozono',
        'Garanzia legale di conformità 12 mesi estendibile fino a 48 mesi',
        'Test drive immediato su strada prima di qualsiasi impegno'
      ],
      primaryAction: {
        label: 'Esplora il Parco Auto Disponibile',
        link: '/#catalogo'
      },
      secondaryAction: {
        label: 'Richiedi Scheda Tecnica su WhatsApp',
        link: 'https://wa.me/393487051158?text=Buongiorno,%20vorrei%20informazioni%20sulle%20auto%20disponibili'
      }
    },
    {
      id: 'permuta',
      title: 'Permuta & Acquisto Immediato Usato',
      subtitle: 'Quotazione trasparente in 24h, bonifico istantaneo e disbrigo pratiche a nostro carico',
      badge: 'Liquidazione Sicura',
      image: imgPermuta,
      icon: RefreshCw,
      description: 'Vuoi vendere la tua auto attuale o usarla come anticipo sul tuo prossimo acquisto? Ti offriamo una perizia chiara basata sul reale valore di mercato, pagamento sicuro e tracciabile prima della firma del passaggio e zero rischi di truffe o perdite di tempo tra privati.',
      features: [
        'Quotazione personalizzata rapida e senza impegno in meno di 24 ore',
        'Ritiro diretto dell\'usato anche senza obbligo di acquisto',
        'Bonifico istantaneo verificabile prima del passaggio di proprietà',
        'Pratiche d\'agenzia e passaggio immediato interamente a nostro carico',
        'Zero rischi, zero attese e massima tutela contrattuale'
      ],
      primaryAction: {
        label: 'Valuta la tua Auto Online',
        link: '/vendi-auto'
      },
      secondaryAction: {
        label: 'Invia Foto e Dati su WhatsApp',
        link: 'https://wa.me/393487051158?text=Buongiorno,%20vorrei%20proporre%20la%20mia%20auto%20in%20permuta/ritiro'
      }
    },
    {
      id: 'noleggio',
      title: 'Noleggio Flessibile a Breve e Lungo Termine',
      subtitle: 'La libertà di guidare un\'auto sempre nuova con canone fisso all-inclusive e zero pensieri',
      badge: 'Formula All-Inclusive',
      image: imgNoleggio,
      icon: Key,
      description: 'Dalla vettura sostitutiva per emergenze o brevi trasferte alle formule a lungo termine per professionisti e aziende con vantaggi fiscali: scegli la flessibilità di guidare senza l\'onere di svalutazione, manutenzione o scadenze burocratiche.',
      features: [
        'Noleggio a breve termine per mobilità temporanea, lavoro o viaggi',
        'Noleggio a lungo termine con canone mensile fisso e deducibile',
        'Copertura assicurativa completa (RCA, Furto, Incendio, Kasko e Cristalli)',
        'Manutenzione ordinaria, straordinaria e cambio pneumatici inclusi',
        'Soccorso stradale h24 attivo su tutta la rete europea'
      ],
      primaryAction: {
        label: 'Richiedi Preventivo su WhatsApp',
        link: 'https://wa.me/393487051158?text=Buongiorno,%20vorrei%20un%20preventivo%20per%20il%20servizio%20di%20noleggio'
      },
      secondaryAction: {
        label: 'Contattaci Telefonicamente',
        link: 'tel:+393487051158'
      }
    },
    {
      id: 'finanziamenti',
      title: 'Piani Finanziari & Soluzioni di Credito su Misura',
      subtitle: 'Tassi convenzionati, anticipo zero facoltativo e approvazione rapida in 24 ore',
      badge: 'Tassi Agevolati',
      image: imgFinanziamenti,
      icon: CreditCard,
      description: 'In collaborazione con i principali gruppi bancari del settore automotive, sviluppiamo piani di rimborso calibrati esattamente sulle tue esigenze di spesa. Puoi modulare durata e anticipo, includendo garanzie accessorie per proteggere il tuo investimento nel tempo.',
      features: [
        'Piani rateali personalizzati da 12 a 84 mesi con o senza anticipo',
        'Tassi chiari e trasparenti senza costi occulti o clausole ingannevoli',
        'Possibilità di integrare coperture di Credito Protetto, Kasko e Furto/Incendio',
        'Istruttoria digitale e risposta rapida entro 24/48 ore lavorative',
        'Requisiti minimi: documento d\'identità, codice fiscale e ultimo reddito'
      ],
      primaryAction: {
        label: 'Simula Rata su WhatsApp',
        link: 'https://wa.me/393487051158?text=Buongiorno,%20vorrei%20simulare%20un%20piano%20di%20finanziamento'
      },
      secondaryAction: {
        label: 'Consulta il Parco Auto',
        link: '/#catalogo'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F1015] text-white">
      {/* 1. HERO HEADER SERVIZI */}
      <section className="relative py-16 sm:py-24 border-b border-[#272A34] overflow-hidden">
        {/* Glow circolare d'atmosfera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E5A93C]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16181F] border border-[#E5A93C]/40 text-[#E5A93C] text-xs font-mono font-bold tracking-wider uppercase mb-5 shadow-lg shadow-[#E5A93C]/10">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
            <span>SERVIZI INTEGRATI G.Z. AUTO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase max-w-4xl mx-auto leading-tight">
            Tutto per la tua auto. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E5A93C] to-[#E5A93C]">
              Senza intermediari.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Dalla scelta dell&apos;auto perfetta fino alla permuta del tuo usato, al noleggio e ai piani finanziari dedicati: offriamo un servizio completo, trasparente e veloce a Castelvetro Piacentino.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/393487051158"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/30 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Consulenza Rapida su WhatsApp</span>
            </a>
            <a
              href="tel:+393487051158"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#16181F] text-white font-extrabold text-xs sm:text-sm border border-[#272A34] hover:border-white transition-all"
            >
              <Phone className="w-4 h-4 text-[#E5A93C]" />
              <span>Chiama Showroom</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. ELENCO SERVIZI DETTAGLIATI (CARD ORIZZONTALI CON IMMAGINI PREMIUM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {services.map((service, index) => {
          const Icon = service.icon;
          const isEven = index % 2 === 1;

          return (
            <div
              key={service.id}
              id={service.id}
              className={`bg-[#16181F] rounded-3xl border border-[#272A34] overflow-hidden shadow-2xl flex flex-col ${
                isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } transition-all duration-300 hover:border-[#E5A93C]/40`}
            >
              {/* Immagine del servizio */}
              <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-[460px] overflow-hidden group">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16181F] via-transparent to-black/30 lg:hidden" />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E5A93C]/40 text-[#E5A93C] text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{service.badge}</span>
                </div>
              </div>

              {/* Dettagli e Contenuti del servizio */}
              <div className="lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#E5A93C]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {service.title}
                      </h2>
                      <p className="text-xs text-[#E5A93C] font-semibold mt-0.5">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mt-4">
                    {service.description}
                  </p>

                  {/* Elenco Punti di Forza */}
                  <div className="mt-6 space-y-2.5">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-200 font-medium">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pulsanti Azione */}
                <div className="mt-8 pt-6 border-t border-[#272A34] flex flex-wrap items-center gap-3">
                  {service.primaryAction.link.includes('wa.me') ? (
                    <a
                      href={service.primaryAction.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#25D366]/20 active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>{service.primaryAction.label}</span>
                    </a>
                  ) : service.primaryAction.link.startsWith('http') ? (
                    <a
                      href={service.primaryAction.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#E5A93C]/20"
                    >
                      <span>{service.primaryAction.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      to={service.primaryAction.link}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#E5A93C]/20"
                    >
                      <span>{service.primaryAction.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {service.secondaryAction.link.includes('wa.me') ? (
                    <a
                      href={service.secondaryAction.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#25D366]/20 active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>{service.secondaryAction.label}</span>
                    </a>
                  ) : (
                    <a
                      href={service.secondaryAction.link}
                      target={service.secondaryAction.link.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1E26] hover:bg-[#272A34] text-white font-bold text-xs sm:text-sm border border-[#272A34] transition-all"
                    >
                      <span>{service.secondaryAction.label}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. PERCHÉ SCEGLIERE G.Z. AUTO */}
      <section className="bg-[#121318] py-16 border-t border-b border-[#272A34]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              I Nostri Standard di Garanzia & Trasparenza
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
              Chiarezza contrattuale, perizia meticolosa su ogni veicolo e consulenza dedicata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34]">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Chilometri Certificati per Iscritto</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Tutte le auto del nostro salone hanno cronologia tagliandi verificata e chilometraggio riportato a contratto e fattura. Massima tutela legale per chi acquista.
              </p>
            </div>

            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34]">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Garanzia Reale 12 Mesi</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Copertura sui componenti meccanici ed elettronici essenziali con possibilità di estensione fino a 4 anni valida in tutta Italia e in Europa.
              </p>
            </div>

            <div className="bg-[#16181F] p-6 rounded-2xl border border-[#272A34]">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Velocità e Assistenza Continua</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Passaggi di proprietà immediati in sede, esito finanziamenti in 24 ore e assistenza WhatsApp attiva 7 giorni su 7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BANNER CONCLUSIVO DI CONTATTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-r from-[#16181F] via-[#1C1E26] to-[#16181F] p-8 sm:p-12 rounded-3xl border border-[#E5A93C]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5A93C]/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Desideri una Consulenza Personalizzata?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto mt-3">
            I nostri specialisti sono a tua disposizione per consigliarti la soluzione ideale in base alle tue esigenze di mobilità o aziendali.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/393487051158?text=Buongiorno,%20vorrei%20fissare%20un%20appuntamento%20o%20avere%20maggiori%20informazioni%20sui%20servizi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/30 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Avvia Chat su WhatsApp</span>
            </a>
            <a
              href="tel:+393487051158"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-gray-100 font-extrabold text-xs sm:text-sm transition-all shadow-md"
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

