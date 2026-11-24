import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_SERVICE_IDS,
  INITIAL_QUESTIONNAIRE_DATA,
  QuestionnaireData,
  buildWhatsAppMessage,
  buildWhatsAppQuoteUrl,
  formatIsoDateBr,
  isAllServicesSelected,
  toggleAllServices,
  toggleSingleService,
  validateStep,
} from './questionnaire';

test('selecting "Quero aproveitar tudo" selects all 3 services and allows unselecting one afterwards', () => {
  const allSelected = toggleAllServices([]);
  assert.deepEqual(allSelected, ALL_SERVICE_IDS);
  assert.equal(isAllServicesSelected(allSelected), true);

  const withoutRestaurant = toggleSingleService(allSelected, 'restaurante');
  assert.deepEqual(withoutRestaurant, ['passeio', 'hospedagem']);
  assert.equal(isAllServicesSelected(withoutRestaurant), false);
});

test('step validations enforce required selections, valid stay dates, and client name', () => {
  assert.equal(validateStep(1, INITIAL_QUESTIONNAIRE_DATA).valid, false);

  const withTour: QuestionnaireData = {
    ...INITIAL_QUESTIONNAIRE_DATA,
    services: ['passeio', 'hospedagem'],
  };
  assert.equal(validateStep(1, withTour).valid, true);
  assert.equal(validateStep(2, withTour).valid, true);

  // Optional dates/duration allowed on step 3
  assert.equal(validateStep(3, withTour).valid, true);

  // Invalid guests count (< 1) fails step 3 validation
  const badGuests: QuestionnaireData = {
    ...withTour,
    stay: {
      ...withTour.stay,
      duration: '2 dias',
      guestsCount: 0,
    },
  };
  assert.equal(validateStep(3, badGuests).valid, false);

  // Name required on step 4
  assert.equal(validateStep(4, withTour).valid, false);

  const validContact: QuestionnaireData = {
    ...withTour,
    contact: { name: 'Ana Clara', phone: '' },
  };
  assert.equal(validateStep(4, validContact).valid, true);
});

test('buildWhatsAppMessage excludes unselected service blocks and formats selected ones', () => {
  const passeioOnly: QuestionnaireData = {
    ...INITIAL_QUESTIONNAIRE_DATA,
    services: ['passeio'],
    adults: 3,
    children: 1,
    tour: { date: '2026-12-15', notes: 'Preferência pela manhã' },
    contact: { name: 'Lucas Silva', phone: '(98) 99999-1111' },
  };

  const msg = buildWhatsAppMessage(passeioOnly);
  assert.match(msg, /\*Nome:\* Lucas Silva/);
  assert.match(msg, /\*Telefone\/WhatsApp:\* \(98\) 99999-1111/);
  assert.match(msg, /\*Quantidade de pessoas:\* 3 adultos e 1 criança\./);
  assert.match(msg, /• Passeio de barco/);
  assert.match(msg, /\*Informações sobre passeio:\*/);
  assert.match(msg, /Data pretendida: 15\/12\/2026/);
  assert.match(msg, /Observações: Preferência pela manhã/);

  // Must NOT contain unselected services
  assert.equal(msg.includes('*Informações sobre hospedagem:*'), false);
  assert.equal(msg.includes('*Informações sobre restaurante:*'), false);
  assert.equal(msg.includes('• Hospedagem'), false);
  assert.equal(msg.includes('• Restaurante'), false);
});

test('buildWhatsAppMessage handles all 3 services and generates valid encoded wa.me link', () => {
  const allServices: QuestionnaireData = {
    services: ['passeio', 'hospedagem', 'restaurante'],
    adults: 2,
    children: 0,
    tour: { date: '', notes: '' },
    stay: {
      duration: '3 dias',
      guestsCount: 2,
      guestsManuallyEdited: false,
    },
    restaurant: { date: '2027-01-11', notes: 'Almoço com frutos do mar' },
    additionalNotes: 'Chegada prevista às 11h.',
    contact: { name: 'Mariana Costa', phone: '' },
  };

  const msg = buildWhatsAppMessage(allServices);
  assert.equal(msg.includes('*Informações sobre passeio:*'), true);
  assert.equal(msg.includes('*Informações sobre hospedagem:*'), true);
  assert.equal(msg.includes('*Informações sobre restaurante:*'), true);
  assert.equal(msg.includes('*Observações adicionais:*'), true);
  assert.equal(msg.includes('Data pretendida: Ainda não definida'), true);
  assert.equal(msg.includes('Tempo pretendido (dias ou horas): 3 dias'), true);
  assert.equal(msg.includes('Quantidade de hóspedes: 2'), true);

  const url = buildWhatsAppQuoteUrl(allServices, '(98) 98800-1122');
  assert.ok(url.startsWith('https://wa.me/5598988001122?text='));
  assert.ok(url.includes(encodeURIComponent('*Nome:* Mariana Costa')));
  assert.equal(formatIsoDateBr('2027-01-10'), '10/01/2027');
});

import {
  formatWhatsAppDisplay,
  resolveOfficialWhatsAppNumber,
} from '../config/whatsapp';

test('resolveOfficialWhatsAppNumber normalizes Brazilian DDD numbers with country code 55', () => {
  assert.equal(resolveOfficialWhatsAppNumber('(98) 99123-4567'), '5598991234567');
  assert.equal(resolveOfficialWhatsAppNumber('098991234567'), '5598991234567');
  assert.equal(resolveOfficialWhatsAppNumber('9832221100'), '559832221100');
  assert.equal(resolveOfficialWhatsAppNumber('5598991234567'), '5598991234567');
  assert.equal(resolveOfficialWhatsAppNumber(''), '5598988001122');
  assert.equal(formatWhatsAppDisplay('98991234567'), '+55 (98) 99123-4567');
});
