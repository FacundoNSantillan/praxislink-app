export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acepta sitios con o sin protocolo/www: "vantia.com", "www.vantia.com.ar", "https://vantia.io"
const SITE_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i;

export function required(value: string, message = "Este campo es obligatorio."): string | null {
  return value.trim() ? null : message;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidSite(value: string): boolean {
  return SITE_RE.test(value.trim());
}

export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function isStrongEnoughPassword(value: string): boolean {
  return value.length >= 6;
}

/** true si hay al menos un error (objeto no vacío). */
export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
