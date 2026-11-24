import { createWhatsAppLink } from '../config/whatsapp';

export type ServiceOptionId = 'passeio' | 'hospedagem' | 'restaurante';

export const ALL_SERVICE_IDS: ServiceOptionId[] = [
  'passeio',
  'hospedagem',
  'restaurante',
];

export const SERVICE_LABELS: Record<ServiceOptionId, string> = {
  passeio: 'Passeio de barco',
  hospedagem: 'Hospedagem',
  restaurante: 'Restaurante',
};

export interface TourAnswers {
  date: string;
  notes: string;
}

export interface StayAnswers {
  duration: string;
  guestsCount: number;
  guestsManuallyEdited: boolean;
}

export interface RestaurantAnswers {
  date: string;
  notes: string;
}

export interface ContactAnswers {
  name: string;
  phone: string;
}

export interface QuestionnaireData {
  services: ServiceOptionId[];
  adults: number;
  children: number;
  tour: TourAnswers;
  stay: StayAnswers;
  restaurant: RestaurantAnswers;
  additionalNotes: string;
  contact: ContactAnswers;
}

export const INITIAL_QUESTIONNAIRE_DATA: QuestionnaireData = {
  services: [],
  adults: 2,
  children: 0,
  tour: {
    date: '',
    notes: '',
  },
  stay: {
    duration: '',
    guestsCount: 2,
    guestsManuallyEdited: false,
  },
  restaurant: {
    date: '',
    notes: '',
  },
  additionalNotes: '',
  contact: {
    name: '',
    phone: '',
  },
};

export function toggleSingleService(
  current: ServiceOptionId[],
  service: ServiceOptionId
): ServiceOptionId[] {
  if (current.includes(service)) {
    return current.filter((item) => item !== service);
  }
  return ALL_SERVICE_IDS.filter((id) => id === service || current.includes(id));
}

export function toggleAllServices(current: ServiceOptionId[]): ServiceOptionId[] {
  const hasAll = ALL_SERVICE_IDS.every((id) => current.includes(id));
  return hasAll ? [] : [...ALL_SERVICE_IDS];
}

export function isAllServicesSelected(current: ServiceOptionId[]): boolean {
  return ALL_SERVICE_IDS.every((id) => current.includes(id));
}

export function getTotalPeople(data: Pick<QuestionnaireData, 'adults' | 'children'>): number {
  return Math.max(1, data.adults) + Math.max(0, data.children);
}

export interface StepValidationResult {
  valid: boolean;
  error?: string;
}

export function validateStep(
  step: number,
  data: QuestionnaireData
): StepValidationResult {
  switch (step) {
    case 1: {
      if (data.services.length === 0) {
        return {
          valid: false,
          error: 'Selecione pelo menos uma experiência para continuar.',
        };
      }
      return { valid: true };
    }
    case 2: {
      if (data.adults < 1) {
        return {
          valid: false,
          error: 'Informe pelo menos 1 adulto participante.',
        };
      }
      if (data.children < 0) {
        return {
          valid: false,
          error: 'A quantidade de crianças não pode ser negativa.',
        };
      }
      return { valid: true };
    }
    case 3: {
      if (data.services.includes('hospedagem') && data.stay.guestsCount < 1) {
        return {
          valid: false,
          error: 'Informe pelo menos 1 hóspede para a hospedagem.',
        };
      }
      return { valid: true };
    }
    case 4: {
      if (data.contact.name.trim().length < 2) {
        return {
          valid: false,
          error: 'Por favor, informe seu nome para prepararmos seu atendimento.',
        };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}

export function formatIsoDateBr(isoDate?: string): string {
  if (!isoDate) return 'Ainda não definida';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatPeopleSummary(adults: number, children: number): string {
  const adultWord = adults === 1 ? 'adulto' : 'adultos';
  const childWord = children === 1 ? 'criança' : 'crianças';
  return `${adults} ${adultWord} e ${children} ${childWord}`;
}

export function buildWhatsAppMessage(data: QuestionnaireData): string {
  const clientName = data.contact.name.trim() || 'Visitante';
  const clientPhone = data.contact.phone.trim();
  const peopleText = formatPeopleSummary(data.adults, data.children);

  const selectedLabels = data.services.map((id) => `• ${SERVICE_LABELS[id]}`);

  const lines: string[] = [
    'Olá! Gostaria de solicitar um orçamento para conhecer a Raposa com o Raízes da Ilha.',
    '',
    `*Nome:* ${clientName}`,
  ];

  if (clientPhone) {
    lines.push(`*Telefone/WhatsApp:* ${clientPhone}`);
  }

  lines.push(
    '',
    `*Quantidade de pessoas:* ${peopleText}.`,
    '',
    '*Serviços desejados:*',
    ...selectedLabels
  );

  if (data.services.includes('passeio')) {
    lines.push(
      '',
      '*Informações sobre passeio:*',
      `Data pretendida: ${formatIsoDateBr(data.tour.date)}`,
      `Observações: ${data.tour.notes.trim() || 'Nenhuma observação informada'}`
    );
  }

  if (data.services.includes('hospedagem')) {
    lines.push(
      '',
      '*Informações sobre hospedagem:*',
      `Tempo pretendido (dias ou horas): ${data.stay.duration.trim() || 'Ainda não definido'}`,
      `Quantidade de hóspedes: ${Math.max(1, data.stay.guestsCount)}`
    );
  }

  if (data.services.includes('restaurante')) {
    lines.push(
      '',
      '*Informações sobre restaurante:*',
      `Data desejada: ${formatIsoDateBr(data.restaurant.date)}`,
      `Observações: ${data.restaurant.notes.trim() || 'Nenhuma observação informada'}`
    );
  }

  if (data.additionalNotes.trim()) {
    lines.push('', '*Observações adicionais:*', data.additionalNotes.trim());
  }

  lines.push(
    '',
    'Gostaria de receber informações sobre valores, disponibilidade e opções de pacotes.'
  );

  return lines.join('\n');
}

export function buildWhatsAppQuoteUrl(
  data: QuestionnaireData,
  customWhatsAppNumber?: string
): string {
  const message = buildWhatsAppMessage(data);
  return createWhatsAppLink(message, customWhatsAppNumber);
}
