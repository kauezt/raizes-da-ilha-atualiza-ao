import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { PackagesSection } from './components/PackagesSection';
import { TourSection } from './components/TourSection';
import { StaysSection } from './components/StaysSection';
import { RestaurantSection } from './components/RestaurantSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { InstagramBanner } from './components/InstagramBanner';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp, FloatingAdminButton } from './components/FloatingButtons';
import { Lightbox } from './components/Lightbox';
import { AdminPanel } from './components/AdminPanel';
import { useApp } from './context/AppContext';

export const App: React.FC = () => {
  const { settings } = useApp();

  // Synchronize document title with company name
  useEffect(() => {
    document.title = `${settings.name} — Turismo no mangue`;
  }, [settings.name]);

  // Scroll reveal animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--off)] text-[var(--ink)] font-sans selection:bg-[#c9a56a]/30 selection:text-[var(--gd)]">
      {/* Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main>
        <Hero />
        <AboutSection />
        <PackagesSection />
        <TourSection />
        <StaysSection />
        <RestaurantSection />
        <GallerySection />
        <TestimonialsSection />
        <InstagramBanner />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Action Buttons */}
      <FloatingWhatsApp />
      <FloatingAdminButton />

      {/* Modals & Overlays */}
      <Lightbox />
      <AdminPanel />
    </div>
  );
};

export default App;
