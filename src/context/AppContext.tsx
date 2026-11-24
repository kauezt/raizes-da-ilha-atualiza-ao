import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  AppData,
  SiteSettings,
  PackageItem,
  TourItem,
  StayItem,
  DishItem,
  GalleryItem,
  TestimonialItem,
  ExperienceCategoryId,
  ExperienceCategoryConfig,
  ExperienceCategoryItem,
} from '../types';
import { DEFAULT_DATA } from '../data/defaultData';
import { loadAppData, loadSyncFallback, saveAppData } from '../utils/storage';
import { createWhatsAppLink } from '../config/whatsapp';
import {
  mergeExperienceCategories,
  reorderCategoryItemsList,
  upsertExperienceItemList,
} from '../utils/experienceCategories';

const EDIT_MODE_KEY = 'raizes_da_ilha_edit_mode';

export type CollectionName =
  | 'packages'
  | 'tours'
  | 'stays'
  | 'dishes'
  | 'gallery'
  | 'tests';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function mergeWithDefaults(parsed?: Partial<AppData> | null): AppData {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_DATA;
  }
  const mergedSettings = {
    ...DEFAULT_DATA.settings,
    ...(parsed.settings || {}),
    whatsappAutoRedirect:
      typeof parsed.settings?.whatsappAutoRedirect === 'boolean'
        ? parsed.settings.whatsappAutoRedirect
        : DEFAULT_DATA.settings.whatsappAutoRedirect,
  };

  // Upgrade unmodified legacy defaults to the new São Luís reference defaults
  if (mergedSettings.heroTitle === 'Viva a ilha. Sinta as raízes.') {
    mergedSettings.heroTitle = DEFAULT_DATA.settings.heroTitle;
  }
  if (
    mergedSettings.heroSub ===
    'Uma experiência completa entre natureza, sabores, hospedagem e o encanto das águas calmas do manguezal.'
  ) {
    mergedSettings.heroSub = DEFAULT_DATA.settings.heroSub;
  }
  if (
    !mergedSettings.heroImage ||
    mergedSettings.heroImage.includes('photo-1540541338287')
  ) {
    mergedSettings.heroImage = DEFAULT_DATA.settings.heroImage;
  }
  if (!mergedSettings.heroCta1Text || mergedSettings.heroCta1Text === 'Montar meu roteiro') {
    mergedSettings.heroCta1Text = DEFAULT_DATA.settings.heroCta1Text;
  }
  if (!mergedSettings.heroCta1Link || mergedSettings.heroCta1Link === '#pacotes') {
    mergedSettings.heroCta1Link = DEFAULT_DATA.settings.heroCta1Link;
  }
  if (
    mergedSettings.aboutTitle === 'Uma experiência que começa muito antes do embarque.'
  ) {
    mergedSettings.aboutTitle = DEFAULT_DATA.settings.aboutTitle;
  }
  if (
    mergedSettings.aboutText?.startsWith(
      'O Raízes da Ilha nasceu do amor pela nossa terra e pela rica biodiversidade dos manguezais.'
    )
  ) {
    mergedSettings.aboutText = DEFAULT_DATA.settings.aboutText;
  }
  if (
    !mergedSettings.aboutImage ||
    mergedSettings.aboutImage.includes('photo-1507525428034')
  ) {
    mergedSettings.aboutImage = DEFAULT_DATA.settings.aboutImage;
  }
  if (
    !mergedSettings.tourImage ||
    mergedSettings.tourImage.includes('photo-1507525428034')
  ) {
    mergedSettings.tourImage = DEFAULT_DATA.settings.tourImage;
  }
  if (!mergedSettings.tiktok) {
    mergedSettings.tiktok = DEFAULT_DATA.settings.tiktok;
  }
  if (!mergedSettings.youtube) {
    mergedSettings.youtube = DEFAULT_DATA.settings.youtube;
  }
  if (
    !mergedSettings.address ||
    mergedSettings.address.includes('Polo Ecoturístico dos Manguezais')
  ) {
    mergedSettings.address = DEFAULT_DATA.settings.address;
  }

  return {
    settings: mergedSettings,
    packages: Array.isArray(parsed.packages) ? parsed.packages : DEFAULT_DATA.packages,
    tours: Array.isArray(parsed.tours) ? parsed.tours : DEFAULT_DATA.tours,
    stays: Array.isArray(parsed.stays) ? parsed.stays : DEFAULT_DATA.stays,
    dishes: Array.isArray(parsed.dishes) ? parsed.dishes : DEFAULT_DATA.dishes,
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : DEFAULT_DATA.gallery,
    tests: Array.isArray(parsed.tests) ? parsed.tests : DEFAULT_DATA.tests,
    experienceCategories: mergeExperienceCategories(
      DEFAULT_DATA.experienceCategories || [],
      parsed.experienceCategories
    ),
    experienceItems: Array.isArray(parsed.experienceItems)
      ? parsed.experienceItems
      : DEFAULT_DATA.experienceItems,
  };
}

interface AppContextType {
  data: AppData;
  settings: SiteSettings;
  packages: PackageItem[];
  tours: TourItem[];
  stays: StayItem[];
  dishes: DishItem[];
  gallery: GalleryItem[];
  tests: TestimonialItem[];
  experienceCategories: ExperienceCategoryConfig[];
  experienceItems: ExperienceCategoryItem[];
  activePackages: PackageItem[];
  activeTours: TourItem[];
  activeStays: StayItem[];
  activeDishes: DishItem[];
  activeGallery: GalleryItem[];
  activeTests: TestimonialItem[];
  isHydrated: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  lastSavedAt: number | null;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  updateExperienceCategory: (category: ExperienceCategoryConfig) => Promise<boolean>;
  saveExperienceItem: (
    item: Partial<ExperienceCategoryItem> & { categoryId: ExperienceCategoryId }
  ) => Promise<boolean>;
  deleteExperienceItem: (id: string) => Promise<boolean>;
  toggleExperienceItemActive: (id: string) => Promise<boolean>;
  reorderExperienceItem: (
    categoryId: ExperienceCategoryId,
    id: string,
    direction: 'up' | 'down'
  ) => Promise<boolean>;
  saveItem: (collection: CollectionName, item: any) => Promise<boolean>;
  deleteItem: (collection: CollectionName, id: string) => Promise<boolean>;
  toggleItemActive: (collection: CollectionName, id: string) => Promise<boolean>;
  reorderItem: (
    collection: CollectionName,
    id: string,
    direction: 'up' | 'down'
  ) => Promise<boolean>;
  seedDemo: (collection?: CollectionName) => Promise<boolean>;
  resetAll: () => Promise<boolean>;
  formatCurrency: (n: number | string | undefined) => string;
  getWhatsAppUrl: (message?: string) => string;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminInitialTab: string;
  adminInitialCategory: ExperienceCategoryId | null;
  adminInitialEditItem: any | null;
  clearAdminInitialEditItem: () => void;
  openAdminTo: (tab: string, item?: any, categoryId?: ExperienceCategoryId) => void;
  editMode: boolean;
  setEditMode: (enabled: boolean) => void;
  lightboxIndex: number | null;
  setLightboxIndex: (index: number | null) => void;
  exportBackupData: () => void;
  importBackupData: (jsonStr: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    const syncFallback = loadSyncFallback();
    return mergeWithDefaults(syncFallback);
  });

  const dataRef = useRef<AppData>(data);
  const hasLocalMutationRef = useRef<boolean>(false);
  const saveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));

  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });

  const [adminInitialTab, setAdminInitialTab] = useState<string>('settings');
  const [adminInitialCategory, setAdminInitialCategory] = useState<ExperienceCategoryId | null>(null);
  const [adminInitialEditItem, setAdminInitialEditItem] = useState<any | null>(null);

  const [editMode, setEditModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(EDIT_MODE_KEY);
    return saved !== null ? saved === 'true' : false;
  });

  const setEditMode = (enabled: boolean) => {
    setEditModeState(enabled);
    try {
      localStorage.setItem(EDIT_MODE_KEY, String(enabled));
    } catch {
      // Ignore
    }
  };

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Hydrate full data from IndexedDB on startup
  useEffect(() => {
    let cancelled = false;
    loadAppData()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded && !hasLocalMutationRef.current) {
          const merged = mergeWithDefaults(loaded);
          dataRef.current = merged;
          setData(merged);
        }
      })
      .catch((err) => {
        console.warn('Error hydrating saved data:', err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync admin open with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminOpenState(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const persistNextData = useCallback((computeNext: (prev: AppData) => AppData): Promise<boolean> => {
    hasLocalMutationRef.current = true;
    const nextData = computeNext(dataRef.current);
    dataRef.current = nextData;
    setData(nextData);
    setSaveStatus('saving');
    setSaveError(null);

    const runSave = saveQueueRef.current.then(async () => {
      const result = await saveAppData(dataRef.current);
      if (result.ok) {
        setSaveStatus('saved');
        setSaveError(null);
        setLastSavedAt(Date.now());
        return true;
      } else {
        setSaveStatus('error');
        setSaveError(result.error || 'Não foi possível salvar as alterações.');
        return false;
      }
    });

    saveQueueRef.current = runSave.catch(() => false);
    return runSave;
  }, []);

  const setIsAdminOpen = (open: boolean) => {
    setIsAdminOpenState(open);
    if (open) {
      if (window.location.hash !== '#admin') {
        window.location.hash = '#admin';
      }
    } else {
      if (window.location.hash === '#admin') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setAdminInitialEditItem(null);
    }
  };

  const clearAdminInitialEditItem = useCallback(() => {
    setAdminInitialEditItem(null);
  }, []);

  const openAdminTo = (tab: string, item?: any, categoryId?: ExperienceCategoryId) => {
    setAdminInitialTab(tab);
    setAdminInitialEditItem(item || null);
    setAdminInitialCategory(categoryId || null);
    setIsAdminOpen(true);
  };

  const updateSettings = useCallback(
    (newSettings: Partial<SiteSettings>): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
    },
    [persistNextData]
  );

  const updateExperienceCategory = useCallback(
    (category: ExperienceCategoryConfig): Promise<boolean> => {
      return persistNextData((prev) => {
        const current = prev.experienceCategories || DEFAULT_DATA.experienceCategories || [];
        const exists = current.some((c) => c.id === category.id);
        const nextCategories = exists
          ? current.map((c) => (c.id === category.id ? { ...c, ...category } : c))
          : [...current, category];
        return {
          ...prev,
          experienceCategories: nextCategories,
        };
      });
    },
    [persistNextData]
  );

  const saveExperienceItem = useCallback(
    (
      item: Partial<ExperienceCategoryItem> & { categoryId: ExperienceCategoryId }
    ): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        experienceItems: upsertExperienceItemList(prev.experienceItems || [], item),
      }));
    },
    [persistNextData]
  );

  const deleteExperienceItem = useCallback(
    (id: string): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        experienceItems: (prev.experienceItems || []).filter((item) => item._id !== id),
      }));
    },
    [persistNextData]
  );

  const toggleExperienceItemActive = useCallback(
    (id: string): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        experienceItems: (prev.experienceItems || []).map((item) =>
          item._id === id ? { ...item, ativo: !item.ativo } : item
        ),
      }));
    },
    [persistNextData]
  );

  const reorderExperienceItem = useCallback(
    (
      categoryId: ExperienceCategoryId,
      id: string,
      direction: 'up' | 'down'
    ): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        experienceItems: reorderCategoryItemsList(
          prev.experienceItems || [],
          categoryId,
          id,
          direction
        ),
      }));
    },
    [persistNextData]
  );

  const saveItem = useCallback(
    (collection: CollectionName, item: any): Promise<boolean> => {
      return persistNextData((prev) => {
        const list = [...(prev[collection] as any[])];
        const savedId =
          item._id ||
          'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

        if (item._id) {
          const idx = list.findIndex((x) => x._id === item._id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...item, _id: savedId };
          } else {
            list.push({ ...item, _id: savedId });
          }
        } else {
          const newItem = {
            ...item,
            _id: savedId,
            ordem: item.ordem !== undefined && item.ordem !== '' ? Number(item.ordem) : list.length + 1,
            ativo: item.ativo ?? true,
          };
          list.push(newItem);
        }

        // If gallery item set as principal, unmark other gallery items
        if (collection === 'gallery' && item.principal) {
          return {
            ...prev,
            gallery: list.map((g) =>
              g._id === savedId ? { ...g, principal: true } : { ...g, principal: false }
            ),
          };
        }

        return {
          ...prev,
          [collection]: list,
        };
      });
    },
    [persistNextData]
  );

  const deleteItem = useCallback(
    (collection: CollectionName, id: string): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        [collection]: (prev[collection] as any[]).filter((x) => x._id !== id),
      }));
    },
    [persistNextData]
  );

  const toggleItemActive = useCallback(
    (collection: CollectionName, id: string): Promise<boolean> => {
      return persistNextData((prev) => ({
        ...prev,
        [collection]: (prev[collection] as any[]).map((x) =>
          x._id === id ? { ...x, ativo: !x.ativo } : x
        ),
      }));
    },
    [persistNextData]
  );

  const reorderItem = useCallback(
    (
      collection: CollectionName,
      id: string,
      direction: 'up' | 'down'
    ): Promise<boolean> => {
      return persistNextData((prev) => {
        const list = [...(prev[collection] as any[])]
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
          .map((item) => ({ ...item }));
        const idx = list.findIndex((x) => x._id === id);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return prev;

        const currentOrder = list[idx].ordem ?? idx + 1;
        const targetOrder = list[targetIdx].ordem ?? targetIdx + 1;
        list[idx].ordem = targetOrder;
        list[targetIdx].ordem = currentOrder;

        return {
          ...prev,
          [collection]: list,
        };
      });
    },
    [persistNextData]
  );

  const seedDemo = useCallback(
    (collection?: CollectionName): Promise<boolean> => {
      return persistNextData((prev) => {
        if (collection) {
          return {
            ...prev,
            [collection]: DEFAULT_DATA[collection],
          };
        }
        return DEFAULT_DATA;
      });
    },
    [persistNextData]
  );

  const resetAll = useCallback((): Promise<boolean> => {
    return persistNextData(() => DEFAULT_DATA);
  }, [persistNextData]);

  const formatCurrency = (n: number | string | undefined): string => {
    if (n === '' || n === undefined || n === null) return '';
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return (
      'R$ ' +
      num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const getWhatsAppUrl = (message?: string): string => {
    const defaultMsg =
      message ||
      data.settings.whatsappDefaultMsg ||
      'Olá! Gostaria de mais informações sobre o Raízes da Ilha.';
    return createWhatsAppLink(defaultMsg, data.settings.whatsapp);
  };

  const exportBackupData = () => {
    try {
      const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute(
        'download',
        `raizes-da-ilha-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const importBackupData = useCallback(
    async (jsonStr: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          const merged = mergeWithDefaults(parsed);
          return persistNextData(() => merged);
        }
      } catch (e) {
        console.error('Invalid backup JSON', e);
      }
      return false;
    },
    [persistNextData]
  );

  const activePackages = useMemo(() => {
    return (data.packages || [])
      .filter((p) => p.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.packages]);

  const activeTours = useMemo(() => {
    return (data.tours || [])
      .filter((t) => t.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.tours]);

  const activeStays = useMemo(() => {
    return (data.stays || [])
      .filter((s) => s.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  }, [data.stays]);

  const activeDishes = useMemo(() => {
    return (data.dishes || [])
      .filter((d) => d.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
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
    return (data.tests || [])
      .filter((t) => t.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
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
        experienceCategories:
          data.experienceCategories || DEFAULT_DATA.experienceCategories || [],
        experienceItems: data.experienceItems || DEFAULT_DATA.experienceItems || [],
        activePackages,
        activeTours,
        activeStays,
        activeDishes,
        activeGallery,
        activeTests,
        isHydrated,
        saveStatus,
        saveError,
        lastSavedAt,
        updateSettings,
        updateExperienceCategory,
        saveExperienceItem,
        deleteExperienceItem,
        toggleExperienceItemActive,
        reorderExperienceItem,
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
        adminInitialCategory,
        adminInitialEditItem,
        clearAdminInitialEditItem,
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
