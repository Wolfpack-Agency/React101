import { formatPrice, isOnSale } from "@/lib/products";

interface PriceProps {
  price: number;
  salePrice?: number;
}

// Owns everything about showing a price: formatting, the sale rule,
// and the markup. Callers just pass numbers, so it works for a product,
// a cart line or an order total alike.
export function Price({ price, salePrice }: PriceProps) {
  if (!isOnSale(price, salePrice)) {
    return <span className="font-semibold">{formatPrice(price)}</span>;
  }

  // <ins>/<del> carry meaning for assistive tech; the visually hidden
  // labels make screen readers say "Now €249, was €299".
  return (
    <span>
      <ins className="font-semibold text-rose-500 no-underline">
        <span className="sr-only">Now </span>
        {formatPrice(salePrice)}
      </ins>{" "}
      <del className="text-muted">
        <span className="sr-only">was </span>
        {formatPrice(price)}
      </del>
    </span>
  );
}
