import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0B0E] border-t border-[#272A34] text-[#94A3B8] pt-12 pb-24 md:pb-12 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#E5A93C] flex items-center justify-center font-bold text-black text-sm">
                GZ
              </div>
              <span className="font-bold text-white text-base">G.Z. Auto Usate</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Vendita auto usate certificate, perizia tecnica su oltre 60 punti, chilometraggio garantito a contratto e massima trasparenza.
            </p>
            <div className="flex items-center gap-2 text-xs text-white">
              <Clock className="w-4 h-4 text-[#E5A93C]" />
              <span>Lun - Sab: 08:30 - 12:30 / 14:30 - 19:00</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm tracking-wide">NAVIGAZIONE RAPIDA</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#E5A93C] transition-colors">Parco Auto Disponibile</Link>
              </li>
              <li>
                <Link to="/servizi" className="hover:text-[#E5A93C] transition-colors">I Nostri Servizi</Link>
              </li>
              <li>
                <Link to="/chi-siamo" className="hover:text-[#E5A93C] transition-colors">Chi Siamo</Link>
              </li>
              <li>
                <Link to="/vendi-auto" className="hover:text-[#E5A93C] transition-colors">Valutazione & Permuta Usato</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm tracking-wide">DOVE SIAMO & CONTATTI</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                <span>Via Statale 30, Castelvetro Piacentino (PC)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E5A93C] shrink-0" />
                <span>+39 348 7051158</span>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                <a 
                  href="https://wa.me/393487051158" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-[#25D366] transition-colors"
                >
                  Assistenza WhatsApp attiva 7/7
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm tracking-wide">STANDARDS & GARANZIE</h4>
            <ul className="space-y-1.5 text-xs text-[#94A3B8]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Chilometraggio contrattualmente garantito</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Perizia di 68 controlli di preconsegna</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Garanzia di conformità 12-48 mesi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>Nessun obbligo di finanziamento</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#272A34] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} G.Z. Auto Usate. Tutti i diritti riservati.</p>
          <p>Castelvetro Piacentino (PC) - P.IVA su richiesta</p>
        </div>
      </div>
    </footer>
  );
};

