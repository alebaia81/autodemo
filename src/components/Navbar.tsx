import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Phone, Tag, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F1015]/85 backdrop-blur-xl border-b border-[#272A34]/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Mobile Menu Toggle & Brand Logo with Shield Emblem */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#16181F] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo & Shield Emblem (come nello screenshot benchmark) */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E5A93C] via-[#F59E0B] to-[#925C08] flex items-center justify-center shadow-lg shadow-[#E5A93C]/20 border border-[#E5A93C]/40 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-black fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base text-white tracking-widest uppercase">
                  GZ<span className="text-[#E5A93C]">AUTO</span>
                </span>
                <span className="text-[10px] text-[#94A3B8] tracking-wider uppercase -mt-0.5 hidden xs:block">
                  Castelvetro Piacentino
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (come nello screenshot benchmark) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-[#94A3B8]">
            <Link
              to="/"
              className={`hover:text-white transition-colors py-1 ${
                isActive('/') ? 'text-white border-b-2 border-[#E5A93C]' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/servizi"
              className={`hover:text-white transition-colors py-1 ${
                isActive('/servizi') ? 'text-white border-b-2 border-[#E5A93C]' : ''
              }`}
            >
              Servizi
            </Link>
            <Link
              to="/vendi-auto"
              className={`hover:text-white transition-colors py-1 flex items-center gap-1.5 ${
                isActive('/vendi-auto') ? 'text-white border-b-2 border-[#E5A93C]' : ''
              }`}
            >
              <span>Servizio Ritiro Auto</span>
            </Link>
            <Link
              to="/chi-siamo"
              className={`hover:text-white transition-colors py-1 ${
                isActive('/chi-siamo') ? 'text-white border-b-2 border-[#E5A93C]' : ''
              }`}
            >
              Chi Siamo
            </Link>
            <Link
              to="/admin"
              className={`hover:text-white transition-colors py-1 flex items-center gap-1 ${
                isActive('/admin') ? 'text-white border-b-2 border-[#E5A93C]' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Area Gabriel</span>
            </Link>
          </nav>

          {/* Right Action: Secondary text + White Pill Button "Neem contact op" -> "Contatta Gabriel" */}
          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="https://wa.me/393487051158?text=Buongiorno,%20vorrei%20richiedere%20un'auto%20su%20misura"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-block text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
            >
              Richiesta su misura
            </a>

            {/* Pill Button bianco puro / oro ad altissimo contrasto */}
            <a
              href="tel:+393487051158"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white hover:bg-gray-100 text-black font-extrabold text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-md shadow-white/10"
            >
              <Phone className="w-3.5 h-3.5 text-black fill-current" />
              <span>Contattaci</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#16181F] border-b border-[#272A34] px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-white py-1"
          >
            Home
          </Link>
          <Link
            to="/servizi"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-white py-1 flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#E5A93C]" />
            <span>I Nostri Servizi (Vendita, Permuta, Noleggio, Finanziamenti)</span>
          </Link>
          <Link
            to="/vendi-auto"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-[#E5A93C] py-1 flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            <span>Vendi la tua auto (Valutazione 24h)</span>
          </Link>
          <Link
            to="/chi-siamo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-white py-1 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
            <span>Chi Siamo</span>
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-white py-1 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
            <span>Gestionale Gabriel</span>
          </Link>
          <div className="pt-4 border-t border-[#272A34] flex flex-col gap-2">
            <a
              href="https://wa.me/393487051158"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Avvia Chat WhatsApp</span>
            </a>
            <a
              href="tel:+393487051158"
              className="w-full py-2.5 rounded-xl bg-[#1C1E26] text-white text-center text-xs font-bold border border-[#272A34]"
            >
              Chiama Showroom
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
