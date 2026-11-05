// =========================================================================
// src/utils/phone.ts
// Responsible for normalizing Brazilian phone numbers.
// Converts any raw format into the (DDD) 99999-9999 pattern, accepting
// optional country and direct dialing prefixes and returning null when
// the number cannot be normalized.
// =========================================================================

/**
 * Normaliza um telefone brasileiro para o formato (DDD) 99999-9999.
 *
 * Aceita números com ou sem prefixo do país (+55), com ou sem o 0 de
 * discagem direta, e com qualquer pontuação.
 *
 * @returns O telefone formatado, ou `null` se não for possível normalizar.
 */
export function formatPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return null;

  // Remove o código do país (55) e o prefixo de discagem direta (0).
  let national = digits;
  if (national.startsWith('55') && national.length > 11) {
    national = national.slice(2);
  }
  if (national.startsWith('0')) {
    national = national.slice(1);
  }

  if (national.length === 11) {
    // 2 dígitos de DDD + 9 dígitos de celular
    return `(${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
  }

  if (national.length === 10) {
    // 2 dígitos de DDD + 8 dígitos de telefone fixo
    return `(${national.slice(0, 2)}) ${national.slice(2, 6)}-${national.slice(6)}`;
  }

  return null;
}
