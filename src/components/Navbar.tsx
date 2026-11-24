import React, { useState, useEffect } from 'react';
import { RootsLogo } from './RootsLogo';
import { useApp } from '../context/AppContext';
import { Menu, X, Calendar } from 'lucide-react';

interface NavbarProps {
  onOpenGallery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGallery }) => {
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

  const navItems: Array<{
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
  }> = [
    { href: '#top', label: 'Início', active: true },
    { href: '#sobre', label: 'Sobre' },
    { href: '#experiencias', label: 'Experiências' },
    { label: 'Galeria', onClick: onOpenGallery },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <nav
      id="nav"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-2.5 ${
        isScrolled
          ? 'bg-[#243E21]/98 backdrop-blur-md shadow-lg shadow-black/25 border-b border-white/10'
          : 'bg-[#32532E]/96 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 lg:gap-8">
        <a
          href="#top"
          className="flex items-center gap-2 hover:opacity-95 transition-opacity min-w-0 lg:shrink-0"
        >
          <RootsLogo size={isScrolled ? 'sm' : 'md'} tone="light" stacked />
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7 xl:gap-9">
          {navItems.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="transition-colors text-sm font-medium tracking-wide whitespace-nowrap shrink-0 py-1 text-[#F6F2E4]/90 hover:text-[#DE952F] cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={`transition-colors text-sm font-medium tracking-wide whitespace-nowrap shrink-0 py-1 ${
                  item.active
                    ? 'text-[#F6F2E4] border-b-2 border-[#DE952F]'
                    : 'text-[#F6F2E4]/90 hover:text-[#DE952F]'
                }`}
              >
                {item.label}
              </a>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center shrink-0">
          <a
            href="#questionario"
            className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 shadow-md shadow-black/15"
          >
            <Calendar size={14} />
            <span>Reserve sua visita</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-[#F6F2E4] hover:text-[#DE952F] p-2 shrink-0 focus:outline-none"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#243E21]/98 border-t border-white/10 px-5 py-6 flex flex-col gap-3 text-center animate-fadeIn shadow-2xl">
          {navItems.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  item.onClick?.();
                }}
                className="text-[#F6F2E4] text-base font-medium py-2 hover:text-[#DE952F] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#F6F2E4] text-base font-medium py-2 hover:text-[#DE952F] transition-colors"
              >
                {item.label}
              </a>
            )
          )}
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="#questionario"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary inline-flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-full text-center"
            >
              <Calendar size={16} />
              Reserve sua visita
            </a>
            <a
              href={getWhatsAppUrl('Olá! Gostaria de informações sobre o Raízes da Ilha.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="border border-[#F6F2E4]/60 text-[#F6F2E4] hover:bg-white/10 text-sm font-semibold py-2.5 rounded-full text-center transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
