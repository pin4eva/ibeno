export function toDateInput(value: string | Date | null | undefined): string {
  if (!value) return '';

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }

  // Already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // ISO datetime like 1987-02-08T00:00:00.000Z
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

export function toIsoDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }

  // Already ISO datetime
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;

  // Date-only: treat as UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}
