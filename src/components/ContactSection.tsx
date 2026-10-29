import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, MapPin, Mail, ThumbsUp, Video, Play, MessageCircle } from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { SectionEditBadge } from './SectionEditBadge';

export const ContactSection: React.FC = () => {
  const { settings, getWhatsAppUrl } = useApp();

  return (
    <section id="contato" className="py-24 bg-[var(--off)] text-[var(--ink)] relative">
      <div className="max-w-[1160px] mx-auto px-5">
        <div className="flex justify-end mb-4">
          <SectionEditBadge tab="settings" label="Editar Contatos, Redes & Textos" />
        </div>

        <div className="max-w-3xl space-y-8">
          <div className="space-y-3">
            <p className="eyebrow uppercase tracking-[0.2em] text-xs font-semibold text-[var(--gm)]">
              {settings.contactEyebrow || 'Contato & Localização'}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--g)] leading-tight">
              {settings.contactTitle || 'Vamos planejar sua viagem'}
            </h2>
            <p className="text-base text-[var(--ink)]/80">
              {settings.contactSub || 'Estamos à disposição para tirar dúvidas, verificar disponibilidades de maré e formatar o melhor pacote para você e sua família.'}
            </p>
          </div>

          {/* Contact Badges / Chips */}
          <div className="flex flex-col items-start gap-3.5 text-base sm:text-lg">
            {settings.whatsapp && (
              <a
                href={getWhatsAppUrl(settings.whatsappDefaultMsg || 'Olá! Gostaria de falar sobre o Raízes da Ilha.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-5 py-3 rounded-2xl text-[var(--ink)] font-medium transition-all shadow-xs"
              >
                <Phone size={20} className="text-[#25d366]" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </a>
            )}

            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-5 py-3 rounded-2xl text-[var(--ink)] font-medium transition-all shadow-xs"
              >
                <InstagramIcon size={20} className="text-[#E1306C]" />
                <span>Instagram: {settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '@')}</span>
              </a>
            )}

            {settings.address && (
              <div className="inline-flex items-center gap-3 bg-[var(--sand)] border border-[var(--line)] px-5 py-3 rounded-2xl text-[var(--ink)] font-medium shadow-xs">
                <MapPin size={20} className="text-[var(--g)] shrink-0" />
                <span>{settings.address}</span>
              </div>
            )}

            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-3 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-5 py-3 rounded-2xl text-[var(--ink)] font-medium transition-all shadow-xs"
              >
                <Mail size={20} className="text-[var(--br)]" />
                <span>{settings.email}</span>
              </a>
            )}

            {/* Social channels if configured */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <ThumbsUp size={16} className="text-[#1877F2]" />
                  <span>Facebook</span>
                </a>
              )}

              {settings.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Video size={16} className="text-black dark:text-white" />
                  <span>TikTok</span>
                </a>
              )}

              {settings.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Play size={16} className="text-[#FF0000]" />
                  <span>YouTube</span>
                </a>
              )}
            </div>
          </div>

          <div className="pt-2">
            <a
              href={getWhatsAppUrl(settings.whatsappDefaultMsg || 'Olá! Gostaria de planejar meu roteiro no Raízes da Ilha.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-200"
            >
              <MessageCircle size={18} />
              {settings.contactCta || 'Enviar mensagem no WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
