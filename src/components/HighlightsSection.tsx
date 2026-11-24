import React from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Utensils, Landmark, MapPin } from 'lucide-react';
import { ExperienceCategory } from './ExperienceModal';
import { getExperienceCategoryConfig } from '../utils/experienceCategories';

interface HighlightsSectionProps {
  onSelectCategory: (category: ExperienceCategory) => void;
}

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({ onSelectCategory }) => {
  const { settings, stays, experienceCategories } = useApp();

  const featureImage =
    settings.tourImage ||
    stays[0]?.foto ||
    settings.aboutImage ||
    settings.heroImage;

  const roteirosMeta = getExperienceCategoryConfig(experienceCategories, 'roteiros');
  const gastronomiaMeta = getExperienceCategoryConfig(experienceCategories, 'gastronomia');
  const culturaMeta = getExperienceCategoryConfig(experienceCategories, 'cultura');
  const naturezaMeta = getExperienceCategoryConfig(experienceCategories, 'natureza');

  const pillars: Array<{
    id: ExperienceCategory;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    cardClass: string;
    iconClass: string;
    subClass: string;
  }> = [
    {
      id: 'roteiros',
      title: roteirosMeta.title,
      subtitle: roteirosMeta.subtitle,
      icon: <Camera size={24} strokeWidth={1.9} />,
      cardClass: 'bg-[#F6F2E4] text-[#253B21]',
      iconClass: 'text-[#253B21]',
      subClass: 'text-[#253B21]/75',
    },
    {
      id: 'gastronomia',
      title: gastronomiaMeta.title,
      subtitle: gastronomiaMeta.subtitle,
      icon: <Utensils size={24} strokeWidth={1.9} />,
      cardClass: 'bg-[#B74C1E] text-[#F6F2E4]',
      iconClass: 'text-[#F6F2E4]',
      subClass: 'text-[#F6F2E4]/90',
    },
    {
      id: 'cultura',
      title: culturaMeta.title,
      subtitle: culturaMeta.subtitle,
      icon: <Landmark size={24} strokeWidth={1.9} />,
      cardClass: 'bg-[#DE952F] text-[#1F331C]',
      iconClass: 'text-[#1F331C]',
      subClass: 'text-[#1F331C]/85',
    },
    {
      id: 'natureza',
      title: naturezaMeta.title,
      subtitle: naturezaMeta.subtitle,
      icon: <MapPin size={24} strokeWidth={1.9} />,
      cardClass: 'bg-[#44757A] text-[#F6F2E4]',
      iconClass: 'text-[#F6F2E4]',
      subClass: 'text-[#F6F2E4]/90',
    },
  ];

  return (
    <section
      id="experiencias"
      className="py-20 sm:py-24 bg-[#32532E] text-[#F6F2E4] relative overflow-hidden"
    >
      {/* Right-bleeding organic curved seaside sunset photo matching reference */}
      <div className="hidden lg:block absolute right-0 top-10 w-[44%] h-[360px] pointer-events-none select-none z-0">
        <div className="w-full h-full rounded-tl-[260px] rounded-bl-[140px] overflow-hidden border-l-2 border-b border-[#DE952F]/65 shadow-2xl shadow-black/40 relative">
          {featureImage && (
            <img
              src={featureImage}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#32532E]/45 via-transparent to-transparent" />
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5 sm:px-6 relative z-10">
        {/* Heading Area */}
        <div className="max-w-xl space-y-4 mb-10 lg:mb-14">
          <div className="flex items-center gap-3">
            <span className="w-7 h-0.5 bg-[#DE952F] rounded-full" />
            <p className="uppercase tracking-[0.2em] text-xs font-bold text-[#DE952F]">
              O que você encontra
            </p>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-[3.25rem] font-bold text-[#F6F2E4] leading-[1.06]">
            Tudo sobre
            <br />
            a Raposa em um só lugar.
          </h2>

          <p className="text-sm sm:text-base text-[#F6F2E4]/88 max-w-md">
            Explore, descubra e viva a ilha com a gente.
          </p>
        </div>

        {/* Mobile/Tablet curved photo preview */}
        <div className="lg:hidden mb-8">
          <div className="rounded-3xl rounded-tl-[4.5rem] overflow-hidden border border-[#DE952F]/50 shadow-xl aspect-[16/9]">
            {featureImage && (
              <img
                src={featureImage}
                alt="Paisagens de São Luís e da ilha"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* 4 Vivid Colored Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-20 lg:max-w-[940px]">
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onSelectCategory(pillar.id)}
              className={`${pillar.cardClass} rounded-2xl p-6 sm:p-7 min-h-[154px] flex flex-col items-center text-center justify-center gap-2 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE952F]`}
            >
              <div className={`${pillar.iconClass} mb-1`}>{pillar.icon}</div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {pillar.title}
              </h3>
              <p className={`text-xs sm:text-sm font-medium ${pillar.subClass}`}>
                {pillar.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
