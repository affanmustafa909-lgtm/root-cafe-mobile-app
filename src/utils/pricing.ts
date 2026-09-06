import type { CartOption, Product } from '../types';

export type ProductBadge = 'discount' | 'topSale' | null;

export function productSale(product: Product) {
  const percent =
    product.discountPercent &&
    product.discountPercent > 0 &&
    product.discountPercent <= 50
      ? product.discountPercent
      : null;
  const listed =
    product.compareAtPrice &&
    product.compareAtPrice > product.price &&
    product.compareAtPrice < product.price * 3
      ? product.compareAtPrice
      : null;
  const compareAt =
    listed ??
    (percent
      ? roundMoney(product.price / (1 - percent / 100))
      : null);
  const badge: ProductBadge = percent
    ? 'discount'
    : product.isTopSale
      ? 'topSale'
      : null;
  return { percent, compareAt, badge };
}

export function calcUnitPrice(basePrice: number, options: CartOption[]): number {
  return (
    basePrice +
    options.reduce((sum, option) => sum + Number(option.additionalPrice || 0), 0)
  );
}

export function calcLineTotal(
  basePrice: number,
  options: CartOption[],
  quantity: number,
): number {
  return roundMoney(calcUnitPrice(basePrice, options) * quantity);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calcCartSubtotal(
  items: { lineTotal: number }[],
): number {
  return roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
}

export function calcTax(subtotal: number, taxRate: number): number {
  return roundMoney(subtotal * taxRate);
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}
