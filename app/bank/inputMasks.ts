export const digitsOnly = (value: string, maximum: number) => value.replace(/\D/g, "").slice(0, maximum);

export function formatCpf(value: string) {
  const digits = digitsOnly(value, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function formatCpfOrAccount(value: string) {
  const digits = digitsOnly(value, 11);
  return digits.length > 7 ? formatCpf(digits) : digits;
}

export function formatBrazilianPhone(value: string) {
  const digits = digitsOnly(value, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const areaCode = digits.slice(0, 2);
  const local = digits.slice(2);
  if (local.length <= 4) return `(${areaCode}) ${local}`;
  const prefixLength = digits.length === 11 ? 5 : 4;
  return `(${areaCode}) ${local.slice(0, prefixLength)}-${local.slice(prefixLength)}`;
}

export const normalizeEmailInput = (value: string) => value.replace(/\s/g, "").toLowerCase();
