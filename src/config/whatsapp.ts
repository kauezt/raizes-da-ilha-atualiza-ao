/**
 * Configuração centralizada do número oficial de WhatsApp do Raízes da Ilha.
 * Altere aqui para atualizar o destino das mensagens em todo o site.
 */
export const WHATSAPP_CONFIG = {
  /** Número oficial no formato internacional (DDI + DDD + número, apenas dígitos) */
  officialNumber: '5598988001122',
  baseUrl: 'https://wa.me',
} as const;

export function sanitizePhoneDigits(raw?: string): string {
  return String(raw || '').replace(/\D/g, '');
}

export function resolveOfficialWhatsAppNumber(customNumber?: string): string {
  let cleaned = sanitizePhoneDigits(customNumber).replace(/^0+/, '');
  if (!cleaned) {
    return WHATSAPP_CONFIG.officialNumber;
  }
  // Se o proprietário digitar apenas DDD + número (10 ou 11 dígitos), adiciona DDI 55 do Brasil
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = `55${cleaned}`;
  }
  return cleaned;
}

export function formatWhatsAppDisplay(customNumber?: string): string {
  const digits = resolveOfficialWhatsAppNumber(customNumber);
  if (digits.startsWith('55') && digits.length === 13) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.startsWith('55') && digits.length === 12) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return `+${digits}`;
}

export function createWhatsAppLink(message: string, customNumber?: string): string {
  const number = resolveOfficialWhatsAppNumber(customNumber);
  return `${WHATSAPP_CONFIG.baseUrl}/${number}?text=${encodeURIComponent(message)}`;
}
