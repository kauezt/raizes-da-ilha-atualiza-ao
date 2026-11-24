import {
  ExperienceCategoryConfig,
  ExperienceCategoryId,
  ExperienceCategoryItem,
} from '../types';

export const ALL_EXPERIENCE_CATEGORY_IDS: ExperienceCategoryId[] = [
  'roteiros',
  'gastronomia',
  'cultura',
  'natureza',
];

export function mergeExperienceCategories(
  defaults: ExperienceCategoryConfig[],
  saved?: ExperienceCategoryConfig[] | null
): ExperienceCategoryConfig[] {
  if (!Array.isArray(saved) || saved.length === 0) {
    return defaults.map((c) => ({ ...c }));
  }

  return defaults.map((def) => {
    const match = saved.find((item) => item && item.id === def.id);
    if (!match) return { ...def };
    return {
      id: def.id,
      title: match.title?.trim() ? match.title : def.title,
      subtitle: match.subtitle !== undefined ? match.subtitle : def.subtitle,
      modalTitle: match.modalTitle?.trim() ? match.modalTitle : match.title || def.modalTitle,
      modalSubtitle:
        match.modalSubtitle !== undefined ? match.modalSubtitle : def.modalSubtitle,
    };
  });
}

export function getExperienceCategoryConfig(
  categories: ExperienceCategoryConfig[],
  id: ExperienceCategoryId
): ExperienceCategoryConfig {
  const found = categories.find((c) => c.id === id);
  if (found) return found;
  return {
    id,
    title: id,
    subtitle: '',
    modalTitle: id,
    modalSubtitle: '',
  };
}

export function getCategoryItems(
  items: ExperienceCategoryItem[],
  categoryId: ExperienceCategoryId,
  onlyActive = false
): ExperienceCategoryItem[] {
  return (items || [])
    .filter((item) => item.categoryId === categoryId && (!onlyActive || item.ativo !== false))
    .slice()
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

export function normalizeExperienceItem(
  item: Partial<ExperienceCategoryItem> & { categoryId: ExperienceCategoryId },
  existingLength = 0
): ExperienceCategoryItem {
  const fotos = Array.isArray(item.fotos)
    ? item.fotos.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    : item.foto
    ? [item.foto]
    : [];

  const primaryPhoto = fotos[0] || (item.foto ? item.foto : '');

  return {
    _id:
      item._id ||
      `exp-${item.categoryId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    categoryId: item.categoryId,
    nome: (item.nome || '').trim() || 'Nova experiência',
    subtitulo: (item.subtitulo || '').trim(),
    descricao: (item.descricao || '').trim(),
    detalhe: (item.detalhe || '').trim(),
    preco: item.preco !== undefined ? item.preco : '',
    foto: primaryPhoto,
    fotos,
    ordem:
      item.ordem !== undefined && String(item.ordem) !== ''
        ? Number(item.ordem)
        : existingLength + 1,
    ativo: item.ativo ?? true,
  };
}

export function upsertExperienceItemList(
  items: ExperienceCategoryItem[],
  rawItem: Partial<ExperienceCategoryItem> & { categoryId: ExperienceCategoryId }
): ExperienceCategoryItem[] {
  const sameCategoryCount = items.filter((i) => i.categoryId === rawItem.categoryId).length;
  const normalized = normalizeExperienceItem(rawItem, sameCategoryCount);

  if (rawItem._id) {
    const idx = items.findIndex((i) => i._id === rawItem._id);
    if (idx !== -1) {
      const next = [...items];
      next[idx] = { ...items[idx], ...normalized, _id: rawItem._id };
      return next;
    }
  }
  return [...items, normalized];
}

export function reorderCategoryItemsList(
  allItems: ExperienceCategoryItem[],
  categoryId: ExperienceCategoryId,
  itemId: string,
  direction: 'up' | 'down'
): ExperienceCategoryItem[] {
  const catItems = getCategoryItems(allItems, categoryId, false).map((item) => ({ ...item }));
  const idx = catItems.findIndex((i) => i._id === itemId);
  if (idx === -1) return allItems;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= catItems.length) return allItems;

  const currentOrder = catItems[idx].ordem ?? idx + 1;
  const targetOrder = catItems[targetIdx].ordem ?? targetIdx + 1;
  catItems[idx].ordem = targetOrder;
  catItems[targetIdx].ordem = currentOrder;

  const updatedById = new Map(catItems.map((i) => [i._id, i]));
  return allItems.map((item) => updatedById.get(item._id) || item);
}
