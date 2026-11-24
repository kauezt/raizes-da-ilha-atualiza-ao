import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCategoryItems,
  getExperienceCategoryConfig,
  mergeExperienceCategories,
  normalizeExperienceItem,
  reorderCategoryItemsList,
  upsertExperienceItemList,
} from './experienceCategories';
import { ExperienceCategoryConfig, ExperienceCategoryItem } from '../types';

const DEFAULT_CATS: ExperienceCategoryConfig[] = [
  {
    id: 'roteiros',
    title: 'Roteiros Turísticos',
    subtitle: 'Passeios imperdíveis',
    modalTitle: 'Roteiros Turísticos',
    modalSubtitle: 'Passeios guiados por São Luís e igarapés.',
  },
  {
    id: 'gastronomia',
    title: 'Gastronomia',
    subtitle: 'Sabores da nossa terra',
    modalTitle: 'Gastronomia Maranhense',
    modalSubtitle: 'Frutos do mar frescos e receitas locais.',
  },
  {
    id: 'cultura',
    title: 'Cultura',
    subtitle: 'Nossa história viva',
    modalTitle: 'Cultura & Patrimônio',
    modalSubtitle: 'Casarões coloniais e tradições.',
  },
  {
    id: 'natureza',
    title: 'Natureza',
    subtitle: 'Belezas naturais únicas',
    modalTitle: 'Natureza & Refúgios',
    modalSubtitle: 'Pôr do sol e manguezais.',
  },
];

test('mergeExperienceCategories preserves custom names and falls back for missing entries', () => {
  const merged = mergeExperienceCategories(DEFAULT_CATS, [
    {
      id: 'cultura',
      title: 'Cultura Viva SLZ',
      subtitle: 'Centro Histórico e Bumba Meu Boi',
      modalTitle: 'Cultura Maranhense',
      modalSubtitle: 'Vivências culturais exclusivas.',
    },
  ]);

  assert.equal(merged.length, 4);
  assert.equal(getExperienceCategoryConfig(merged, 'cultura').title, 'Cultura Viva SLZ');
  assert.equal(getExperienceCategoryConfig(merged, 'cultura').subtitle, 'Centro Histórico e Bumba Meu Boi');
  assert.equal(getExperienceCategoryConfig(merged, 'natureza').title, 'Natureza');
});

test('upsertExperienceItemList updates name, description, and photos while isolating categories', () => {
  const initial: ExperienceCategoryItem[] = [
    {
      _id: 'exp-1',
      categoryId: 'roteiros',
      nome: 'Passeio Antigo',
      descricao: 'Texto antigo',
      foto: 'https://example.com/a.jpg',
      fotos: ['https://example.com/a.jpg'],
      ordem: 1,
      ativo: true,
    },
    {
      _id: 'exp-2',
      categoryId: 'natureza',
      nome: 'Manguezal',
      descricao: 'Reserva ecológica',
      foto: 'https://example.com/b.jpg',
      fotos: ['https://example.com/b.jpg'],
      ordem: 1,
      ativo: true,
    },
  ];

  const updated = upsertExperienceItemList(initial, {
    _id: 'exp-1',
    categoryId: 'roteiros',
    nome: 'City Tour Centro Histórico',
    descricao: 'Caminhada pelos casarões e azulejos coloniais.',
    detalhe: '3 horas',
    fotos: ['https://example.com/nova.jpg', 'https://example.com/nova2.jpg'],
  });

  const roteiros = getCategoryItems(updated, 'roteiros', true);
  assert.equal(roteiros.length, 1);
  assert.equal(roteiros[0].nome, 'City Tour Centro Histórico');
  assert.equal(roteiros[0].foto, 'https://example.com/nova.jpg');
  assert.equal(roteiros[0].fotos?.length, 2);

  // Other category remains untouched
  assert.equal(getCategoryItems(updated, 'natureza', true)[0].nome, 'Manguezal');

  // Adding a new item inside cultura
  const withCulture = upsertExperienceItemList(updated, {
    categoryId: 'cultura',
    nome: 'Tambor de Crioula',
    descricao: 'Apresentação cultural tradicional.',
    fotos: ['https://example.com/tambor.jpg'],
  });
  assert.equal(getCategoryItems(withCulture, 'cultura', true).length, 1);
  assert.equal(getCategoryItems(withCulture, 'cultura', true)[0].nome, 'Tambor de Crioula');
});

test('reorderCategoryItemsList swaps order within the same category only', () => {
  const items: ExperienceCategoryItem[] = [
    normalizeExperienceItem({ _id: 'a', categoryId: 'gastronomia', nome: 'Prato A', ordem: 1 }),
    normalizeExperienceItem({ _id: 'b', categoryId: 'gastronomia', nome: 'Prato B', ordem: 2 }),
    normalizeExperienceItem({ _id: 'c', categoryId: 'cultura', nome: 'Cultura C', ordem: 1 }),
  ];

  const reordered = reorderCategoryItemsList(items, 'gastronomia', 'b', 'up');
  const gastro = getCategoryItems(reordered, 'gastronomia', false);
  assert.deepEqual(
    gastro.map((i) => i.nome),
    ['Prato B', 'Prato A']
  );
  assert.equal(getCategoryItems(reordered, 'cultura', false)[0].ordem, 1);
});
