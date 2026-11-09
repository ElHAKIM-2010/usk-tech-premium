export const STORE_TIME_ZONE = "Asia/Jakarta";

export function storeDateFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: STORE_TIME_ZONE,
    ...options,
  });
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;

  return Math.round((1 - price / compareAtPrice) * 100);
}
