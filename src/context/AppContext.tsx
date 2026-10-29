import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { AppData, SiteSettings, PackageItem, TourItem, StayItem, DishItem, GalleryItem, TestimonialItem } from '../types';
import { DEFAULT_DATA } from '../data/defaultData';

const STORAGE_KEY = 'raizes_da_ilha_data_v2';
const EDIT_MODE_KEY = 'raizes_da_ilha_edit_mode';

export type CollectionName = 'packages' | 'tours' | 'stays' | 'dishes' | 'gallery' | 'tests';

interface AppContextType {
  data: AppData;
  settings: SiteSettings;
  packages: PackageItem[];
  tours: TourItem[];
  stays: StayItem[];
  dishes: DishItem[];
  gallery: GalleryItem[];
  tests: TestimonialItem[];
  activePackages: PackageItem[];
  activeTours: TourItem[];
  activeStays: StayItem[];
  activeDishes: DishItem[];
  activeGallery: GalleryItem[];
  activeTests: TestimonialItem[];
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  saveItem: (collection: CollectionName, item: any) => void;
  deleteItem: (collection: CollectionName, id: string) => void;
  toggleItemActive: (collection: CollectionName, id: string) => void;
  reorderItem: (collection: CollectionName, id: string, direction: 'up' | 'down') => void;
  seedDemo: (collection?: CollectionName) => void;
  resetAll: () => void;
  formatCurrency: (n: number | string | undefined) => string;
  getWhatsAppUrl: (message?: string) => string;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminInitialTab: string;
  adminInitialEditItem: any | null;
  openAdminTo: (tab: string, item?: any) => void;
  editMode: boolean;
  setEditMode: (enabled: boolean) => void;
  lightboxIndex: number | null;
  setLightboxIndex: (index: number | null) => void;
  exportBackupData: () => void;
  importBackupData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('raizes_da_ilha_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
          packages: parsed.packages || DEFAULT_DATA.packages,
          tours: parsed.tours || DEFAULT_DATA.tours,
          stays: parsed.stays || DEFAULT_DATA.stays,
          dishes: parsed.dishes || DEFAULT_DATA.dishes,
          gallery: parsed.gallery || DEFAULT_DATA.gallery,
          tests: parsed.tests || DEFAULT_DATA.tests,
        };
      }
    } catch (e) {
      console.warn('Failed to load saved state, using default data', e);
    }
    return DEFAULT_DATA;
  });

  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });

  const [adminInitialTab, setAdminInitialTab] = useState<string>('settings');
  const [adminInitialEditItem, setAdminInitialEditItem] = useState<any | null>(null);

  const [editMode, setEditModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(EDIT_MODE_KEY);
    return saved !== null ? saved === 'true' : true; // Default to true so user immediately sees edit options!
  });

  const setEditMode = (enabled: boolean) => {
    setEditModeState(enabled);
    localStorage.setItem(EDIT_MODE_KEY, String(enabled));
  };

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data]);

  // Sync admin open with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminOpenState(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setIsAdminOpen = (open: boolean) => {
    setIsAdminOpenState(open);
    if (open) {
      window.location.hash = '#admin';
    } else {
      if (window.location.hash === '#admin') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setAdminInitialEditItem(null);
    }
  };

  const openAdminTo = (tab: string, item?: any) => {
    setAdminInitialTab(tab);
    setAdminInitialEditItem(item || null);
    setIsAdminOpen(true);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const saveItem = (collection: CollectionName, item: any) => {
    setData((prev) => {
      const list = [...(prev[collection] as any[])];
      if (item._id) {
        const idx = list.findIndex((x) => x._id === item._id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...item };
        } else {
          list.push(item);
        }
      } else {
        const newItem = {
          ...item,
          _id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          ordem: item.ordem ?? list.length + 1,
          ativo: item.ativo ?? true,
        };
        list.push(newItem);
      }

      // If gallery item set as principal, unmark other gallery items
      if (collection === 'gallery' && item.principal) {
        return {
          ...prev,
          gallery: list.map((g) => (g._id === item._id ? g : { ...g, principal: false })),
        };
      }

      return {
        ...prev,
        [collection]: list,
      };
    });
  };

  const deleteItem = (collection: CollectionName, id: string) => {
    setData((prev) => ({
      ...prev,
      [collection]: (prev[collection] as any[]).filter((x) => x._id !== id),
    }));
  };

  const toggleItemActive = (collection: CollectionName, id: string) => {
    setData((prev) => ({
      ...prev,
      [collection]: (prev[collection] as any[]).map((x) =>
        x._id === id ? { ...x, ativo: !x.ativo } : x
      ),
    }));
  };

  const reorderItem = (collection: CollectionName, id: string, direction: 'up' | 'down') => {
    setData((prev) => {
      const list = [...(prev[collection] as any[])].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      const idx = list.findIndex((x) => x._id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;

      const current = list[idx];
      const target = list[targetIdx];
      const tempOrder = current.ordem ?? idx + 1;
      current.ordem = target.ordem ?? targetIdx + 1;
      target.ordem = tempOrder;

      return {
        ...prev,
        [collection]: list,
      };
    });
  };

  const seedDemo = (collection?: CollectionName) => {
    setData((prev) => {
      if (collection) {
        return {
          ...prev,
          [collection]: DEFAULT_DATA[collection],
        };
      }
      return DEFAULT_DATA;
    });
  };

  const resetAll = () => {
    setData(DEFAULT_DATA);
  };

  const formatCurrency = (n: number | string | undefined): string => {
    if (n === '' || n === undefined || n === null) return '';
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getWhatsAppUrl = (message?: string): string => {
    const rawNumber = String(data.settings.whatsapp || '').replace(/\D/g, '');
    const defaultMsg = message || data.settings.whatsappDefaultMsg || 'Olá! Gostaria de mais informações sobre o Raízes da Ilha.';
    if (!rawNumber) return '#contato';
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(defaultMsg)}`;
  };

  const exportBackupData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `raizes-da-ilha-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const importBackupData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        setData({
          settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
          packages: parsed.packages || DEFAULT_DATA.packages,
          tours: parsed.tours || DEFAULT_DATA.tours,
          stays: parsed.stays || DEFAULT_DATA.stays,
          dishes: parsed.dishes || DEFAULT_DATA.dishes,
          gallery: parsed.gallery || DEFAULT_DATA.gallery,
          tests: parsed.tests || DEFAULT_DATA.tests,
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON', e);
    }
    return false;
  };

  const activePackages = useMemo(() => {
    return (data.packages || []).filter((p) => p.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.packages]);

  const activeTours = useMemo(() => {
    return (data.tours || []).filter((t) => t.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.tours]);

  const activeStays = useMemo(() => {
    return (data.stays || []).filter((s) => s.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.stays]);

  const activeDishes = useMemo(() => {
    return (data.dishes || []).filter((d) => d.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.dishes]);

  const activeGallery = useMemo(() => {
    return (data.gallery || [])
      .filter((g) => g.ativo !== false)
      .sort((a, b) => {
        if (a.principal && !b.principal) return -1;
        if (!a.principal && b.principal) return 1;
        return (a.ordem || 0) - (b.ordem || 0);
      });
  }, [data.gallery]);

  const activeTests = useMemo(() => {
    return (data.tests || []).filter((t) => t.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.tests]);

  return (
    <AppContext.Provider
      value={{
        data,
        settings: data.settings,
        packages: data.packages,
        tours: data.tours,
        stays: data.stays,
        dishes: data.dishes,
        gallery: data.gallery,
        tests: data.tests,
        activePackages,
        activeTours,
        activeStays,
        activeDishes,
        activeGallery,
        activeTests,
        updateSettings,
        saveItem,
        deleteItem,
        toggleItemActive,
        reorderItem,
        seedDemo,
        resetAll,
        formatCurrency,
        getWhatsAppUrl,
        isAdminOpen,
        setIsAdminOpen,
        adminInitialTab,
        adminInitialEditItem,
        openAdminTo,
        editMode,
        setEditMode,
        lightboxIndex,
        setLightboxIndex,
        exportBackupData,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
