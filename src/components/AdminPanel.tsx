import React, { useState, useEffect, useRef } from 'react';
import { useApp, CollectionName } from '../context/AppContext';
import { SiteSettings } from '../types';
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
} from 'lucide-react';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'area' | 'num' | 'bool' | 'img';
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
      { key: 'logo', label: 'Logotipo (imagem)', type: 'img', category: 'Identidade & Logotipo', help: 'Se vazio, usa o ícone exclusivo Raízes' },
      { key: 'favicon', label: 'Favicon', type: 'img', category: 'Identidade & Logotipo' },

      // Hero
      { key: 'heroBadge', label: 'Badge superior do Hero', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroTitle', label: 'Título Principal (Hero)', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroSub', label: 'Subtítulo do Hero', type: 'area', category: 'Topo (Hero)' },
      { key: 'heroImage', label: 'Foto de fundo do Hero', type: 'img', category: 'Topo (Hero)' },
      { key: 'heroCta1Text', label: 'Texto do Botão 1', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroCta1Link', label: 'Link do Botão 1 (ex: #pacotes)', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroCta2Text', label: 'Texto do Botão 2 (WhatsApp)', type: 'text', category: 'Topo (Hero)' },
      { key: 'heroScrollText', label: 'Texto de rolagem inferior', type: 'text', category: 'Topo (Hero)' },

      // Sobre
      { key: 'aboutEyebrow', label: 'Eyebrow do Sobre', type: 'text', category: 'Seção Sobre' },
      { key: 'aboutTitle', label: 'Título da Seção Sobre', type: 'text', category: 'Seção Sobre' },
      { key: 'aboutText', label: 'Texto Completo do Sobre', type: 'area', category: 'Seção Sobre' },
      { key: 'aboutImage', label: 'Foto da Seção Sobre', type: 'img', category: 'Seção Sobre' },
      { key: 'aboutChips', label: 'Destaques / Tags (um por linha)', type: 'area', category: 'Seção Sobre' },
      { key: 'aboutBadgeTitle', label: 'Título do Selo Flutuante', type: 'text', category: 'Seção Sobre' },
      { key: 'aboutBadgeText', label: 'Texto do Selo Flutuante', type: 'text', category: 'Seção Sobre' },

      // Títulos das seções
      { key: 'packagesEyebrow', label: 'Eyebrow de Pacotes', type: 'text', category: 'Títulos de Seções' },
      { key: 'packagesTitle', label: 'Título de Pacotes', type: 'text', category: 'Títulos de Seções' },
      { key: 'packagesSub', label: 'Subtítulo de Pacotes', type: 'area', category: 'Títulos de Seções' },

      { key: 'tourEyebrow', label: 'Eyebrow do Passeio', type: 'text', category: 'Títulos de Seções' },
      { key: 'tourTitle', label: 'Título do Passeio de Barco', type: 'text', category: 'Títulos de Seções' },
      { key: 'tourBadge', label: 'Badge do Passeio (ex: Embarcação Segura)', type: 'text', category: 'Títulos de Seções' },
      { key: 'tourImage', label: 'Foto de fallback do Passeio', type: 'img', category: 'Títulos de Seções' },

      { key: 'stayEyebrow', label: 'Eyebrow de Hospedagem', type: 'text', category: 'Títulos de Seções' },
      { key: 'stayTitle', label: 'Título de Hospedagem', type: 'text', category: 'Títulos de Seções' },
      { key: 'staySub', label: 'Subtítulo de Hospedagem', type: 'area', category: 'Títulos de Seções' },

      { key: 'foodEyebrow', label: 'Eyebrow do Restaurante', type: 'text', category: 'Títulos de Seções' },
      { key: 'foodTitle', label: 'Título do Restaurante', type: 'text', category: 'Títulos de Seções' },
      { key: 'foodSub', label: 'Subtítulo do Restaurante', type: 'area', category: 'Títulos de Seções' },

      { key: 'galleryEyebrow', label: 'Eyebrow da Galeria', type: 'text', category: 'Títulos de Seções' },
      { key: 'galleryTitle', label: 'Título da Galeria', type: 'text', category: 'Títulos de Seções' },
      { key: 'gallerySub', label: 'Subtítulo da Galeria', type: 'area', category: 'Títulos de Seções' },

      { key: 'testEyebrow', label: 'Eyebrow de Depoimentos', type: 'text', category: 'Títulos de Seções' },
      { key: 'testTitle', label: 'Título de Depoimentos', type: 'text', category: 'Títulos de Seções' },
      { key: 'testSub', label: 'Subtítulo de Depoimentos', type: 'area', category: 'Títulos de Seções' },

      // Instagram Banner
      { key: 'instagramTitle', label: 'Título do Banner Instagram', type: 'text', category: 'Instagram & Redes' },
      { key: 'instagramSub', label: 'Subtítulo do Banner Instagram', type: 'area', category: 'Instagram & Redes' },
      { key: 'instagramCta', label: 'Texto do Botão Instagram', type: 'text', category: 'Instagram & Redes' },

      // Contato
      { key: 'contactEyebrow', label: 'Eyebrow do Contato', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'contactTitle', label: 'Título da Seção Contato', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'contactSub', label: 'Subtítulo do Contato', type: 'area', category: 'Contatos & Redes Sociais' },
      { key: 'whatsapp', label: 'Número de WhatsApp (ex: 5598988001122)', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'whatsappDefaultMsg', label: 'Mensagem Padrão do WhatsApp', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'contactCta', label: 'Texto do Botão WhatsApp Contato', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'email', label: 'E-mail de contato', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'address', label: 'Endereço / Localização física', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'instagram', label: 'Link do Instagram', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'facebook', label: 'Link do Facebook', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'tiktok', label: 'Link do TikTok', type: 'text', category: 'Contatos & Redes Sociais' },
      { key: 'youtube', label: 'Link do YouTube', type: 'text', category: 'Contatos & Redes Sociais' },

      // Rodapé
      { key: 'footerText', label: 'Texto Descritivo do Rodapé', type: 'area', category: 'Rodapé' },
      { key: 'footerCopyright', label: 'Texto de Copyright', type: 'text', category: 'Rodapé' },
      { key: 'footerSub', label: 'Texto Secundário do Rodapé', type: 'text', category: 'Rodapé' },
    ],
  },
  packages: {
    title: 'Pacotes',
    fields: [
      { key: 'nome', label: 'Nome do pacote', type: 'text' },
      { key: 'foto', label: 'Foto do pacote', type: 'img' },
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
      { key: 'foto', label: 'Foto do passeio', type: 'img' },
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
      { key: 'foto', label: 'Foto da acomodação', type: 'img' },
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
      { key: 'foto', label: 'Foto do prato', type: 'img' },
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
    adminInitialEditItem,
    editMode,
    setEditMode,
    exportBackupData,
    importBackupData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('settings');
  const [editingItem, setEditingItem] = useState<{ isNew: boolean; data: any } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [settingsFormData, setSettingsFormData] = useState<SiteSettings>({ ...settings });
  const [settingsCategoryFilter, setSettingsCategoryFilter] = useState<string>('Todos');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab and edit item when opened via on-page edit badges
  useEffect(() => {
    if (adminInitialTab && SCHEMAS[adminInitialTab]) {
      setActiveTab(adminInitialTab);
    }
    if (adminInitialEditItem) {
      setEditingItem({ isNew: false, data: { ...adminInitialEditItem } });
    }
  }, [adminInitialTab, adminInitialEditItem, isAdminOpen]);

  // Keep local settings form updated when settings change externally
  useEffect(() => {
    setSettingsFormData({ ...settings });
  }, [settings]);

  if (!isAdminOpen) return null;

  const currentSchema = SCHEMAS[activeTab] || SCHEMAS.settings;

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsFormData);
    setStatusMessage('Todas as configurações foram salvas com sucesso!');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    saveItem(activeTab as CollectionName, editingItem.data);
    setEditingItem(null);
    setStatusMessage('Item salvo com sucesso!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleImageFileChange = (key: string, file: File, isSettings: boolean) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isSettings) {
        setSettingsFormData((prev) => ({ ...prev, [key]: result }));
      } else {
        setEditingItem((prev) => prev ? { ...prev, data: { ...prev.data, [key]: result } } : null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        saveItem('gallery', {
          foto: result,
          titulo: file.name.replace(/\.[^/.]+$/, ''),
          descricao: '',
          ordem: gallery.length + index + 1,
          ativo: true,
        });
      };
      reader.readAsDataURL(file);
    });

    setStatusMessage(`${files.length} foto(s) enviada(s) para a galeria com sucesso!`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        setStatusMessage('Backup importado com sucesso! Todo o site foi atualizado.');
      } else {
        setStatusMessage('Erro: Arquivo JSON de backup inválido.');
      }
      setTimeout(() => setStatusMessage(''), 4000);
    };
    reader.readAsText(file);
  };

  const itemsList = getCollectionList().slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  // Extract categories for settings tab filter
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

  return (
    <div className="fixed inset-0 z-50 bg-[#101a14]/95 backdrop-blur-md overflow-y-auto animate-fadeIn flex flex-col text-[var(--ink)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#142a20] text-[#f3eddc] px-6 py-4 flex items-center justify-between border-b border-[#2a3b30] shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-[#c9a56a]">
            Painel do Proprietário
          </span>
          <span className="hidden sm:inline-block text-xs bg-[#1f3d2e] text-[#7fb3b0] px-3 py-1 rounded-full border border-[#7fb3b0]/30 font-semibold">
            Edição Total do Site
          </span>
        </div>

        <div className="flex items-center gap-3">
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
            <Check size={16} />
            <span>Ver site</span>
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="bg-[#18261d] border-b border-[#2a3b30] px-6 py-3 flex gap-2 flex-wrap items-center overflow-x-auto">
        {Object.keys(SCHEMAS).map((key) => {
          const tab = SCHEMAS[key];
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                setEditingItem(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                isActive
                  ? 'bg-[#c9a56a] text-[#1a1208] font-bold shadow-md'
                  : 'bg-[#142a20] text-[#f3eddc]/80 hover:text-white border border-[#2a3b30]'
              }`}
            >
              {tab.title}
            </button>
          );
        })}

        {/* Backup Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('backup');
            setEditingItem(null);
          }}
          className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
            activeTab === 'backup'
              ? 'bg-[#c9a56a] text-[#1a1208] font-bold shadow-md'
              : 'bg-[#142a20] text-[#f3eddc]/80 hover:text-white border border-[#2a3b30]'
          }`}
        >
          Backup & Dados
        </button>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div className="bg-[#5a6b3a] text-white text-xs px-6 py-3 flex items-center justify-between font-medium shadow-md">
          <span className="flex items-center gap-2">
            <Check size={16} /> {statusMessage}
          </span>
          <button type="button" onClick={() => setStatusMessage('')} className="underline text-xs">
            Fechar
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {activeTab === 'backup' ? (
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
                  Baixe um arquivo seguro com todos os pacotes, cardápio, fotos, textos e configurações atuais do seu site.
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

            {/* Reset to defaults */}
            <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-red-600">Restaurar Conteúdo de Demonstração</h4>
                <p className="text-xs text-gray-500">
                  Volta o site exatamente para os dados originais padrão de demonstração.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Atenção: Deseja redefinir todo o site para o conteúdo demonstrativo padrão? Suas alterações salvas serão substituídas.')) {
                    resetAll();
                    setStatusMessage('Site redefinido com sucesso para o conteúdo padrão!');
                  }
                }}
                className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                Resetar tudo
              </button>
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

              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja restaurar as configurações padrão de demonstração?')) {
                    resetAll();
                    setStatusMessage('Configurações restauradas com sucesso!');
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                Restaurar padrões
              </button>
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

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSchema.fields
                  .filter((f) => settingsCategoryFilter === 'Todos' || f.category === settingsCategoryFilter)
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
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{f.category}</span>
                            )}
                          </div>
                          <textarea
                            rows={3}
                            value={val}
                            onChange={(e) =>
                              setSettingsFormData({ ...settingsFormData, [f.key]: e.target.value })
                            }
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
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{f.category}</span>
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
                                onChange={(e) =>
                                  setSettingsFormData({ ...settingsFormData, [f.key]: e.target.value })
                                }
                                className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3 py-1.5 text-xs text-[var(--ink)]"
                              />
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer text-xs bg-[var(--sand)] hover:bg-[var(--line)] px-3 py-1 rounded-lg border border-[var(--line)] font-medium transition-colors">
                                  Enviar foto do computador
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleImageFileChange(f.key, e.target.files[0], true);
                                      }
                                    }}
                                  />
                                </label>
                                {val && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSettingsFormData({ ...settingsFormData, [f.key]: '' })
                                    }
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

                    return (
                      <div key={f.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[var(--gm)] uppercase tracking-wide">
                            {f.label}
                          </label>
                          {f.category && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{f.category}</span>
                          )}
                        </div>
                        <input
                          type={f.type === 'num' ? 'number' : 'text'}
                          value={val}
                          onChange={(e) =>
                            setSettingsFormData({
                              ...settingsFormData,
                              [f.key]: f.type === 'num' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                            })
                          }
                          className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                        />
                      </div>
                    );
                  })}
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex justify-end">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm uppercase tracking-wider shadow-md"
                >
                  <Save size={18} />
                  Salvar Todas as Configurações
                </button>
              </div>
            </form>
          </div>
        ) : editingItem ? (
          /* Form for Editing or Creating an Item */
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--line)]">
              <div>
                <h2 className="font-serif text-2xl text-[var(--g)] font-bold">
                  {editingItem.isNew ? `Novo em ${currentSchema.title}` : `Editar ${currentSchema.title}`}
                </h2>
                <p className="text-xs text-[var(--ink)]/60">
                  Preencha os campos abaixo. As alterações entram em vigor imediatamente após salvar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-xs text-[var(--ink)]/60 hover:text-[var(--ink)] border border-[var(--line)] px-3 py-1.5 rounded-full"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSchema.fields.map((f) => {
                  const val = editingItem.data[f.key] ?? '';

                  if (f.type === 'bool') {
                    return (
                      <div key={f.key} className="flex items-center gap-3 pt-4">
                        <input
                          type="checkbox"
                          id={`field-${f.key}`}
                          checked={val !== false}
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
                                Enviar foto do computador/celular
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleImageFileChange(f.key, e.target.files[0], false);
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
                              [f.key]: f.type === 'num' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                            },
                          })
                        }
                        className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--g)] text-[var(--ink)]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-[var(--line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-2.5 rounded-full border border-[var(--line)] text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wider shadow-md"
                >
                  <Save size={16} />
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Collection Items List */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingItem({
                      isNew: true,
                      data: {
                        ativo: true,
                        ordem: itemsList.length + 1,
                        ...(activeTab === 'tests' ? { nota: 5 } : {}),
                      },
                    })
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
                  const hasPhoto = !!item.foto;

                  return (
                    <div
                      key={item._id}
                      className="bg-[var(--card)] border border-[var(--line)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 min-w-[240px]">
                        {hasPhoto ? (
                          <img
                            src={item.foto}
                            alt=""
                            className="w-16 h-16 object-cover rounded-xl border border-[var(--line)] shrink-0 shadow-xs"
                          />
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
                          onClick={() => setEditingItem({ isNew: false, data: { ...item } })}
                          title="Editar tudo neste item"
                          className="px-3.5 py-1.5 rounded-lg bg-[var(--g)] hover:bg-[var(--gd)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Edit2 size={14} />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Excluir permanentemente "${title}"?`)) {
                              deleteItem(activeTab as CollectionName, item._id);
                            }
                          }}
                          title="Excluir item"
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
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
