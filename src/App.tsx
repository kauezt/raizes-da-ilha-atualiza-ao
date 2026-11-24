import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { HighlightsSection } from './components/HighlightsSection';
import { BookingQuestionnaire } from './components/BookingQuestionnaire';
import { Footer } from './components/Footer';
import { FloatingWhatsApp, FloatingAdminButton } from './components/FloatingButtons';
import { AdminPanel } from './components/AdminPanel';
import { Lightbox } from './components/Lightbox';
import { ExperienceModal, ExperienceCategory } from './components/ExperienceModal';
import { useApp } from './context/AppContext';
import { ServiceOptionId } from './utils/questionnaire';

export const App: React.FC = () => {
  const { settings, setLightboxIndex, activeGallery } = useApp();
  const [selectedExperience, setSelectedExperience] = useState<ExperienceCategory | null>(null);
  const [preselectedService, setPreselectedService] = useState<ServiceOptionId | null>(null);

  // Synchronize document title and favicon with settings
  useEffect(() => {
    document.title = `${settings.name} — Turismo, Cultura e Natureza em São Luís`;
    if (settings.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.name, settings.favicon]);

  const handleOpenGallery = () => {
    if (activeGallery.length > 0) {
      setLightboxIndex(0);
    }
  };

  const handleIncludeInRoute = (service?: ServiceOptionId) => {
    if (service) {
      setPreselectedService(service);
    }
    const target = document.getElementById('questionario');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--off)] text-[var(--ink)] font-sans selection:bg-[#DE952F]/30 selection:text-[var(--gd)]">
      {/* Section 1: Header */}
      <Navbar onOpenGallery={handleOpenGallery} />

      {/* Exact 5-band main layout matching visual reference + interactive questionnaire */}
      <main>
        {/* Section 2: Hero */}
        <Hero />

        {/* Section 3: About the Project */}
        <AboutSection />

        {/* Section 4: Experiences */}
        <HighlightsSection onSelectCategory={(cat) => setSelectedExperience(cat)} />

        {/* Section 5: Plan Your Experience + Interactive Questionnaire */}
        <BookingQuestionnaire
          preselectedService={preselectedService}
          onClearPreselectedService={() => setPreselectedService(null)}
        />
      </main>

      {/* Section 6: Footer */}
      <Footer onOpenGallery={handleOpenGallery} />

      {/* Interactive Experience & Gallery Modals */}
      <ExperienceModal
        category={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onIncludeInRoute={handleIncludeInRoute}
        onOpenGallery={handleOpenGallery}
      />
      <Lightbox />

      {/* Discrete Floating Controls */}
      <FloatingWhatsApp />
      <FloatingAdminButton />

      {/* Admin Panel */}
      <AdminPanel />
    </div>
  );
};

export default App;
