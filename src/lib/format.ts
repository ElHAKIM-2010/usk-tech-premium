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
