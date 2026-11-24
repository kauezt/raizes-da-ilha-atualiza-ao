export interface SiteSettings {
  name: string;
  logo?: string;
  favicon?: string;

  // Hero Section
  heroBadge?: string;
  heroTitle: string;
  heroSub: string;
  heroImage?: string;
  heroCta1Text?: string;
  heroCta1Link?: string;
  heroCta2Text?: string;
  heroScrollText?: string;

  // About Section
  aboutEyebrow?: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage?: string;
  aboutChips?: string; // Comma separated or one per line
  aboutBadgeTitle?: string;
  aboutBadgeText?: string;

  // Packages Section
  packagesEyebrow?: string;
  packagesTitle?: string;
  packagesSub?: string;

  // Tour Section
  tourEyebrow?: string;
  tourTitle: string;
  tourSub?: string;
  tourBadge?: string;
  tourImage?: string;

  // Stays Section
  stayEyebrow?: string;
  stayTitle: string;
  staySub?: string;

  // Food Section
  foodEyebrow?: string;
  foodTitle: string;
  foodSub?: string;

  // Gallery Section
  galleryEyebrow?: string;
  galleryTitle?: string;
  gallerySub?: string;

  // Testimonials Section
  testEyebrow?: string;
  testTitle: string;
  testSub?: string;

  // Instagram Banner
  instagramTitle?: string;
  instagramSub?: string;
  instagramCta?: string;

  // Contact Section
  contactEyebrow?: string;
  contactTitle?: string;
  contactSub?: string;
  contactCta?: string;
  whatsapp?: string;
  whatsappAutoRedirect?: boolean;
  whatsappDefaultMsg?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  email?: string;
  address?: string;

  // Footer Section
  footerText: string;
  footerCopyright?: string;
  footerSub?: string;
}

export interface PackageItem {
  _id: string;
  nome: string;
  foto?: string;
  fotos?: string[];
  descricao: string;
  duracao: string;
  pessoas: string;
  inclusos: string;
  preco: number | string;
  promo?: number | string;
  ctaText?: string;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export interface TourItem {
  _id: string;
  nome: string;
  foto?: string;
  fotos?: string[];
  duracao: string;
  roteiro: string;
  capacidade: string;
  pontos: string;
  horarios: string;
  info: string;
  preco: number | string;
  ctaText?: string;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export interface StayItem {
  _id: string;
  nome: string;
  foto?: string;
  fotos?: string[];
  descricao: string;
  capacidade: string;
  comodidades: string;
  preco: number | string;
  info: string;
  ctaText?: string;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export interface DishItem {
  _id: string;
  nome: string;
  foto?: string;
  fotos?: string[];
  descricao: string;
  categoria: string;
  preco: number | string;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export interface GalleryItem {
  _id: string;
  foto: string;
  titulo: string;
  descricao: string;
  principal?: boolean;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export interface TestimonialItem {
  _id: string;
  nome: string;
  foto?: string;
  texto: string;
  nota: number;
  data: string;
  ordem: number;
  ativo: boolean;
  _demo?: boolean;
}

export type ExperienceCategoryId = 'roteiros' | 'gastronomia' | 'cultura' | 'natureza';

export interface ExperienceCategoryConfig {
  id: ExperienceCategoryId;
  title: string;
  subtitle: string;
  modalTitle: string;
  modalSubtitle: string;
}

export interface ExperienceCategoryItem {
  _id: string;
  categoryId: ExperienceCategoryId;
  nome: string;
  subtitulo?: string;
  descricao: string;
  detalhe?: string;
  preco?: number | string;
  foto?: string;
  fotos?: string[];
  ordem: number;
  ativo: boolean;
}

export interface AppData {
  settings: SiteSettings;
  packages: PackageItem[];
  tours: TourItem[];
  stays: StayItem[];
  dishes: DishItem[];
  gallery: GalleryItem[];
  tests: TestimonialItem[];
  experienceCategories?: ExperienceCategoryConfig[];
  experienceItems?: ExperienceCategoryItem[];
}
