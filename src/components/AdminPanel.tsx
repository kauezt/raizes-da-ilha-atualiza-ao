import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp, CollectionName } from '../context/AppContext';
import { SiteSettings } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import {
  formatWhatsAppDisplay,
  resolveOfficialWhatsAppNumber,
} from '../config/whatsapp';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sliders,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'area' | 'num' | 'bool' | 'img' | 'multi-img';
  help?: string;
  category?: string;
}

const SCHEMAS: Record<string, { title: string; doc?: boolean; fields: FieldConfig[] }> = {
  settings: {
    title: 'Textos & Configurações',
    doc: true,
    fields: [
      // Identidade
      { key: 'name', label: 'Nome da empresa', type: 'text', category: 'Identidade & Logotipo' },
      {
        key: 'logo',
        label: 'Logotipo (imagem)',
        type: 'img',
        category: 'Identidade & Logotipo',
        help: 'Se vazio, usa o ícone exclusivo Raízes',
      },
      { key: 'favicon', label: 'Favicon', type: 'img', category: 'Identidade & Logotipo' },

      // Hero
      { key: 'heroBadge', label: 'Badge superior do Hero', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroTitle', label: 'Título Principal (Hero)', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroSub', label: 'Subtítulo do Hero', type: 'area', category: 'Topo (Hero)' },
      { key: 'heroImage', label: 'Foto de fundo do Hero', type: 'img', category: 'Topo (Hero)' },
      { key: 'heroCta1Text', label: 'Texto do Botão 1', type: 'text', category: 'Topo (Hero)' },
      {
        key: 'heroCta1Link',
        label: 'Link do Botão 1 (ex: #questionario)',
        type: 'text',
        category: 'Topo (Hero)',
      },
      {
        key: 'heroCta2Text',
        label: 'Texto do Botão 2 (WhatsApp)',
        type: 'text',
        category: 'Topo (Hero)',
      },
      {
        key: 'heroScrollText',
        label: 'Texto de rolagem inferior',
        type: 'text',
        category: 'Topo (Hero)',
      },

      // Sobre
      { key: 'aboutEyebrow', label: 'Eyebrow do Sobre', type: 'text', category: 'Seção Sobre' },
      { key: 'aboutTitle', label: 'Título da Seção Sobre', type: 'text', category: 'Seção Sobre' },
      { key: 'aboutText', label: 'Texto Completo do Sobre', type: 'area', category: 'Seção Sobre' },
      { key: 'aboutImage', label: 'Foto da Seção Sobre', type: 'img', category: 'Seção Sobre' },
      {
        key: 'aboutChips',
        label: 'Destaques / Tags (um por linha)',
        type: 'area',
        category: 'Seção Sobre',
      },
      {
        key: 'aboutBadgeTitle',
        label: 'Título do Selo Flutuante',
        type: 'text',
        category: 'Seção Sobre',
      },
      {
        key: 'aboutBadgeText',
        label: 'Texto do Selo Flutuante',
        type: 'text',
        category: 'Seção Sobre',
      },

      // Títulos das seções
      {
        key: 'packagesEyebrow',
        label: 'Eyebrow de Pacotes',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'packagesTitle',
        label: 'Título de Pacotes',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'packagesSub',
        label: 'Subtítulo de Pacotes',
        type: 'area',
        category: 'Títulos de Seções',
      },

      {
        key: 'tourEyebrow',
        label: 'Eyebrow do Passeio',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'tourTitle',
        label: 'Título do Passeio de Barco',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'tourBadge',
        label: 'Badge do Passeio (ex: Embarcação Segura)',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'tourImage',
        label: 'Foto de fallback do Passeio',
        type: 'img',
        category: 'Títulos de Seções',
      },

      {
        key: 'stayEyebrow',
        label: 'Eyebrow de Hospedagem',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'stayTitle',
        label: 'Título de Hospedagem',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'staySub',
        label: 'Subtítulo de Hospedagem',
        type: 'area',
        category: 'Títulos de Seções',
      },

      {
        key: 'foodEyebrow',
        label: 'Eyebrow do Restaurante',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'foodTitle',
        label: 'Título do Restaurante',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'foodSub',
        label: 'Subtítulo do Restaurante',
        type: 'area',
        category: 'Títulos de Seções',
      },

      {
        key: 'galleryEyebrow',
        label: 'Eyebrow da Galeria',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'galleryTitle',
        label: 'Título da Galeria',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'gallerySub',
        label: 'Subtítulo da Galeria',
        type: 'area',
        category: 'Títulos de Seções',
      },

      {
        key: 'testEyebrow',
        label: 'Eyebrow de Depoimentos',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'testTitle',
        label: 'Título de Depoimentos',
        type: 'text',
        category: 'Títulos de Seções',
      },
      {
        key: 'testSub',
        label: 'Subtítulo de Depoimentos',
        type: 'area',
        category: 'Títulos de Seções',
      },

      // Instagram Banner
      {
        key: 'instagramTitle',
        label: 'Título do Banner Instagram',
        type: 'text',
        category: 'Instagram & Redes',
      },
      {
        key: 'instagramSub',
        label: 'Subtítulo do Banner Instagram',
        type: 'area',
        category: 'Instagram & Redes',
      },
      {
        key: 'instagramCta',
        label: 'Texto do Botão Instagram',
        type: 'text',
        category: 'Instagram & Redes',
      },

      // Contato
      {
        key: 'contactEyebrow',
        label: 'Eyebrow do Contato',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'contactTitle',
        label: 'Título da Seção Contato',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'contactSub',
        label: 'Subtítulo do Contato',
        type: 'area',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'whatsapp',
        label: 'Número de WhatsApp para atendimento (com DDD)',
        type: 'text',
        category: 'Contatos & Redes Sociais',
        help: 'Aceita formatos como (98) 99123-4567 ou 5598991234567.',
      },
      {
        key: 'whatsappAutoRedirect',
        label: 'Encaminhar cliente automaticamente para o WhatsApp ao responder o questionário',
        type: 'bool',
        category: 'Contatos & Redes Sociais',
        help: 'Quando ativo, assim que o visitante conclui a etapa de contato do questionário, ele é encaminhado para o número acima com todas as respostas.',
      },
      {
        key: 'whatsappDefaultMsg',
        label: 'Mensagem Padrão do WhatsApp',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'contactCta',
        label: 'Texto do Botão WhatsApp Contato',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'email',
        label: 'E-mail de contato',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'address',
        label: 'Endereço / Localização física',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'instagram',
        label: 'Link do Instagram',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'facebook',
        label: 'Link do Facebook',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'tiktok',
        label: 'Link do TikTok',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },
      {
        key: 'youtube',
        label: 'Link do YouTube',
        type: 'text',
        category: 'Contatos & Redes Sociais',
      },

      // Rodapé
      {
        key: 'footerText',
        label: 'Texto Descritivo do Rodapé',
        type: 'area',
        category: 'Rodapé',
      },
      {
        key: 'footerCopyright',
        label: 'Texto de Copyright',
        type: 'text',
        category: 'Rodapé',
      },
      {
        key: 'footerSub',
        label: 'Texto Secundário do Rodapé',
        type: 'text',
        category: 'Rodapé',
      },
    ],
  },
  packages: {
    title: 'Pacotes',
    fields: [
      { key: 'nome', label: 'Nome do pacote', type: 'text' },
      {
        key: 'fotos',
        label: 'Fotos do pacote (para deslizar no card)',
        type: 'multi-img',
        help: 'Adicione várias fotos do roteiro, barco e estadia para que os visitantes possam deslizar e ver tudo!',
      },
      { key: 'descricao', label: 'Descrição completa', type: 'area' },
      { key: 'duracao', label: 'Duração (ex: 3 dias / 2 noites)', type: 'text' },
      { key: 'pessoas', label: 'Capacidade de pessoas (ex: 2 a 6 pessoas)', type: 'text' },
      { key: 'inclusos', label: 'Itens inclusos (um por linha)', type: 'area' },
      { key: 'preco', label: 'Preço normal em R$ (número)', type: 'num' },
      { key: 'promo', label: 'Preço promocional em R$ (opcional)', type: 'num' },
      { key: 'ctaText', label: 'Texto do botão de reserva', type: 'text' },
      { key: 'ordem', label: 'Ordem de exibição', type: 'num' },
      { key: 'ativo', label: 'Ativo no site', type: 'bool' },
    ],
  },
  tours: {
    title: 'Passeios',
    fields: [
      { key: 'nome', label: 'Nome do passeio de barco', type: 'text' },
      {
        key: 'fotos',
        label: 'Fotos do passeio (para deslizar no site)',
        type: 'multi-img',
        help: 'Adicione fotos da embarcação, igarapés, bancos de areia e pôr do sol.',
      },
      { key: 'duracao', label: 'Duração', type: 'text' },
      { key: 'roteiro', label: 'Roteiro detalhado', type: 'area' },
      { key: 'capacidade', label: 'Capacidade de passageiros', type: 'text' },
      { key: 'pontos', label: 'Pontos visitados e paradas', type: 'text' },
      { key: 'horarios', label: 'Horários de saída e marés', type: 'text' },
      { key: 'info', label: 'Informações importantes e segurança', type: 'area' },
      { key: 'preco', label: 'Preço por pessoa em R$ (número)', type: 'num' },
      { key: 'ctaText', label: 'Texto do botão de reserva', type: 'text' },
      { key: 'ordem', label: 'Ordem', type: 'num' },
      { key: 'ativo', label: 'Ativo', type: 'bool' },
    ],
  },
  stays: {
    title: 'Hospedagem',
    fields: [
      { key: 'nome', label: 'Nome da acomodação / bangalô', type: 'text' },
      {
        key: 'fotos',
        label: 'Fotos da hospedagem (para deslizar no card)',
        type: 'multi-img',
        help: 'Adicione fotos do quarto, varanda com rede, banheiro e café da manhã.',
      },
      { key: 'descricao', label: 'Descrição detalhada', type: 'area' },
      { key: 'capacidade', label: 'Capacidade (ex: Casal ou até 3 pessoas)', type: 'text' },
      { key: 'comodidades', label: 'Comodidades (ex: Ar, Wi-Fi, Café da manhã)', type: 'text' },
      { key: 'preco', label: 'Valor da diária em R$ (número)', type: 'num' },
      { key: 'info', label: 'Informações adicionais (check-in, regras)', type: 'area' },
      { key: 'ctaText', label: 'Texto do botão', type: 'text' },
      { key: 'ordem', label: 'Ordem', type: 'num' },
      { key: 'ativo', label: 'Ativo', type: 'bool' },
    ],
  },
  dishes: {
    title: 'Restaurante',
    fields: [
      { key: 'nome', label: 'Nome do prato ou bebida', type: 'text' },
      {
        key: 'fotos',
        label: 'Fotos do prato / bebida (para deslizar no card)',
        type: 'multi-img',
        help: 'Adicione fotos do prato montado, acompanhamentos e detalhes.',
      },
      { key: 'categoria', label: 'Categoria (Pratos Principais, Petiscos, Bebidas)', type: 'text' },
      { key: 'descricao', label: 'Descrição dos ingredientes e modo de preparo', type: 'area' },
      { key: 'preco', label: 'Preço em R$ (número)', type: 'num' },
      { key: 'ordem', label: 'Ordem', type: 'num' },
      { key: 'ativo', label: 'Disponível no cardápio', type: 'bool' },
    ],
  },
  gallery: {
    title: 'Galeria',
    fields: [
      { key: 'foto', label: 'Foto da ilha', type: 'img' },
      { key: 'titulo', label: 'Título da foto', type: 'text' },
      { key: 'descricao', label: 'Legenda / Descrição detalhada', type: 'text' },
      { key: 'principal', label: 'Foto de destaque principal', type: 'bool' },
      { key: 'ordem', label: 'Ordem', type: 'num' },
      { key: 'ativo', label: 'Ativa na galeria', type: 'bool' },
    ],
  },
  tests: {
    title: 'Depoimentos',
    fields: [
      { key: 'nome', label: 'Nome do visitante', type: 'text' },
      { key: 'texto', label: 'Depoimento completo', type: 'area' },
      { key: 'nota', label: 'Nota em estrelas (1 a 5)', type: 'num' },
      { key: 'data', label: 'Data da avaliação (ex: Fevereiro de 2026)', type: 'text' },
      { key: 'ordem', label: 'Ordem', type: 'num' },
      { key: 'ativo', label: 'Ativo', type: 'bool' },
    ],
  },
};

interface StatusBanner {
  type: 'success' | 'error';
  text: string;
}

type ConfirmAction =
  | { type: 'delete'; id: string; label: string }
  | { type: 'reset-settings' }
  | { type: 'reset-all' }
  | null;

export const AdminPanel: React.FC = () => {
  const {
    settings,
    packages,
    tours,
    stays,
    dishes,
    gallery,
    tests,
    updateSettings,
    saveItem,
    deleteItem,
    toggleItemActive,
    reorderItem,
    seedDemo,
    resetAll,
    isAdminOpen,
    setIsAdminOpen,
    adminInitialTab,
    adminInitialCategory,
    adminInitialEditItem,
    clearAdminInitialEditItem,
    editMode,
    setEditMode,
    exportBackupData,
    importBackupData,
    saveStatus,
    saveError,
    lastSavedAt,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('settings');
  const [editingItem, setEditingItem] = useState<{ isNew: boolean; data: any } | null>(null);
  const [statusBanner, setStatusBanner] = useState<StatusBanner | null>(null);
  const [settingsFormData, setSettingsFormData] = useState<SiteSettings>({ ...settings });
  const [hasSettingsUnsaved, setHasSettingsUnsaved] = useState<boolean>(false);
  const [settingsCategoryFilter, setSettingsCategoryFilter] = useState<string>('Todos');
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [processingImagesCount, setProcessingImagesCount] = useState<number>(0);
  const [isSavingAction, setIsSavingAction] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showStatus = useCallback((type: 'success' | 'error', text: string, durationMs = 4500) => {
    setStatusBanner({ type, text });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setStatusBanner(null);
    }, durationMs);
  }, []);

  const openItemEditor = useCallback((rawItem: any, isNew: boolean) => {
    const itemData = { ...rawItem };
    if (!Array.isArray(itemData.fotos) || itemData.fotos.length === 0) {
      itemData.fotos = itemData.foto ? [itemData.foto] : [];
    } else {
      itemData.fotos = [...itemData.fotos];
    }
    setNewUrlInput('');
    setConfirmAction(null);
    setEditingItem({ isNew, data: itemData });
  }, []);

  // Sync initial tab and edit item when opened via on-page edit badges
  useEffect(() => {
    if (!isAdminOpen) return;

    if (
      adminInitialTab &&
      (SCHEMAS[adminInitialTab] ||
        adminInitialTab === 'categories' ||
        adminInitialTab === 'backup')
    ) {
      setActiveTab(adminInitialTab);
    }
    if (adminInitialEditItem) {
      openItemEditor(adminInitialEditItem, false);
      clearAdminInitialEditItem();
    }
  }, [isAdminOpen, adminInitialTab, adminInitialEditItem, clearAdminInitialEditItem, openItemEditor]);

  // Reset unsaved settings state when opening panel fresh
  useEffect(() => {
    if (isAdminOpen) {
      setSettingsFormData({ ...settings });
      setHasSettingsUnsaved(false);
      setConfirmAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOpen]);

  // Keep settingsFormData synced when settings update externally and user doesn't have unsaved local edits
  useEffect(() => {
    if (!hasSettingsUnsaved) {
      setSettingsFormData({ ...settings });
    }
  }, [settings, hasSettingsUnsaved]);

  if (!isAdminOpen) return null;

  const currentSchema = SCHEMAS[activeTab] || SCHEMAS.settings;
  const isBusy = processingImagesCount > 0 || isSavingAction;

  const getCollectionList = () => {
    switch (activeTab) {
      case 'packages':
        return packages;
      case 'tours':
        return tours;
      case 'stays':
        return stays;
      case 'dishes':
        return dishes;
      case 'gallery':
        return gallery;
      case 'tests':
        return tests;
      default:
        return [];
    }
  };

  const handleSaveSettings = async (andClose = false) => {
    if (processingImagesCount > 0) {
      showStatus('error', 'Aguarde o carregamento da imagem terminar antes de salvar.');
      return;
    }

    setIsSavingAction(true);
    try {
      const ok = await updateSettings(settingsFormData);
      if (ok) {
        setHasSettingsUnsaved(false);
        showStatus('success', 'Alterações salvas permanentemente!');
        if (andClose) {
          setIsAdminOpen(false);
        }
      } else {
        showStatus('error', saveError || 'Erro ao salvar as alterações no navegador.');
      }
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleSaveItem = async (andClose = false) => {
    if (!editingItem) return;
    if (processingImagesCount > 0) {
      showStatus('error', 'Aguarde o processamento das fotos terminar antes de salvar.');
      return;
    }

    const dataToSave = { ...editingItem.data };

    // Auto-include any pending URL typed into the carousel input even if user skipped "+ Adicionar Link"
    const pendingUrl = newUrlInput.trim();
    if (pendingUrl) {
      const currentFotos = Array.isArray(dataToSave.fotos)
        ? [...dataToSave.fotos]
        : dataToSave.foto
        ? [dataToSave.foto]
        : [];
      if (!currentFotos.includes(pendingUrl)) {
        currentFotos.push(pendingUrl);
      }
      dataToSave.fotos = currentFotos;
    }

    // Synchronize primary photo and carousel array cleanly
    if (activeTab !== 'gallery') {
      if (Array.isArray(dataToSave.fotos)) {
        const cleaned = dataToSave.fotos.filter((u: string) => typeof u === 'string' && u.trim() !== '');
        dataToSave.fotos = cleaned;
        dataToSave.foto = cleaned[0] || '';
      } else if (dataToSave.foto) {
        dataToSave.fotos = [dataToSave.foto];
      } else {
        dataToSave.fotos = [];
        dataToSave.foto = '';
      }
    }

    setIsSavingAction(true);
    try {
      const ok = await saveItem(activeTab as CollectionName, dataToSave);
      if (ok) {
        setNewUrlInput('');
        setEditingItem(null);
        showStatus('success', 'Item salvo permanentemente!');
        if (andClose) {
          setIsAdminOpen(false);
        }
      } else {
        showStatus('error', saveError || 'Erro ao salvar o item. Tente reduzir o tamanho das imagens.');
      }
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleImageFileChange = async (key: string, file: File, isSettings: boolean) => {
    setProcessingImagesCount((c) => c + 1);
    try {
      const isLogoOrFavicon = key === 'logo' || key === 'favicon';
      const compressed = await compressImageFile(file, {
        maxDimension: isLogoOrFavicon ? 512 : 1600,
        quality: 0.82,
        preserveTransparency: isLogoOrFavicon,
      });

      if (isSettings) {
        setSettingsFormData((prev) => ({ ...prev, [key]: compressed }));
        setHasSettingsUnsaved(true);
        showStatus('success', 'Imagem carregada! Clique em "Salvar" para gravar.');
      } else {
        setEditingItem((prev) =>
          prev ? { ...prev, data: { ...prev.data, [key]: compressed } } : null
        );
        showStatus('success', 'Imagem carregada! Clique em "Salvar Item" para gravar.');
      }
    } catch {
      showStatus('error', 'Não foi possível processar esta imagem.');
    } finally {
      setProcessingImagesCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMultipleFilesForCarousel = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingItem) return;

    const fileArray = Array.from(files);
    setProcessingImagesCount((c) => c + 1);
    try {
      const compressedList = await Promise.all(
        fileArray.map((file) =>
          compressImageFile(file, { maxDimension: 1400, quality: 0.82 })
        )
      );

      setEditingItem((prev) => {
        if (!prev) return null;
        const currentFotos = Array.isArray(prev.data.fotos)
          ? [...prev.data.fotos]
          : prev.data.foto
          ? [prev.data.foto]
          : [];
        const updatedFotos = [...currentFotos, ...compressedList];
        return {
          ...prev,
          data: {
            ...prev.data,
            fotos: updatedFotos,
            foto: updatedFotos[0] || '',
          },
        };
      });

      showStatus(
        'success',
        `${fileArray.length} foto(s) adicionada(s)! Clique em "Salvar Item" para confirmar.`
      );
    } catch {
      showStatus('error', 'Erro ao processar uma ou mais imagens.');
    } finally {
      setProcessingImagesCount((c) => Math.max(0, c - 1));
    }
  };

  const handleAddUrlToCarousel = () => {
    if (!newUrlInput.trim() || !editingItem) return;
    const url = newUrlInput.trim();
    setEditingItem((prev) => {
      if (!prev) return null;
      const currentFotos = Array.isArray(prev.data.fotos)
        ? [...prev.data.fotos]
        : prev.data.foto
        ? [prev.data.foto]
        : [];
      const updatedFotos = [...currentFotos, url];
      return {
        ...prev,
        data: {
          ...prev.data,
          fotos: updatedFotos,
          foto: updatedFotos[0] || '',
        },
      };
    });
    setNewUrlInput('');
  };

  const handleRemovePhotoFromCarousel = (photoIndex: number) => {
    if (!editingItem) return;
    setEditingItem((prev) => {
      if (!prev) return null;
      const currentFotos = Array.isArray(prev.data.fotos) ? [...prev.data.fotos] : [];
      currentFotos.splice(photoIndex, 1);
      return {
        ...prev,
        data: {
          ...prev.data,
          fotos: currentFotos,
          foto: currentFotos[0] || '',
        },
      };
    });
  };

  const handleReorderPhotoInCarousel = (fromIdx: number, toIdx: number) => {
    if (!editingItem) return;
    setEditingItem((prev) => {
      if (!prev) return null;
      const currentFotos = Array.isArray(prev.data.fotos) ? [...prev.data.fotos] : [];
      if (toIdx < 0 || toIdx >= currentFotos.length) return prev;
      const [moved] = currentFotos.splice(fromIdx, 1);
      currentFotos.splice(toIdx, 0, moved);
      return {
        ...prev,
        data: {
          ...prev.data,
          fotos: currentFotos,
          foto: currentFotos[0] || '',
        },
      };
    });
  };

  const handleMultipleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    e.target.value = '';
    setProcessingImagesCount((c) => c + 1);

    try {
      const compressedItems = await Promise.all(
        fileArray.map(async (file, index) => {
          const foto = await compressImageFile(file, {
            maxDimension: 1600,
            quality: 0.82,
          });
          return {
            foto,
            titulo: file.name.replace(/\.[^/.]+$/, ''),
            descricao: '',
            ordem: gallery.length + index + 1,
            ativo: true,
          };
        })
      );

      let allOk = true;
      for (const item of compressedItems) {
        const ok = await saveItem('gallery', item);
        if (!ok) allOk = false;
      }

      if (allOk) {
        showStatus(
          'success',
          `${fileArray.length} foto(s) enviada(s) e salva(s) na galeria!`
        );
      } else {
        showStatus('error', saveError || 'Algumas fotos não puderam ser salvas.');
      }
    } catch {
      showStatus('error', 'Erro ao enviar fotos para a galeria.');
    } finally {
      setProcessingImagesCount((c) => Math.max(0, c - 1));
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      const success = await importBackupData(content);
      if (success) {
        setHasSettingsUnsaved(false);
        showStatus('success', 'Backup importado e salvo com sucesso!');
      } else {
        showStatus('error', 'Erro: Arquivo JSON de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllConfirmed = async () => {
    setIsSavingAction(true);
    try {
      const ok = await resetAll();
      setConfirmAction(null);
      if (ok) {
        setHasSettingsUnsaved(false);
        showStatus('success', 'Conteúdo restaurado para o padrão e salvo!');
      } else {
        showStatus('error', saveError || 'Erro ao restaurar padrões.');
      }
    } finally {
      setIsSavingAction(false);
    }
  };

  const itemsList = getCollectionList()
    .slice()
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const settingsCategories = [
    'Todos',
    'Identidade & Logotipo',
    'Topo (Hero)',
    'Seção Sobre',
    'Títulos de Seções',
    'Contatos & Redes Sociais',
    'Instagram & Redes',
    'Rodapé',
  ];

  const formattedLastSaved = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101a14]/95 backdrop-blur-md overflow-y-auto animate-fadeIn flex flex-col text-[var(--ink)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#142a20] text-[#f3eddc] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#2a3b30] shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-[#c9a56a]">
            Painel do Proprietário
          </span>
          <span className="hidden md:inline-block text-xs bg-[#1f3d2e] text-[#7fb3b0] px-3 py-1 rounded-full border border-[#7fb3b0]/30 font-semibold">
            Edição Total & Carrosséis
          </span>
          {processingImagesCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full border border-amber-400/40 font-medium">
              <Loader2 size={13} className="animate-spin" />
              Otimizando fotos...
            </span>
          )}
          {processingImagesCount === 0 && saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 text-[#f3eddc] px-3 py-1 rounded-full">
              <Loader2 size={13} className="animate-spin" />
              Salvando...
            </span>
          )}
          {processingImagesCount === 0 && saveStatus === 'saved' && formattedLastSaved && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30">
              <Check size={13} />
              Salvo às {formattedLastSaved}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Edit Mode Toggle */}
          <label className="flex items-center gap-2 bg-[#101a14] px-3 py-1.5 rounded-full border border-[#2a3b30] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editMode}
              onChange={(e) => setEditMode(e.target.checked)}
              className="accent-[#c9a56a] w-4 h-4 cursor-pointer rounded"
            />
            <span className="text-gray-300">Atalhos no Site</span>
          </label>

          <button
            type="button"
            onClick={() => setIsAdminOpen(false)}
            className="btn-primary text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full inline-flex items-center gap-1.5"
          >
            <ExternalLink size={15} />
            <span>Ver site</span>
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="bg-[#18261d] border-b border-[#2a3b30] px-4 sm:px-6 py-3 flex gap-2 flex-wrap items-center">
        <button
          type="button"
          onClick={() => {
            setActiveTab('settings');
            setEditingItem(null);
            setNewUrlInput('');
            setConfirmAction(null);
          }}
          className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#DE952F] text-[#1F331C] font-bold shadow-md'
              : 'bg-[#243E21] text-[#F6F2E4] font-medium hover:bg-[#32532E] border border-[#40683B]'
          }`}
        >
          {SCHEMAS.settings.title}
        </button>

        <button
          type="button"
          data-testid="admin-tab-categories"
          onClick={() => {
            setActiveTab('categories');
            setEditingItem(null);
            setNewUrlInput('');
            setConfirmAction(null);
          }}
          className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#DE952F] text-[#1F331C] font-bold shadow-md'
              : 'bg-[#243E21] text-[#F6F2E4] font-medium hover:bg-[#32532E] border border-[#40683B]'
          }`}
        >
          Categorias &amp; Experiências
        </button>

        {Object.keys(SCHEMAS)
          .filter((key) => key !== 'settings')
          .map((key) => {
            const tab = SCHEMAS[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  setEditingItem(null);
                  setNewUrlInput('');
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#DE952F] text-[#1F331C] font-bold shadow-md'
                    : 'bg-[#243E21] text-[#F6F2E4] font-medium hover:bg-[#32532E] border border-[#40683B]'
                }`}
              >
                {tab.title}
              </button>
            );
          })}

        <button
          type="button"
          onClick={() => {
            setActiveTab('backup');
            setEditingItem(null);
            setNewUrlInput('');
            setConfirmAction(null);
          }}
          className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-[#DE952F] text-[#1F331C] font-bold shadow-md'
              : 'bg-[#243E21] text-[#F6F2E4] font-medium hover:bg-[#32532E] border border-[#40683B]'
          }`}
        >
          Backup & Dados
        </button>
      </div>

      {/* Floating Always-Visible Toast Notification */}
      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[70] max-w-md px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold animate-fadeIn ${
            statusBanner.type === 'success'
              ? 'bg-[#1f3d2e] text-[#f3eddc] border-[#7fb3b0]/50'
              : 'bg-red-900 text-white border-red-400/50'
          }`}
        >
          <span className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <Check size={18} className="text-[#c9a56a] shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-200 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs underline opacity-80 hover:opacity-100 shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full pb-24">
        {activeTab === 'categories' ? (
          <AdminCategoriesTab
            initialCategory={adminInitialCategory}
            showStatus={showStatus}
            onCloseAdmin={() => setIsAdminOpen(false)}
          />
        ) : activeTab === 'backup' ? (
          /* Backup & Import Screen */
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-[var(--g)] font-bold">
                Backup & Restauração Completa
              </h2>
              <p className="text-xs sm:text-sm text-[var(--ink)]/70 mt-1">
                Salve uma cópia de todos os textos, fotos, preços e dados do site, ou restaure de um arquivo anterior.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Export */}
              <div className="p-6 rounded-2xl bg-[var(--sand)] border border-[var(--line)] space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--g)] text-white flex items-center justify-center">
                  <Download size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--g)]">
                  Exportar Backup (JSON)
                </h3>
                <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                  Baixe um arquivo seguro com todos os pacotes, cardápio, fotos múltiplas, textos e configurações atuais do seu site.
                </p>
                <button
                  type="button"
                  onClick={exportBackupData}
                  className="btn-primary w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Baixar Backup do Site
                </button>
              </div>

              {/* Import */}
              <div className="p-6 rounded-2xl bg-[var(--sand)] border border-[var(--line)] space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#6b4a2f] text-white flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--g)]">
                  Importar Backup (JSON)
                </h3>
                <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                  Selecione um arquivo de backup (.json) exportado anteriormente para restaurar todo o conteúdo.
                </p>
                <label className="btn-outline border-[var(--g)] text-[var(--g)] hover:bg-[var(--g)]/10 w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload size={16} />
                  <span>Carregar arquivo JSON</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    ref={fileInputRef}
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset to defaults with inline confirmation */}
            <div className="pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-600">
                  Restaurar Conteúdo de Demonstração
                </h4>
                <p className="text-xs text-[var(--ink)]/60">
                  Volta o site exatamente para os dados originais padrão de demonstração com todas as fotos.
                </p>
              </div>
              {confirmAction?.type === 'reset-all' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleResetAllConfirmed}
                    className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold"
                  >
                    Confirmar Reset Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-2 rounded-full border border-[var(--line)] text-xs font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmAction({ type: 'reset-all' })}
                  className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} />
                  Resetar tudo
                </button>
              )}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          /* Settings Form with category filters */
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--line)]">
              <div>
                <h2 className="font-serif text-2xl text-[var(--g)] font-bold">
                  Configurações & Textos de Todas as Seções
                </h2>
                <p className="text-xs text-[var(--ink)]/70">
                  Edite qualquer título, subtítulo, foto de fundo, selo ou contato do site.
                </p>
              </div>

              {confirmAction?.type === 'reset-settings' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleResetAllConfirmed}
                    className="px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                  >
                    Confirmar restauração
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-1.5 rounded-full border border-[var(--line)] text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmAction({ type: 'reset-settings' })}
                  className="text-xs text-red-600 hover:text-red-800 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} />
                  Restaurar padrões
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap mb-6 pb-4 border-b border-[var(--line)]">
              {settingsCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSettingsCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    settingsCategoryFilter === cat
                      ? 'bg-[var(--g)] text-white shadow-xs'
                      : 'bg-[var(--sand)] text-[var(--ink)]/80 hover:bg-[var(--line)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings(false);
              }}
              className="space-y-6"
            >
              {/* Quick Card: WhatsApp do Questionário & Encaminhamento Automático */}
              {(settingsCategoryFilter === 'Todos' ||
                settingsCategoryFilter === 'Contatos & Redes Sociais') && (
                <div
                  data-testid="admin-whatsapp-quick-config"
                  className="rounded-2xl border-2 border-[#32532E]/25 bg-[#F6F2E4] p-5 sm:p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#32532E] text-[#F6F2E4] flex items-center justify-center shrink-0">
                        <MessageCircle size={20} />
                      </span>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#253B21]">
                          WhatsApp de Atendimento do Questionário
                        </h3>
                        <p className="text-xs text-[#253822]/75">
                          Informe o número que receberá os clientes após responderem ao questionário e escolha se o encaminhamento deve abrir automaticamente ao final.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold bg-[#32532E]/10 text-[#32532E] px-3 py-1 rounded-full">
                      Destino: {formatWhatsAppDisplay(settingsFormData.whatsapp)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="admin-quick-whatsapp-number"
                        className="block text-xs font-semibold text-[#32532E] uppercase tracking-wide"
                      >
                        Número do WhatsApp (com DDD)
                      </label>
                      <input
                        id="admin-quick-whatsapp-number"
                        type="tel"
                        placeholder="Ex: (98) 99123-4567 ou 5598991234567"
                        value={settingsFormData.whatsapp ?? ''}
                        onChange={(e) => {
                          setSettingsFormData({
                            ...settingsFormData,
                            whatsapp: e.target.value,
                          });
                          setHasSettingsUnsaved(true);
                        }}
                        className="w-full bg-white border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[#32532E]"
                      />
                      <p className="text-[11px] text-[#253822]/70">
                        Link gerado: <span className="font-mono font-semibold text-[#32532E]">wa.me/{resolveOfficialWhatsAppNumber(settingsFormData.whatsapp)}</span>
                      </p>
                    </div>

                    <label
                      htmlFor="admin-quick-whatsapp-autoredirect"
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[var(--line)] cursor-pointer hover:border-[#32532E]/40 transition-colors"
                    >
                      <input
                        id="admin-quick-whatsapp-autoredirect"
                        type="checkbox"
                        checked={settingsFormData.whatsappAutoRedirect !== false}
                        onChange={(e) => {
                          setSettingsFormData({
                            ...settingsFormData,
                            whatsappAutoRedirect: e.target.checked,
                          });
                          setHasSettingsUnsaved(true);
                        }}
                        className="mt-0.5 w-4 h-4 accent-[#32532E] rounded cursor-pointer shrink-0"
                      />
                      <span className="space-y-0.5">
                        <span className="block text-xs sm:text-sm font-semibold text-[#253B21]">
                          Encaminhar cliente automaticamente ao finalizar o questionário
                        </span>
                        <span className="block text-[11px] text-[#253822]/70">
                          Ao concluir a etapa de contato do questionário, abre automaticamente este WhatsApp já com o resumo das respostas.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSchema.fields
                  .filter(
                    (f) =>
                      f.key !== 'whatsapp' &&
                      f.key !== 'whatsappAutoRedirect' &&
                      (settingsCategoryFilter === 'Todos' ||
                        f.category === settingsCategoryFilter)
                  )
                  .map((f) => {
                    const val = (settingsFormData as any)[f.key] ?? '';

                    if (f.type === 'area') {
                      return (
                        <div key={f.key} className="md:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                              {f.label}
                            </label>
                            {f.category && (
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                {f.category}
                              </span>
                            )}
                          </div>
                          <textarea
                            rows={3}
                            value={val}
                            onChange={(e) => {
                              setSettingsFormData({
                                ...settingsFormData,
                                [f.key]: e.target.value,
                              });
                              setHasSettingsUnsaved(true);
                            }}
                            className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                          />
                        </div>
                      );
                    }

                    if (f.type === 'img') {
                      return (
                        <div key={f.key} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide block">
                              {f.label}
                            </label>
                            {f.category && (
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                {f.category}
                              </span>
                            )}
                          </div>
                          {f.help && <p className="text-[11px] text-gray-500">{f.help}</p>}
                          <div className="flex items-center gap-4">
                            {val ? (
                              <img
                                src={val}
                                alt={f.label}
                                className="w-16 h-16 object-cover rounded-xl border border-[var(--line)] shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl border border-dashed border-[var(--line)] bg-[var(--off)] flex items-center justify-center text-[var(--ink)]/40 shrink-0">
                                <ImageIcon size={22} />
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Link da foto (URL) ou use o botão abaixo"
                                value={val}
                                onChange={(e) => {
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    [f.key]: e.target.value,
                                  });
                                  setHasSettingsUnsaved(true);
                                }}
                                className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3 py-1.5 text-xs text-[var(--ink)]"
                              />
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer text-xs bg-[var(--sand)] hover:bg-[var(--line)] px-3 py-1 rounded-lg border border-[var(--line)] font-medium transition-colors">
                                  Enviar foto do dispositivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      e.target.value = '';
                                      if (file) {
                                        handleImageFileChange(f.key, file, true);
                                      }
                                    }}
                                  />
                                </label>
                                {val && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSettingsFormData({
                                        ...settingsFormData,
                                        [f.key]: '',
                                      });
                                      setHasSettingsUnsaved(true);
                                    }}
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (f.type === 'bool') {
                      const checked = val !== false;
                      return (
                        <div key={f.key} className="md:col-span-2">
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--off)] border border-[var(--line)] cursor-pointer hover:border-[var(--g)]/40 transition-colors">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setSettingsFormData({
                                  ...settingsFormData,
                                  [f.key]: e.target.checked,
                                });
                                setHasSettingsUnsaved(true);
                              }}
                              className="mt-0.5 w-4 h-4 accent-[var(--g)] rounded cursor-pointer shrink-0"
                            />
                            <span className="space-y-0.5">
                              <span className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                                {f.label}
                              </span>
                              {f.help && (
                                <span className="block text-[11px] text-gray-500">
                                  {f.help}
                                </span>
                              )}
                            </span>
                          </label>
                        </div>
                      );
                    }

                    return (
                      <div key={f.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                            {f.label}
                          </label>
                          {f.category && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {f.category}
                            </span>
                          )}
                        </div>
                        {f.help && <p className="text-[11px] text-gray-500">{f.help}</p>}
                        <input
                          type={f.type === 'num' ? 'number' : 'text'}
                          value={val}
                          onChange={(e) => {
                            setSettingsFormData({
                              ...settingsFormData,
                              [f.key]:
                                f.type === 'num'
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value,
                            });
                            setHasSettingsUnsaved(true);
                          }}
                          className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Sticky Bottom Save Bar */}
              <div className="sticky bottom-0 z-20 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-4 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--line)] rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  {hasSettingsUnsaved ? (
                    <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-semibold">
                      Você tem alterações não salvas
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                      <Check size={13} /> Tudo salvo
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                    {processingImagesCount > 0
                      ? 'Processando imagem...'
                      : isSavingAction
                      ? 'Salvando...'
                      : 'Salvar Alterações'}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleSaveSettings(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-[var(--g)] hover:bg-[var(--gd)] text-white shadow-md transition-colors disabled:opacity-60"
                  >
                    <Check size={17} />
                    Salvar e Ver no Site
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : editingItem ? (
          /* Form for Editing or Creating an Item */
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--line)]">
              <div>
                <h2 className="font-serif text-2xl text-[var(--g)] font-bold">
                  {editingItem.isNew
                    ? `Novo em ${currentSchema.title}`
                    : `Editar ${currentSchema.title}`}
                </h2>
                <p className="text-xs text-[var(--ink)]/60">
                  Preencha os campos abaixo e clique em "Salvar Item" para aplicar e gravar permanentemente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setNewUrlInput('');
                }}
                className="text-xs text-[var(--ink)]/70 hover:text-[var(--ink)] border border-[var(--line)] px-3 py-1.5 rounded-full"
              >
                Cancelar
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveItem(false);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSchema.fields.map((f) => {
                  const val = editingItem.data[f.key] ?? '';

                  // MULTIPLE PHOTOS CAROUSEL MANAGER
                  if (f.type === 'multi-img') {
                    const photoList: string[] = Array.isArray(editingItem.data.fotos)
                      ? editingItem.data.fotos
                      : editingItem.data.foto
                      ? [editingItem.data.foto]
                      : [];

                    return (
                      <div
                        key={f.key}
                        className="md:col-span-2 space-y-3 p-5 rounded-2xl bg-[var(--off)] border border-[var(--line)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <label className="text-xs font-bold text-[var(--g)] uppercase tracking-wide flex items-center gap-2">
                              <Sliders size={16} />
                              {f.label}
                            </label>
                            {f.help && <p className="text-xs text-gray-500 mt-0.5">{f.help}</p>}
                          </div>
                          <span className="text-xs bg-[#c9a56a]/20 text-[#6b4a2f] font-semibold px-2.5 py-1 rounded-full">
                            {photoList.length} foto(s) cadastradas
                          </span>
                        </div>

                        {/* Photo Thumbnails with reorder & delete */}
                        {photoList.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {photoList.map((photoUrl, pIdx) => (
                              <div
                                key={`${pIdx}-${photoUrl.slice(0, 24)}`}
                                className="relative rounded-xl overflow-hidden border border-[var(--line)] group bg-white shadow-xs"
                              >
                                <img
                                  src={photoUrl}
                                  alt={`Foto ${pIdx + 1}`}
                                  className="w-full h-24 object-cover"
                                />

                                <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                  {pIdx === 0 ? '1ª (Capa)' : `${pIdx + 1}ª`}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 flex items-center justify-between text-white">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={pIdx === 0}
                                      onClick={() => handleReorderPhotoInCarousel(pIdx, pIdx - 1)}
                                      className="p-1 hover:text-[#c9a56a] disabled:opacity-20"
                                      title="Mover foto para esquerda"
                                    >
                                      <ChevronLeft size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={pIdx === photoList.length - 1}
                                      onClick={() => handleReorderPhotoInCarousel(pIdx, pIdx + 1)}
                                      className="p-1 hover:text-[#c9a56a] disabled:opacity-20"
                                      title="Mover foto para direita"
                                    >
                                      <ChevronRight size={16} />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhotoFromCarousel(pIdx)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                    title="Remover esta foto"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-[var(--line)] rounded-xl bg-white/50 text-xs text-gray-500">
                            Nenhuma foto adicionada ainda. Adicione fotos abaixo para os visitantes poderem deslizar!
                          </div>
                        )}

                        {/* Add More Photos inputs */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                          <label className="cursor-pointer bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors">
                            <Upload size={16} />
                            <span>Enviar foto(s) do dispositivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                handleMultipleFilesForCarousel(files);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Ou cole o link de uma foto (URL)"
                              value={newUrlInput}
                              onChange={(e) => setNewUrlInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddUrlToCarousel();
                                }
                              }}
                              className="flex-1 bg-white border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)]"
                            />
                            <button
                              type="button"
                              onClick={handleAddUrlToCarousel}
                              className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
                            >
                              + Adicionar Link
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (f.type === 'bool') {
                    return (
                      <div key={f.key} className="flex items-center gap-3 pt-4">
                        <input
                          type="checkbox"
                          id={`field-${f.key}`}
                          checked={f.key === 'principal' ? Boolean(val) : val !== false}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, [f.key]: e.target.checked },
                            })
                          }
                          className="w-5 h-5 accent-[var(--g)] rounded cursor-pointer"
                        />
                        <label htmlFor={`field-${f.key}`} className="text-sm font-medium cursor-pointer">
                          {f.label}
                        </label>
                      </div>
                    );
                  }

                  if (f.type === 'area') {
                    return (
                      <div key={f.key} className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                          {f.label}
                        </label>
                        <textarea
                          rows={4}
                          value={val}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, [f.key]: e.target.value },
                            })
                          }
                          className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                        />
                      </div>
                    );
                  }

                  if (f.type === 'img') {
                    return (
                      <div key={f.key} className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide block">
                          {f.label}
                        </label>
                        <div className="flex items-center gap-4">
                          {val ? (
                            <img
                              src={val}
                              alt={f.label}
                              className="w-24 h-24 object-cover rounded-xl border border-[var(--line)] shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-xl border border-dashed border-[var(--line)] bg-[var(--off)] flex items-center justify-center text-[var(--ink)]/40 shrink-0">
                              <ImageIcon size={32} />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Cole o link da foto (URL) ou escolha um arquivo abaixo"
                              value={val}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, [f.key]: e.target.value },
                                })
                              }
                              className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)]"
                            />
                            <div className="flex items-center gap-3">
                              <label className="cursor-pointer text-xs bg-[var(--sand)] hover:bg-[var(--line)] px-3 py-1.5 rounded-lg border border-[var(--line)] font-medium transition-colors">
                                Enviar foto do dispositivo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = '';
                                    if (file) {
                                      handleImageFileChange(f.key, file, false);
                                    }
                                  }}
                                />
                              </label>
                              {val && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, [f.key]: '' },
                                    })
                                  }
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Remover foto
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                        {f.label}
                      </label>
                      <input
                        type={f.type === 'num' ? 'number' : 'text'}
                        step={f.type === 'num' ? '0.01' : undefined}
                        value={val}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              [f.key]:
                                f.type === 'num'
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value,
                            },
                          })
                        }
                        className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Sticky Bottom Save Bar */}
              <div className="sticky bottom-0 z-20 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-4 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--line)] rounded-b-3xl flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setNewUrlInput('');
                  }}
                  className="px-5 py-2.5 rounded-full border border-[var(--line)] text-xs sm:text-sm font-semibold hover:bg-[var(--sand)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="btn-primary inline-flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md disabled:opacity-60"
                >
                  {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {processingImagesCount > 0
                    ? 'Processando fotos...'
                    : isSavingAction
                    ? 'Salvando...'
                    : 'Salvar Item'}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSaveItem(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-[var(--g)] hover:bg-[var(--gd)] text-white shadow-md transition-colors disabled:opacity-60"
                >
                  <Check size={16} />
                  Salvar e Ver no Site
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Collection Items List */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    openItemEditor(
                      {
                        ativo: true,
                        ordem: itemsList.length + 1,
                        fotos: [],
                        ...(activeTab === 'tests' ? { nota: 5 } : {}),
                        ...(activeTab === 'gallery' ? { principal: false } : {}),
                      },
                      true
                    )
                  }
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  <Plus size={16} />
                  <span>Adicionar {currentSchema.title}</span>
                </button>

                {activeTab === 'gallery' && (
                  <label className="cursor-pointer bg-[var(--sand)] hover:bg-[#c9a56a]/20 border border-[var(--line)] px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors">
                    <ImageIcon size={16} />
                    <span>Enviar várias fotos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMultipleGalleryUpload}
                    />
                  </label>
                )}
              </div>

              {itemsList.length === 0 && (
                <button
                  type="button"
                  onClick={() => seedDemo(activeTab as CollectionName)}
                  className="text-xs bg-[var(--sand)] hover:bg-[var(--line)] border border-[var(--line)] px-4 py-2 rounded-full font-medium inline-flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-[var(--br)]" />
                  Carregar conteúdo demonstrativo
                </button>
              )}
            </div>

            {/* List */}
            {itemsList.length === 0 ? (
              <div className="text-center py-16 bg-[var(--card)] rounded-3xl border border-[var(--line)] text-gray-500 space-y-3">
                <p className="text-base font-medium">Nenhum item cadastrado nesta categoria.</p>
                <p className="text-xs text-gray-400">Clique em "+ Adicionar" acima para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {itemsList.map((rawItem, idx) => {
                  const item = rawItem as any;
                  const title = item.nome || item.titulo || item.texto || '(sem título)';
                  const hasPhoto =
                    !!item.foto || (Array.isArray(item.fotos) && item.fotos.length > 0);
                  const displayThumb =
                    item.foto || (Array.isArray(item.fotos) ? item.fotos[0] : '');
                  const photoCount = Array.isArray(item.fotos)
                    ? item.fotos.length
                    : item.foto
                    ? 1
                    : 0;
                  const isConfirmingDelete =
                    confirmAction?.type === 'delete' && confirmAction.id === item._id;

                  return (
                    <div
                      key={item._id}
                      className="bg-[var(--card)] border border-[var(--line)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 min-w-[240px]">
                        {hasPhoto ? (
                          <div className="relative">
                            <img
                              src={displayThumb}
                              alt=""
                              className="w-16 h-16 object-cover rounded-xl border border-[var(--line)] shrink-0 shadow-xs"
                            />
                            {photoCount > 1 && (
                              <span className="absolute -bottom-1 -right-1 bg-[#142a20] text-[#c9a56a] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#2a3b30]">
                                {photoCount} fotos
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[var(--sand)] border border-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--g)] shrink-0">
                            #{item.ordem || idx + 1}
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-sm sm:text-base text-[var(--ink)] line-clamp-1">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--ink)]/60">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.ativo !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.ativo !== false ? 'Ativo' : 'Inativo'}
                            </span>
                            <span>• Ordem {item.ordem || idx + 1}</span>
                            {item.preco !== undefined && item.preco !== '' && (
                              <span className="font-semibold text-[var(--br)]">
                                • R$ {item.preco}
                              </span>
                            )}
                            {item.principal && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Controls */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => reorderItem(activeTab as CollectionName, item._id, 'up')}
                          disabled={idx === 0}
                          title="Mover para cima"
                          className="p-2 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => reorderItem(activeTab as CollectionName, item._id, 'down')}
                          disabled={idx === itemsList.length - 1}
                          title="Mover para baixo"
                          className="p-2 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleItemActive(activeTab as CollectionName, item._id)}
                          title={item.ativo !== false ? 'Desativar item' : 'Ativar item'}
                          className="px-3 py-1.5 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] text-xs font-medium flex items-center gap-1"
                        >
                          {item.ativo !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="hidden sm:inline">
                            {item.ativo !== false ? 'Desativar' : 'Ativar'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openItemEditor(item, false)}
                          title="Editar tudo neste item"
                          className="px-3.5 py-1.5 rounded-lg bg-[var(--g)] hover:bg-[var(--gd)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Edit2 size={14} />
                          <span>Editar</span>
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await deleteItem(activeTab as CollectionName, item._id);
                                setConfirmAction(null);
                                if (ok) showStatus('success', 'Item excluído!');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmAction(null)}
                              className="px-2 py-1.5 rounded-lg border border-[var(--line)] text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'delete',
                                id: item._id,
                                label: title,
                              })
                            }
                            title="Excluir item"
                            className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
