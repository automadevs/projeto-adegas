import type { Product } from "../_lib/types";

export function stockClass(product: Product): string {
  if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) return "unavailable";
  if (product.stockStatus === "low") return "low-stock";
  return "available";
}

export function stockLabel(product: Product): string {
  if (product.stockStatus === "zero" || Number(product.stockOnHand) <= 0) return "Em falta";
  if (product.stockStatus === "low") return "Estoque baixo";
  return "Disponivel";
}

export function StockChip({ product }: { readonly product: Product }) {
  return <em className={`stock-chip ${stockClass(product)}`}>{stockLabel(product)}</em>;
}

export function ProductThumb({ large = false, product }: { readonly large?: boolean; readonly product: Product }) {
  const image = product.primaryImage;
  if (!image) return null;
  return (
    <span className={large ? "product-thumb large has-image" : "product-thumb has-image"}>
      <img alt={image.altText} height={image.height} loading={large ? "eager" : "lazy"} onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.closest(".product-thumb")?.remove(); }} src={image.url} width={image.width} />
    </span>
  );
}
