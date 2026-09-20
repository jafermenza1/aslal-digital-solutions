const ETHIOPIAN_LOCAL = /^(09|07)\d{8}$/;
const ETHIOPIAN_COUNTRY = /^(251)(9|7)\d{8}$/;

export function normalizeEthiopianPhone(value: string | null | undefined): string | null {
  const raw = (value || "").trim().replace(/[\s().-]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+251")) {
    const digits = raw.slice(1);
    return ETHIOPIAN_COUNTRY.test(digits) ? `+${digits}` : null;
  }
  if (ETHIOPIAN_COUNTRY.test(raw)) return `+${raw}`;
  if (ETHIOPIAN_LOCAL.test(raw)) return `+251${raw.slice(1)}`;
  return null;
}
