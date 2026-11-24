import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExperienceCategoryConfig,
  ExperienceCategoryId,
  ExperienceCategoryItem,
} from '../types';
import {
  getCategoryItems,
  getExperienceCategoryConfig,
} from '../utils/experienceCategories';
import { compressImageFile } from '../utils/imageUtils';
import {
  Camera,
  Utensils,
  Landmark,
  MapPin,
  Save,
  Check,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sliders,
  Loader2,
} from 'lucide-react';

interface AdminCategoriesTabProps {
  initialCategory?: ExperienceCategoryId | null;
  showStatus: (type: 'success' | 'error', text: string, durationMs?: number) => void;
  onCloseAdmin: () => void;
}

const CATEGORY_TABS: Array<{
  id: ExperienceCategoryId;
  badgeClass: string;
  activeRing: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'roteiros',
    badgeClass: 'bg-[#F6F2E4] text-[#253B21] border-[#DDD4BC]',
    activeRing: 'ring-2 ring-[#32532E] shadow-md',
    icon: <Camera size={18} />,
  },
  {
    id: 'gastronomia',
    badgeClass: 'bg-[#B74C1E] text-[#F6F2E4] border-[#B74C1E]',
    activeRing: 'ring-2 ring-[#DE952F] shadow-md',
    icon: <Utensils size={18} />,
  },
  {
    id: 'cultura',
    badgeClass: 'bg-[#DE952F] text-[#1F331C] border-[#DE952F]',
    activeRing: 'ring-2 ring-[#32532E] shadow-md',
    icon: <Landmark size={18} />,
  },
  {
    id: 'natureza',
    badgeClass: 'bg-[#44757A] text-[#F6F2E4] border-[#44757A]',
    activeRing: 'ring-2 ring-[#DE952F] shadow-md',
    icon: <MapPin size={18} />,
  },
];

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  initialCategory,
  showStatus,
  onCloseAdmin,
}) => {
  const {
    experienceCategories,
    experienceItems,
    updateExperienceCategory,
    saveExperienceItem,
    deleteExperienceItem,
    toggleExperienceItemActive,
    reorderExperienceItem,
    saveError,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategoryId>(
    initialCategory || 'roteiros'
  );

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setEditingItem(null);
    }
  }, [initialCategory]);

  const currentCatConfig = getExperienceCategoryConfig(experienceCategories, selectedCategory);

  const [catForm, setCatForm] = useState<ExperienceCategoryConfig>(currentCatConfig);
  const [hasCatUnsaved, setHasCatUnsaved] = useState(false);

  useEffect(() => {
    setCatForm(getExperienceCategoryConfig(experienceCategories, selectedCategory));
    setHasCatUnsaved(false);
  }, [experienceCategories, selectedCategory]);

  const [editingItem, setEditingItem] = useState<{
    isNew: boolean;
    data: Partial<ExperienceCategoryItem> & { categoryId: ExperienceCategoryId };
  } | null>(null);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [processingImagesCount, setProcessingImagesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categoryItems = getCategoryItems(experienceItems, selectedCategory, false);
  const isBusy = processingImagesCount > 0 || isSaving;

  const handleSaveCategoryMeta = async (andClose = false) => {
    if (!catForm.title.trim()) {
      showStatus('error', 'Informe o nome da categoria antes de salvar.');
      return;
    }
    setIsSaving(true);
    try {
      const ok = await updateExperienceCategory({
        ...catForm,
        title: catForm.title.trim(),
        subtitle: catForm.subtitle.trim(),
        modalTitle: catForm.modalTitle.trim() || catForm.title.trim(),
        modalSubtitle: catForm.modalSubtitle.trim(),
      });
      if (ok) {
        setHasCatUnsaved(false);
        showStatus('success', `Categoria "${catForm.title.trim()}" salva permanentemente!`);
        if (andClose) onCloseAdmin();
      } else {
        showStatus('error', saveError || 'Não foi possível salvar a categoria.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenItemEditor = (item?: ExperienceCategoryItem) => {
    if (item) {
      const fotos =
        Array.isArray(item.fotos) && item.fotos.length > 0
          ? [...item.fotos]
          : item.foto
          ? [item.foto]
          : [];
      setEditingItem({
        isNew: false,
        data: { ...item, fotos, foto: fotos[0] || item.foto || '' },
      });
    } else {
      setEditingItem({
        isNew: true,
        data: {
          categoryId: selectedCategory,
          nome: '',
          subtitulo: '',
          descricao: '',
          detalhe: '',
          preco: '',
          foto: '',
          fotos: [],
          ordem: categoryItems.length + 1,
          ativo: true,
        },
      });
    }
    setNewUrlInput('');
    setConfirmDeleteId(null);
  };

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingItem) return;
    const fileArray = Array.from(files);
    setProcessingImagesCount((c) => c + 1);
    try {
      const dataUrls = await Promise.all(
        fileArray.map((file) =>
          compressImageFile(file, { maxDimension: 1600, quality: 0.82 })
        )
      );
      setEditingItem((prev) => {
        if (!prev) return null;
        const currentFotos = Array.isArray(prev.data.fotos) ? [...prev.data.fotos] : [];
        const updatedFotos = [...currentFotos, ...dataUrls];
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
        `${dataUrls.length} imagem(ns) otimizada(s)! Clique em "Salvar Item" para gravar.`
      );
    } catch {
      showStatus('error', 'Erro ao processar uma das imagens selecionadas.');
    } finally {
      setProcessingImagesCount((c) => Math.max(0, c - 1));
    }
  };

  const handleAddUrl = () => {
    const trimmed = newUrlInput.trim();
    if (!trimmed || !editingItem) return;
    setEditingItem((prev) => {
      if (!prev) return null;
      const currentFotos = Array.isArray(prev.data.fotos) ? [...prev.data.fotos] : [];
      const updatedFotos = [...currentFotos, trimmed];
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

  const handleRemovePhoto = (idx: number) => {
    setEditingItem((prev) => {
      if (!prev) return null;
      const currentFotos = Array.isArray(prev.data.fotos) ? [...prev.data.fotos] : [];
      currentFotos.splice(idx, 1);
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

  const handleReorderPhoto = (fromIdx: number, toIdx: number) => {
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

  const handleSaveEditingItem = async (andCloseAdmin = false) => {
    if (!editingItem) return;
    if (processingImagesCount > 0) {
      showStatus('error', 'Aguarde o processamento das imagens antes de salvar.');
      return;
    }

    const dataToSave = { ...editingItem.data };
    if (!String(dataToSave.nome || '').trim()) {
      showStatus('error', 'Informe o nome do item antes de salvar.');
      return;
    }

    const pendingUrl = newUrlInput.trim();
    if (pendingUrl) {
      const currentFotos = Array.isArray(dataToSave.fotos) ? [...dataToSave.fotos] : [];
      dataToSave.fotos = [...currentFotos, pendingUrl];
      setNewUrlInput('');
    }

    setIsSaving(true);
    try {
      const ok = await saveExperienceItem(dataToSave);
      if (ok) {
        setEditingItem(null);
        showStatus('success', `"${dataToSave.nome}" salvo permanentemente em ${currentCatConfig.title}!`);
        if (andCloseAdmin) onCloseAdmin();
      } else {
        showStatus('error', saveError || 'Erro ao salvar item.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div data-testid="admin-categories-panel" className="space-y-6">
      {/* Header & 4 Category Selectors */}
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div>
          <h2 className="font-serif text-2xl text-[var(--g)] font-bold">
            Categorias: Roteiros, Gastronomia, Cultura &amp; Natureza
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink)]/75 mt-1">
            Escolha uma das 4 categorias abaixo para editar o nome dela, alterar o nome e as informações de cada experiência interna, trocar imagens ou adicionar novos itens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORY_TABS.map((tab) => {
            const cfg = getExperienceCategoryConfig(experienceCategories, tab.id);
            const count = getCategoryItems(experienceItems, tab.id, false).length;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`admin-cat-select-${tab.id}`}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setEditingItem(null);
                  setConfirmDeleteId(null);
                }}
                className={`${tab.badgeClass} border rounded-2xl p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected ? tab.activeRing : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0">{tab.icon}</span>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-base leading-tight truncate">
                      {cfg.title}
                    </p>
                    <p className="text-[11px] opacity-85 truncate">{count} item(ns)</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Metadata Editor (Category Name & Subtitle) */}
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[var(--g)]">
              Nome e textos da categoria &ldquo;{currentCatConfig.title}&rdquo;
            </h3>
            <p className="text-xs text-[var(--ink)]/70">
              Altere como esta categoria aparece no card da página e no topo ao ser aberta.
            </p>
          </div>
          {hasCatUnsaved ? (
            <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-semibold">
              Alterações não salvas
            </span>
          ) : (
            <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
              <Check size={13} /> Salvo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="cat-card-title"
              className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
            >
              Nome no card da página
            </label>
            <input
              id="cat-card-title"
              type="text"
              value={catForm.title}
              onChange={(e) => {
                setCatForm({ ...catForm, title: e.target.value });
                setHasCatUnsaved(true);
              }}
              className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cat-card-subtitle"
              className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
            >
              Subtítulo curto no card
            </label>
            <input
              id="cat-card-subtitle"
              type="text"
              value={catForm.subtitle}
              onChange={(e) => {
                setCatForm({ ...catForm, subtitle: e.target.value });
                setHasCatUnsaved(true);
              }}
              className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cat-modal-title"
              className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
            >
              Título ao abrir a categoria
            </label>
            <input
              id="cat-modal-title"
              type="text"
              value={catForm.modalTitle}
              onChange={(e) => {
                setCatForm({ ...catForm, modalTitle: e.target.value });
                setHasCatUnsaved(true);
              }}
              className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cat-modal-subtitle"
              className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
            >
              Descrição ao abrir a categoria
            </label>
            <input
              id="cat-modal-subtitle"
              type="text"
              value={catForm.modalSubtitle}
              onChange={(e) => {
                setCatForm({ ...catForm, modalSubtitle: e.target.value });
                setHasCatUnsaved(true);
              }}
              className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSaveCategoryMeta(false)}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs uppercase tracking-wider shadow-sm disabled:opacity-60"
          >
            {isBusy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Salvar Nome da Categoria</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSaveCategoryMeta(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs uppercase tracking-wider bg-[var(--g)] hover:bg-[var(--gd)] text-white shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Check size={15} />
            <span>Salvar e Ver no Site</span>
          </button>
        </div>
      </div>

      {/* Items Inside Selected Category OR Item Form */}
      {editingItem ? (
        <div
          data-testid="admin-cat-item-editor"
          className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div>
              <h3 className="font-serif text-2xl text-[var(--g)] font-bold">
                {editingItem.isNew
                  ? `Novo item em ${currentCatConfig.title}`
                  : `Editar item em ${currentCatConfig.title}`}
              </h3>
              <p className="text-xs text-[var(--ink)]/70">
                Altere o nome, as informações descritivas e as imagens abaixo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="text-xs text-[var(--ink)]/75 hover:text-[var(--ink)] border border-[var(--line)] px-3.5 py-1.5 rounded-full cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditingItem(false);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="cat-item-name"
                  className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
                >
                  Nome do item *
                </label>
                <input
                  id="cat-item-name"
                  type="text"
                  required
                  placeholder="Ex.: Trilha do Manguezal ou Moqueca da Ilha"
                  value={editingItem.data.nome ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, nome: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-item-subtitle"
                  className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
                >
                  Etiqueta / Subtítulo (opcional)
                </label>
                <input
                  id="cat-item-subtitle"
                  type="text"
                  placeholder="Ex.: Patrimônio Histórico, Prato Principal..."
                  value={editingItem.data.subtitulo ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, subtitulo: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label
                  htmlFor="cat-item-desc"
                  className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
                >
                  Informações / Descrição
                </label>
                <textarea
                  id="cat-item-desc"
                  rows={4}
                  placeholder="Descreva os detalhes desta experiência, passeio, prato ou local..."
                  value={editingItem.data.descricao ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, descricao: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-item-detail"
                  className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
                >
                  Duração / Horário / Destaque (opcional)
                </label>
                <input
                  id="cat-item-detail"
                  type="text"
                  placeholder="Ex.: 3 horas de passeio ou Centro Histórico"
                  value={editingItem.data.detalhe ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, detalhe: e.target.value },
                    })
                  }
                  className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-item-price"
                  className="block text-xs font-semibold text-[var(--gm)] uppercase tracking-wide"
                >
                  Valor em R$ (opcional)
                </label>
                <input
                  id="cat-item-price"
                  type="number"
                  step="0.01"
                  placeholder="Deixe vazio para não exibir preço"
                  value={editingItem.data.preco ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: {
                        ...editingItem.data,
                        preco: e.target.value === '' ? '' : Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-[var(--off)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--g)]"
                />
              </div>

              {/* Multi-Photo Manager */}
              <div className="md:col-span-2 space-y-3 p-5 rounded-2xl bg-[var(--off)] border border-[var(--line)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-[var(--g)] uppercase tracking-wide flex items-center gap-2">
                      <Sliders size={16} />
                      Imagens deste item
                    </label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Envie fotos do seu aparelho ou cole links de imagem. A 1ª foto é a capa principal.
                    </p>
                  </div>
                  <span className="text-xs bg-[#DE952F]/20 text-[#1F331C] font-semibold px-2.5 py-1 rounded-full">
                    {(editingItem.data.fotos || []).length} imagem(ns)
                  </span>
                </div>

                {(editingItem.data.fotos || []).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {(editingItem.data.fotos || []).map((photoUrl, pIdx) => (
                      <div
                        key={`${pIdx}-${photoUrl.slice(0, 24)}`}
                        className="relative rounded-xl overflow-hidden border border-[var(--line)] bg-white shadow-xs"
                      >
                        <img
                          src={photoUrl}
                          alt={`Foto ${pIdx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {pIdx === 0 ? '1ª (Capa)' : `${pIdx + 1}ª`}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 flex items-center justify-between text-white">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={pIdx === 0}
                              onClick={() => handleReorderPhoto(pIdx, pIdx - 1)}
                              className="p-1 hover:text-[#DE952F] disabled:opacity-25 cursor-pointer"
                              title="Mover foto para esquerda"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={pIdx === (editingItem.data.fotos || []).length - 1}
                              onClick={() => handleReorderPhoto(pIdx, pIdx + 1)}
                              className="p-1 hover:text-[#DE952F] disabled:opacity-25 cursor-pointer"
                              title="Mover foto para direita"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="p-1 text-red-300 hover:text-red-200 cursor-pointer"
                            title="Remover esta foto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-[var(--line)] rounded-xl bg-white/60 text-xs text-gray-500">
                    Nenhuma imagem selecionada ainda. Envie fotos ou adicione um link abaixo.
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <label className="cursor-pointer bg-[var(--sand)] hover:bg-[#DE952F]/25 border border-[var(--line)] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors">
                    <Upload size={16} />
                    <span>Enviar foto(s) do dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleUploadPhotos(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      id="cat-item-photo-url"
                      type="text"
                      placeholder="Ou cole o link da imagem (URL)"
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      className="flex-1 bg-white border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
                    >
                      + Adicionar Link
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="cat-item-active"
                  type="checkbox"
                  checked={editingItem.data.ativo !== false}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, ativo: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-[var(--g)] rounded cursor-pointer"
                />
                <label htmlFor="cat-item-active" className="text-sm font-medium cursor-pointer">
                  Exibir este item na categoria do site
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-4 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--line)] rounded-b-3xl flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-full border border-[var(--line)] text-xs sm:text-sm font-semibold hover:bg-[var(--sand)] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md disabled:opacity-60"
              >
                {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>
                  {processingImagesCount > 0
                    ? 'Processando fotos...'
                    : isSaving
                    ? 'Salvando...'
                    : 'Salvar Item'}
                </span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleSaveEditingItem(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider bg-[var(--g)] hover:bg-[var(--gd)] text-white shadow-md transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Check size={16} />
                <span>Salvar e Ver no Site</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--line)] shadow-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-[var(--g)]">
                Itens dentro de &ldquo;{currentCatConfig.title}&rdquo;
              </h3>
              <p className="text-xs text-[var(--ink)]/70">
                Clique em &ldquo;Editar&rdquo; em qualquer item para mudar nome, texto ou fotos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenItemEditor()}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs"
            >
              <Plus size={16} />
              <span>Adicionar em {currentCatConfig.title}</span>
            </button>
          </div>

          {categoryItems.length === 0 ? (
            <div className="text-center py-14 bg-[var(--card)] rounded-3xl border border-[var(--line)] text-gray-500 space-y-2">
              <p className="text-base font-medium">Nenhum item cadastrado nesta categoria.</p>
              <p className="text-xs text-gray-400">
                Clique em &ldquo;Adicionar em {currentCatConfig.title}&rdquo; acima para criar um item.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryItems.map((item, idx) => {
                const displayThumb =
                  item.foto || (Array.isArray(item.fotos) ? item.fotos[0] : '');
                const photoCount = Array.isArray(item.fotos)
                  ? item.fotos.length
                  : item.foto
                  ? 1
                  : 0;
                const isConfirming = confirmDeleteId === item._id;

                return (
                  <div
                    key={item._id}
                    data-testid={`admin-cat-item-${item._id}`}
                    className="bg-[var(--card)] border border-[var(--line)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 min-w-[240px] flex-1">
                      {displayThumb ? (
                        <div className="relative shrink-0">
                          <img
                            src={displayThumb}
                            alt={item.nome}
                            className="w-16 h-16 object-cover rounded-xl border border-[var(--line)] shadow-xs"
                          />
                          {photoCount > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#142a20] text-[#DE952F] text-[10px] font-bold px-1.5 rounded-full border border-[#2a3b30]">
                              {photoCount} fotos
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[var(--sand)] border border-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--g)] shrink-0">
                          #{idx + 1}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-[var(--ink)] truncate">
                          {item.nome}
                        </h4>
                        {item.descricao && (
                          <p className="text-xs text-[var(--ink)]/70 line-clamp-1 mt-0.5">
                            {item.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--ink)]/60">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.ativo !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.ativo !== false ? 'Ativo' : 'Oculto'}
                          </span>
                          {item.subtitulo && <span>• {item.subtitulo}</span>}
                          {item.detalhe && <span>• {item.detalhe}</span>}
                          {item.preco !== undefined && item.preco !== '' && (
                            <span className="font-semibold text-[var(--br)]">
                              • R$ {item.preco}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => reorderExperienceItem(selectedCategory, item._id, 'up')}
                        disabled={idx === 0}
                        title="Mover para cima"
                        className="p-2 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => reorderExperienceItem(selectedCategory, item._id, 'down')}
                        disabled={idx === categoryItems.length - 1}
                        title="Mover para baixo"
                        className="p-2 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExperienceItemActive(item._id)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--off)] hover:bg-[var(--sand)] border border-[var(--line)] text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {item.ativo !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span className="hidden sm:inline">
                          {item.ativo !== false ? 'Ocultar' : 'Exibir'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenItemEditor(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--g)] hover:bg-[var(--gd)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await deleteExperienceItem(item._id);
                              setConfirmDeleteId(null);
                              if (ok) showStatus('success', 'Item excluído!');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg border border-[var(--line)] text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item._id)}
                          title="Excluir item"
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
  );
};
