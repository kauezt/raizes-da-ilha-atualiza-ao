import React, { useState, useEffect } from 'react';
import { RootsLogo } from './RootsLogo';
import { useApp } from '../context/AppContext';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getWhatsAppUrl } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#sobre', label: 'Sobre' },
    { href: '#pacotes', label: 'Pacotes' },
    { href: '#passeio', label: 'Passeio' },
    { href: '#hospedagem', label: 'Hospedagem' },
    { href: '#restaurante', label: 'Restaurante' },
    { href: '#galeria', label: 'Galeria' },
  ];

  return (
    <nav
      id="nav"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 ${
        isScrolled
          ? 'bg-[#142a20]/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-[#142a20]/80 to-transparent'
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-5 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <RootsLogo size={isScrolled ? 'sm' : 'md'} />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#f3eddc] hover:text-[#c9a56a] transition-colors text-sm font-medium tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contato"
            className="btn-primary text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-200"
          >
            Contato
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#f3eddc] hover:text-[#c9a56a] p-2 focus:outline-none"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#142a20]/98 border-t border-[#2a3b30] px-5 py-6 flex flex-col gap-4 text-center animate-fadeIn shadow-2xl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#f3eddc] text-base font-medium py-2 hover:text-[#c9a56a] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary text-sm font-semibold uppercase tracking-wider py-3 rounded-full text-center"
            >
              Contato
            </a>
            <a
              href={getWhatsAppUrl('Olá! Gostaria de informações sobre o Raízes da Ilha.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="border border-[#c9a56a] text-[#c9a56a] hover:bg-[#c9a56a]/10 text-sm font-semibold uppercase tracking-wider py-2.5 rounded-full text-center transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
