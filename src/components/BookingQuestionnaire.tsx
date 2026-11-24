import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatWhatsAppDisplay } from '../config/whatsapp';
import {
  ALL_SERVICE_IDS,
  INITIAL_QUESTIONNAIRE_DATA,
  QuestionnaireData,
  SERVICE_LABELS,
  ServiceOptionId,
  buildWhatsAppQuoteUrl,
  formatIsoDateBr,
  formatPeopleSummary,
  getTotalPeople,
  isAllServicesSelected,
  toggleAllServices,
  toggleSingleService,
  validateStep,
} from '../utils/questionnaire';
import {
  Anchor,
  Home,
  Utensils,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Calendar,
  Users,
  MessageCircle,
  Edit3,
  RotateCcw,
  AlertCircle,
  Search,
  Heart,
  ArrowRight,
} from 'lucide-react';

const STEP_TITLES = [
  'Experiências',
  'Pessoas',
  'Detalhes',
  'Contato',
  'Resumo',
];

interface ServiceCardMeta {
  id: ServiceOptionId | 'tudo';
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl?: string;
}

interface BookingQuestionnaireProps {
  preselectedService?: ServiceOptionId | null;
  onClearPreselectedService?: () => void;
}

export const BookingQuestionnaire: React.FC<BookingQuestionnaireProps> = ({
  preselectedService,
  onClearPreselectedService,
}) => {
  const { settings, tours, stays, dishes } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);
  const [formData, setFormData] = useState<QuestionnaireData>(INITIAL_QUESTIONNAIRE_DATA);
  const [stepError, setStepError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [autoForwardedNotice, setAutoForwardedNotice] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const autoForwardLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!preselectedService) return;
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(preselectedService)
        ? prev.services
        : [...prev.services, preselectedService],
    }));
    setCurrentStep(1);
    setStepError(null);
    onClearPreselectedService?.();
  }, [preselectedService, onClearPreselectedService]);

  const scrollCardIntoView = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const serviceCards: ServiceCardMeta[] = useMemo(
    () => [
      {
        id: 'passeio',
        title: 'Passeio de barco',
        description: 'Navegação pelos igarapés, manguezais e paisagens naturais da Raposa.',
        icon: <Anchor size={20} />,
        imageUrl: tours[0]?.foto || settings.tourImage,
      },
      {
        id: 'hospedagem',
        title: 'Hospedagem',
        description: 'Descanso acolhedor em contato com a tranquilidade das águas.',
        icon: <Home size={20} />,
        imageUrl: stays[0]?.foto || settings.aboutImage,
      },
      {
        id: 'restaurante',
        title: 'Restaurante',
        description: 'Gastronomia regional preparada com ingredientes frescos locais.',
        icon: <Utensils size={20} />,
        imageUrl: dishes[0]?.foto || settings.aboutImage,
      },
      {
        id: 'tudo',
        title: 'Quero aproveitar tudo',
        description: 'Seleciona passeio de barco + hospedagem + restaurante para uma vivência completa.',
        icon: <Sparkles size={20} />,
        imageUrl: settings.aboutImage || settings.heroImage,
      },
    ],
    [tours, stays, dishes, settings.tourImage, settings.aboutImage, settings.heroImage]
  );

  const allSelected = isAllServicesSelected(formData.services);
  const totalPeople = getTotalPeople(formData);
  const progressPercent = Math.round((currentStep / 5) * 100);
  const whatsappUrl = useMemo(
    () => buildWhatsAppQuoteUrl(formData, settings.whatsapp),
    [formData, settings.whatsapp]
  );

  const handleToggleCard = (cardId: ServiceOptionId | 'tudo') => {
    setStepError(null);
    setFormData((prev) => {
      const nextServices =
        cardId === 'tudo'
          ? toggleAllServices(prev.services)
          : toggleSingleService(prev.services, cardId);
      return {
        ...prev,
        services: nextServices,
      };
    });
  };

  const handleAdultsChange = (delta: number) => {
    setStepError(null);
    setFormData((prev) => {
      const nextAdults = Math.max(1, Math.min(40, prev.adults + delta));
      const nextTotal = nextAdults + prev.children;
      return {
        ...prev,
        adults: nextAdults,
        stay: {
          ...prev.stay,
          guestsCount: prev.stay.guestsManuallyEdited
            ? prev.stay.guestsCount
            : nextTotal,
        },
      };
    });
  };

  const handleChildrenChange = (delta: number) => {
    setStepError(null);
    setFormData((prev) => {
      const nextChildren = Math.max(0, Math.min(30, prev.children + delta));
      const nextTotal = prev.adults + nextChildren;
      return {
        ...prev,
        children: nextChildren,
        stay: {
          ...prev.stay,
          guestsCount: prev.stay.guestsManuallyEdited
            ? prev.stay.guestsCount
            : nextTotal,
        },
      };
    });
  };

  const handleStayGuestsChange = (delta: number) => {
    setStepError(null);
    setFormData((prev) => ({
      ...prev,
      stay: {
        ...prev.stay,
        guestsManuallyEdited: true,
        guestsCount: Math.max(1, Math.min(50, prev.stay.guestsCount + delta)),
      },
    }));
  };

  const autoRedirectEnabled = settings.whatsappAutoRedirect !== false;
  const formattedDestinationNumber = formatWhatsAppDisplay(settings.whatsapp);

  const goToNextStep = () => {
    const result = validateStep(currentStep, formData);
    if (!result.valid) {
      setStepError(result.error || 'Verifique os campos antes de avançar.');
      scrollCardIntoView();
      return;
    }
    setStepError(null);
    const nextStep = Math.min(5, currentStep + 1);

    // Ao concluir o questionário (etapa 4 -> etapa 5), encaminha para o WhatsApp configurado
    if (currentStep === 4 && nextStep === 5 && autoRedirectEnabled) {
      const targetUrl = buildWhatsAppQuoteUrl(formData, settings.whatsapp);
      setAutoForwardedNotice(true);
      if (autoForwardLinkRef.current) {
        autoForwardLinkRef.current.href = targetUrl;
        autoForwardLinkRef.current.click();
      }
    } else {
      setAutoForwardedNotice(false);
    }

    setCurrentStep(nextStep);
    setMaxReachedStep((prev) => Math.max(prev, nextStep));
    scrollCardIntoView();
  };

  const goToPrevStep = () => {
    setStepError(null);
    setAutoForwardedNotice(false);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    scrollCardIntoView();
  };

  const jumpToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;
    // Allow going back freely; going forward validates intermediate steps
    if (targetStep < currentStep) {
      setStepError(null);
      setAutoForwardedNotice(false);
      setCurrentStep(targetStep);
      scrollCardIntoView();
      return;
    }
    if (targetStep <= maxReachedStep) {
      for (let s = currentStep; s < targetStep; s += 1) {
        const res = validateStep(s, formData);
        if (!res.valid) {
          setStepError(res.error || 'Complete esta etapa antes de avançar.');
          setCurrentStep(s);
          scrollCardIntoView();
          return;
        }
      }
      setStepError(null);
      setAutoForwardedNotice(false);
      setCurrentStep(targetStep);
      scrollCardIntoView();
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_QUESTIONNAIRE_DATA);
    setStepError(null);
    setAutoForwardedNotice(false);
    setCurrentStep(1);
    setMaxReachedStep(1);
  };

  return (
    <section
      id="questionario"
      className="py-20 sm:py-24 bg-[#F6F2E4] text-[#253822] relative"
    >
      <div className="max-w-[1180px] mx-auto px-5 sm:px-6">
        {/* Reference-matched Header: 3-step roadmap left + Atmospheric green CTA card right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-14 sm:mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-0.5 bg-[#DE952F] rounded-full" />
                <p className="eyebrow uppercase tracking-[0.2em] text-xs font-bold text-[#B74C1E]">
                  Planeje sua experiência
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#253B21] leading-tight">
                Da ideia ao passeio perfeito
              </h2>
              <p className="text-sm sm:text-base text-[#253822]/85 max-w-xl">
                Siga alguns passos simples e comece sua jornada pela ilha.
              </p>
            </div>

            {/* 3 Visual Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 relative">
              <div
                className="hidden sm:block absolute top-6 left-[18%] right-[18%] h-px bg-[#DE952F]/65"
                aria-hidden="true"
              />

              <div className="flex flex-col items-center text-center gap-2 relative z-10">
                <span className="w-7 h-7 rounded-full bg-[#32532E] text-[#F6F2E4] text-xs font-bold flex items-center justify-center shadow tabular-nums">
                  1
                </span>
                <Search size={24} strokeWidth={1.8} className="text-[#32532E] mt-1" />
                <h3 className="font-serif text-lg font-bold text-[#253B21]">Explore</h3>
                <p className="text-xs text-[#253822]/80 leading-snug">
                  Conheça nossas opções de passeios
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-2 relative z-10">
                <span className="w-7 h-7 rounded-full bg-[#32532E] text-[#F6F2E4] text-xs font-bold flex items-center justify-center shadow tabular-nums">
                  2
                </span>
                <Calendar size={24} strokeWidth={1.8} className="text-[#32532E] mt-1" />
                <h3 className="font-serif text-lg font-bold text-[#253B21]">Escolha</h3>
                <p className="text-xs text-[#253822]/80 leading-snug">
                  Reserve a experiência que mais combina com você
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-2 relative z-10">
                <span className="w-7 h-7 rounded-full bg-[#32532E] text-[#F6F2E4] text-xs font-bold flex items-center justify-center shadow tabular-nums">
                  3
                </span>
                <Heart size={24} strokeWidth={1.8} className="text-[#32532E] mt-1" />
                <h3 className="font-serif text-lg font-bold text-[#253B21]">Viva</h3>
                <p className="text-xs text-[#253822]/80 leading-snug">
                  Aproveite cada momento em São Luís!
                </p>
              </div>
            </div>
          </div>

          {/* Right Dark Forest Green Card matching reference */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden bg-[#32532E] text-[#F6F2E4] p-8 sm:p-10 text-center shadow-xl shadow-black/20 border border-[#40683B] flex flex-col items-center justify-center min-h-[260px]">
              {settings.heroImage && (
                <img
                  src={settings.heroImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity"
                />
              )}
              <div className="relative z-10 space-y-4 max-w-xs mx-auto">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F2E4]">
                  {settings.name}
                </h3>
                <p className="font-serif italic text-base sm:text-lg text-[#F6F2E4]/92 leading-snug">
                  Mais que um destino,<br />uma conexão.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={scrollCardIntoView}
                    className="inline-flex items-center gap-2 bg-[#F6F2E4] hover:bg-white text-[#32532E] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Reserve agora</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Questionnaire Card */}
        <div
          ref={cardRef}
          data-testid="questionnaire-card"
          data-step={currentStep}
          className="scroll-mt-24 max-w-[980px] mx-auto bg-[var(--card)] border border-[var(--line)] rounded-3xl shadow-xl shadow-black/10 overflow-hidden"
        >
          {/* Progress Header */}
          <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-[var(--line)] bg-[#EDE6D1]/65 space-y-4">
            <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
              <span className="font-semibold text-[var(--g)]">
                Etapa {currentStep} de 5 · {STEP_TITLES[currentStep - 1]}
              </span>
              <span className="text-[#B74C1E] font-semibold tabular-nums">
                {progressPercent}% concluído
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div
              className="w-full h-2 bg-[var(--line)] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso do questionário"
            >
              <div
                className="h-full bg-gradient-to-r from-[#DE952F] to-[#32532E] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step Breadcrumbs */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
              {STEP_TITLES.map((label, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                const isReachable = stepNum <= maxReachedStep;

                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!isReachable}
                    onClick={() => jumpToStep(stepNum)}
                    className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap truncate ${
                      isActive
                        ? 'bg-[#32532E] text-[#F6F2E4] shadow-xs'
                        : isCompleted
                        ? 'bg-[#EDE6D1] text-[#32532E] hover:bg-[#DE952F]/25 cursor-pointer'
                        : 'text-[var(--ink)]/50 cursor-default'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 tabular-nums ${
                        isActive
                          ? 'bg-[#DE952F] text-[#1F331C]'
                          : isCompleted
                          ? 'bg-[#32532E] text-[#F6F2E4]'
                          : 'bg-[var(--line)] text-[var(--ink)]/65'
                      }`}
                    >
                      {isCompleted ? <Check size={10} /> : stepNum}
                    </span>
                    <span className="hidden sm:inline truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Content Area */}
          <div className="p-5 sm:p-8 md:p-10">
            {/* Step Validation Error */}
            {stepError && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn"
              >
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{stepError}</span>
              </div>
            )}

            {/* ETAPA 1: O que gostaria de aproveitar na Raposa */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--g)] font-semibold">
                    O que você gostaria de aproveitar na Raposa?
                  </h3>
                  <p className="text-sm text-[var(--ink)]/75">
                    Você pode escolher um serviço específico ou combinar vários. Ao clicar em “Quero aproveitar tudo”, os três são marcados automaticamente e você continua livre para ajustar como preferir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {serviceCards.map((card) => {
                    const isSelected =
                      card.id === 'tudo'
                        ? allSelected
                        : formData.services.includes(card.id);
                    const imgFailed = failedImages[card.id] || !card.imageUrl;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleToggleCard(card.id)}
                        className={`group text-left rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eb9d1f] cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[var(--g)] ring-2 ring-[#eb9d1f]/45 bg-[var(--off)] shadow-md -translate-y-0.5'
                            : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--gm)] hover:shadow-md'
                        }`}
                      >
                        {/* Visual Card Header Photo */}
                        <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gradient-to-br from-[#203b29] to-[#162c1e]">
                          {!imgFailed && card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setFailedImages((prev) => ({
                                  ...prev,
                                  [card.id]: true,
                                }))
                              }
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#f4efe3]/60">
                              {card.icon}
                            </div>
                          )}

                          {/* Measured Contrast Scrim */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                          {/* Selection Check Circle */}
                          <div
                            className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow ${
                              isSelected
                                ? 'bg-[#eb9d1f] text-[#162c1e] scale-105'
                                : 'bg-black/45 text-white/85 border border-white/40'
                            }`}
                          >
                            {isSelected ? <Check size={15} strokeWidth={3} /> : card.icon}
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-[#f4efe3]">
                            <span className="text-[#eb9d1f]">{card.icon}</span>
                            <span className="font-serif text-xl sm:text-2xl font-semibold leading-tight">
                              {card.title}
                            </span>
                          </div>
                        </div>

                        {/* Card Copy */}
                        <div className="p-4 flex-1 flex items-center justify-between gap-3">
                          <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed">
                            {card.description}
                          </p>
                          <span
                            className={`text-xs font-semibold shrink-0 px-2.5 py-1 rounded-md ${
                              isSelected
                                ? 'bg-[var(--g)] text-white'
                                : 'text-[var(--gm)]'
                            }`}
                          >
                            {isSelected ? 'Selecionado' : 'Escolher'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Summary Strip */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink)]/75">
                  <span>
                    {formData.services.length === 0
                      ? 'Nenhuma experiência selecionada ainda.'
                      : `Selecionado: ${formData.services
                          .map((id) => SERVICE_LABELS[id])
                          .join(' · ')}`}
                  </span>
                </div>
              </div>
            )}

            {/* ETAPA 2: Quantas pessoas participarão */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--g)] font-semibold">
                    Quantas pessoas participarão dessa experiência?
                  </h3>
                  <p className="text-sm text-[var(--ink)]/75">
                    Separe entre adultos e crianças (se houver) para que nossa equipe prepare a melhor opção para o seu grupo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Adultos */}
                  <div className="p-5 rounded-2xl bg-[var(--off)] border border-[var(--line)] flex items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl font-semibold text-[var(--g)]">
                        Adultos
                      </p>
                      <p className="text-xs text-[var(--ink)]/65">
                        A partir de 12 anos · Mínimo 1
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Diminuir adultos"
                        disabled={formData.adults <= 1}
                        onClick={() => handleAdultsChange(-1)}
                        className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--sand)] disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span
                        data-testid="adults-count"
                        className="w-8 text-center font-semibold text-lg tabular-nums"
                      >
                        {formData.adults}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar adultos"
                        onClick={() => handleAdultsChange(1)}
                        className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--g)] text-white hover:bg-[var(--gd)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Crianças */}
                  <div className="p-5 rounded-2xl bg-[var(--off)] border border-[var(--line)] flex items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl font-semibold text-[var(--g)]">
                        Crianças
                      </p>
                      <p className="text-xs text-[var(--ink)]/65">
                        Opcional · Menores de 12 anos
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Diminuir crianças"
                        disabled={formData.children <= 0}
                        onClick={() => handleChildrenChange(-1)}
                        className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--sand)] disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>
                      <span
                        data-testid="children-count"
                        className="w-8 text-center font-semibold text-lg tabular-nums"
                      >
                        {formData.children}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar crianças"
                        onClick={() => handleChildrenChange(1)}
                        className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--g)] text-white hover:bg-[var(--gd)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--sand)]/70 border border-[var(--line)] flex items-center gap-3 text-sm text-[var(--ink)]">
                  <Users size={18} className="text-[var(--g)] shrink-0" />
                  <span>
                    Resumo do grupo:{' '}
                    <strong className="text-[var(--g)] tabular-nums">
                      {formatPeopleSummary(formData.adults, formData.children)}
                    </strong>{' '}
                    ({totalPeople} {totalPeople === 1 ? 'pessoa' : 'pessoas'} no total).
                  </span>
                </div>
              </div>
            )}

            {/* ETAPA 3: Informações específicas sobre os serviços selecionados */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--g)] font-semibold">
                    Detalhes dos serviços selecionados
                  </h3>
                  <p className="text-sm text-[var(--ink)]/75">
                    As datas e o tempo de hospedagem são opcionais — se você ainda estiver planejando a viagem, pode deixar em branco e avançar normalmente.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Passeio de barco */}
                  {formData.services.includes('passeio') && (
                    <div
                      data-testid="details-passeio"
                      className="p-5 sm:p-6 rounded-2xl bg-[var(--off)] border border-[var(--line)] space-y-4"
                    >
                      <div className="flex items-center gap-2.5 text-[var(--g)]">
                        <Anchor size={20} className="text-[var(--gm)]" />
                        <h4 className="font-serif text-xl sm:text-2xl font-semibold">
                          Passeio de barco
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="tour-date"
                            className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                          >
                            Qual data pretende realizar o passeio? (opcional)
                          </label>
                          <input
                            id="tour-date"
                            type="date"
                            value={formData.tour.date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                tour: { ...prev.tour, date: e.target.value },
                              }))
                            }
                            className="w-full bg-[var(--card)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                          />
                        </div>

                        <div
                          data-testid="tour-tide-notice"
                          className="rounded-xl bg-[var(--sand)]/85 border border-[var(--g)]/35 p-3.5 text-xs leading-relaxed text-[var(--ink)] flex items-start gap-2.5"
                        >
                          <AlertCircle size={17} className="text-[var(--g)] shrink-0 mt-0.5" />
                          <p className="font-semibold tracking-wide">
                            HORÁRIO E DIA SUJEITO A MUDANÇAS. O HORÁRIO DO PASSEIO DEPENDE DA MARÉ, PODENDO SOFRER ALTERAÇÕES NO DIA E HORA. CONFIRME MELHOR CONOSCO!
                          </p>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label
                            htmlFor="tour-notes"
                            className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                          >
                            Existe alguma preferência ou observação sobre o passeio?
                          </label>
                          <textarea
                            id="tour-notes"
                            rows={2}
                            placeholder="Ex.: preferência de turno, passeio mais tranquilo, interesse em fotografia..."
                            value={formData.tour.notes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                tour: { ...prev.tour, notes: e.target.value },
                              }))
                            }
                            className="w-full bg-[var(--card)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hospedagem */}
                  {formData.services.includes('hospedagem') && (
                    <div
                      data-testid="details-hospedagem"
                      className="p-5 sm:p-6 rounded-2xl bg-[var(--off)] border border-[var(--line)] space-y-4"
                    >
                      <div className="flex items-center gap-2.5 text-[var(--g)]">
                        <Home size={20} className="text-[var(--gm)]" />
                        <h4 className="font-serif text-xl sm:text-2xl font-semibold">
                          Hospedagem
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="stay-duration"
                            className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                          >
                            Quantos dias ou horas pretende se hospedar? (opcional)
                          </label>
                          <input
                            id="stay-duration"
                            type="text"
                            placeholder="Ex.: 2 dias, 1 fim de semana, 6 horas..."
                            value={formData.stay.duration}
                            onChange={(e) => {
                              setStepError(null);
                              setFormData((prev) => ({
                                ...prev,
                                stay: { ...prev.stay, duration: e.target.value },
                              }));
                            }}
                            className="w-full bg-[var(--card)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                          />
                          <p className="text-xs text-[var(--ink)]/75">
                            Detalharemos disponibilidade e valores certinhos com você quando encaminharmos para o WhatsApp.
                          </p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)]">
                          <div>
                            <p className="text-sm font-semibold text-[var(--g)]">
                              Quantas pessoas ficarão hospedadas?
                            </p>
                            <p className="text-xs text-[var(--ink)]/65">
                              Ajuste caso apenas parte do grupo vá se hospedar.
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              aria-label="Diminuir hóspedes"
                              disabled={formData.stay.guestsCount <= 1}
                              onClick={() => handleStayGuestsChange(-1)}
                              className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--card)] hover:bg-[var(--sand)] disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus size={18} />
                            </button>
                            <span
                              data-testid="stay-guests-count"
                              className="w-8 text-center font-semibold text-lg tabular-nums"
                            >
                              {formData.stay.guestsCount}
                            </span>
                            <button
                              type="button"
                              aria-label="Aumentar hóspedes"
                              onClick={() => handleStayGuestsChange(1)}
                              className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--g)] text-white hover:bg-[var(--gd)] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restaurante */}
                  {formData.services.includes('restaurante') && (
                    <div
                      data-testid="details-restaurante"
                      className="p-5 sm:p-6 rounded-2xl bg-[var(--off)] border border-[var(--line)] space-y-4"
                    >
                      <div className="flex items-center gap-2.5 text-[var(--g)]">
                        <Utensils size={20} className="text-[#c9a56a]" />
                        <h4 className="font-serif text-xl sm:text-2xl font-semibold">
                          Restaurante
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="rest-date"
                            className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                          >
                            Para qual data deseja o atendimento? (opcional)
                          </label>
                          <input
                            id="rest-date"
                            type="date"
                            value={formData.restaurant.date}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                restaurant: {
                                  ...prev.restaurant,
                                  date: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-[var(--card)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label
                            htmlFor="rest-notes"
                            className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                          >
                            Existe alguma observação ou preferência?
                          </label>
                          <textarea
                            id="rest-notes"
                            rows={2}
                            placeholder="Ex.: almoço ou jantar, restrições alimentares, ocasião especial..."
                            value={formData.restaurant.notes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                restaurant: {
                                  ...prev.restaurant,
                                  notes: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-[var(--card)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações adicionais */}
                  <div className="space-y-1.5 pt-2">
                    <label
                      htmlFor="additional-notes"
                      className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                    >
                      Observações adicionais (opcional)
                    </label>
                    <textarea
                      id="additional-notes"
                      rows={2}
                      placeholder="Deseja informar horário previsto de chegada na Raposa ou algum detalhe extra?"
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          additionalNotes: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 4: Informações de contato */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--g)] font-semibold">
                    Seus dados de contato
                  </h3>
                  <p className="text-sm text-[var(--ink)]/75">
                    {autoRedirectEnabled
                      ? `Ao finalizar esta etapa, você será encaminhado para o WhatsApp ${formattedDestinationNumber} com o resumo completo das suas respostas para receber valores e disponibilidade.`
                      : 'Na próxima tela você verá o resumo completo para encaminhar diretamente ao WhatsApp do Raízes da Ilha. Nossa equipe responderá com valores, disponibilidade e opções personalizadas.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                    >
                      Seu nome *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Ex.: Mariana Silva"
                      value={formData.contact.name}
                      onChange={(e) => {
                        setStepError(null);
                        setFormData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, name: e.target.value },
                        }));
                      }}
                      className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm sm:text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold uppercase tracking-wide text-[var(--gm)]"
                    >
                      Telefone ou WhatsApp (opcional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="Ex.: (98) 99999-9999"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, phone: e.target.value },
                        }))
                      }
                      className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm sm:text-base text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--sand)]/65 border border-[var(--line)] text-xs sm:text-sm text-[var(--ink)]/85 flex items-start gap-3">
                  <MessageCircle size={18} className="text-[var(--g)] shrink-0 mt-0.5" />
                  <p>
                    Não exibimos preços fixos aqui porque cada roteiro varia conforme maré, época do ano e composição do grupo. Nossa equipe enviará a proposta detalhada no WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* ETAPA 5: Resumo da solicitação */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--g)] font-semibold">
                    Resumo da sua solicitação
                  </h3>
                  <p className="text-sm text-[var(--ink)]/75">
                    Confira as informações abaixo antes de abrir o WhatsApp. Se precisar ajustar qualquer detalhe, basta clicar em editar.
                  </p>
                </div>

                <div
                  data-testid="summary-review"
                  className="rounded-2xl border border-[var(--line)] bg-[var(--off)] divide-y divide-[var(--line)]"
                >
                  {/* Cliente */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gm)]">
                        Solicitante
                      </p>
                      <p className="text-base font-semibold text-[var(--g)] mt-1">
                        {formData.contact.name.trim()}
                      </p>
                      {formData.contact.phone.trim() && (
                        <p className="text-xs sm:text-sm text-[var(--ink)]/75 mt-0.5">
                          WhatsApp / Telefone: {formData.contact.phone.trim()}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => jumpToStep(4)}
                      className="text-xs font-semibold text-[var(--g)] hover:underline inline-flex items-center gap-1 shrink-0 py-1 px-2 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                  </div>

                  {/* Pessoas */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gm)]">
                        Quantidade de pessoas
                      </p>
                      <p className="text-sm sm:text-base font-medium text-[var(--ink)] mt-1 tabular-nums">
                        {formatPeopleSummary(formData.adults, formData.children)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => jumpToStep(2)}
                      className="text-xs font-semibold text-[var(--g)] hover:underline inline-flex items-center gap-1 shrink-0 py-1 px-2 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                  </div>

                  {/* Serviços selecionados */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gm)]">
                        Serviços selecionados
                      </p>
                      <ul className="mt-1.5 space-y-1 text-sm sm:text-base font-medium text-[var(--ink)]">
                        {ALL_SERVICE_IDS.filter((id) =>
                          formData.services.includes(id)
                        ).map((id) => (
                          <li key={id} className="flex items-center gap-2">
                            <Check size={15} className="text-[var(--gm)] shrink-0" />
                            <span>{SERVICE_LABELS[id]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => jumpToStep(1)}
                      className="text-xs font-semibold text-[var(--g)] hover:underline inline-flex items-center gap-1 shrink-0 py-1 px-2 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                  </div>

                  {/* Datas e Observações por serviço */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gm)] flex items-center gap-1.5">
                        <Calendar size={14} />
                        Datas e observações
                      </p>

                      {formData.services.includes('passeio') && (
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold text-[var(--g)]">Passeio de barco</p>
                          <p className="text-[var(--ink)]/80">
                            Data pretendida: {formatIsoDateBr(formData.tour.date)}
                          </p>
                          {formData.tour.notes.trim() && (
                            <p className="text-[var(--ink)]/80">
                              Observações: {formData.tour.notes.trim()}
                            </p>
                          )}
                        </div>
                      )}

                      {formData.services.includes('hospedagem') && (
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold text-[var(--g)]">Hospedagem</p>
                          <p className="text-[var(--ink)]/80">
                            Tempo pretendido: {formData.stay.duration.trim() || 'Ainda não definido'}
                          </p>
                          <p className="text-[var(--ink)]/80 tabular-nums">
                            Hóspedes: {formData.stay.guestsCount}
                          </p>
                        </div>
                      )}

                      {formData.services.includes('restaurante') && (
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold text-[var(--g)]">Restaurante</p>
                          <p className="text-[var(--ink)]/80">
                            Data desejada: {formatIsoDateBr(formData.restaurant.date)}
                          </p>
                          {formData.restaurant.notes.trim() && (
                            <p className="text-[var(--ink)]/80">
                              Observações: {formData.restaurant.notes.trim()}
                            </p>
                          )}
                        </div>
                      )}

                      {formData.additionalNotes.trim() && (
                        <div className="text-sm space-y-0.5 pt-1 border-t border-[var(--line)]">
                          <p className="font-semibold text-[var(--g)]">
                            Observações adicionais
                          </p>
                          <p className="text-[var(--ink)]/80">
                            {formData.additionalNotes.trim()}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => jumpToStep(3)}
                      className="text-xs font-semibold text-[var(--g)] hover:underline inline-flex items-center gap-1 shrink-0 py-1 px-2 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                  </div>
                </div>

                {/* Aviso de encaminhamento automático e botão de acesso direto */}
                <div className="pt-2 space-y-3 text-center">
                  {autoForwardedNotice && (
                    <div
                      data-testid="whatsapp-autoforward-banner"
                      className="rounded-2xl bg-[#32532E]/10 border border-[#32532E]/25 px-4 py-3 text-xs sm:text-sm text-[#253B21] flex items-center justify-center gap-2 text-left sm:text-center"
                    >
                      <Check size={16} className="text-[#32532E] shrink-0" />
                      <span>
                        Encaminhando seu atendimento para o WhatsApp{' '}
                        <strong className="font-semibold">{formattedDestinationNumber}</strong>.
                        Caso a conversa não tenha aberto automaticamente, toque no botão abaixo.
                      </span>
                    </div>
                  )}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-submit-link"
                    className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base uppercase tracking-wider shadow-lg"
                  >
                    <MessageCircle size={20} />
                    Solicitar orçamento pelo WhatsApp
                  </a>
                  <p className="text-xs text-[var(--ink)]/65">
                    O WhatsApp ({formattedDestinationNumber}) abrirá com a mensagem preenchida para você revisar e enviar.
                  </p>
                </div>
              </div>
            )}

            {/* Link oculto usado para encaminhamento síncrono via gesto do clique sem usar window.open */}
            <a
              ref={autoForwardLinkRef}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              data-testid="whatsapp-autoforward-anchor"
              className="sr-only"
            >
              Encaminhar para WhatsApp
            </a>

            {/* Step Footer Controls */}
            <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] text-xs sm:text-sm font-semibold text-[var(--ink)] hover:bg-[var(--sand)] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="btn-green inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-md"
                >
                  <span>
                    {currentStep === 4 && autoRedirectEnabled
                      ? 'Finalizar e ir para o WhatsApp'
                      : 'Avançar'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink)]/65 hover:text-[var(--g)] py-2 px-3 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Nova simulação
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
