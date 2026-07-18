import { GlassWater } from "lucide-react";

import type { Product, ProductImage } from "../_lib/types";

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

export function ProductThumb({ large = false, product, image, fallbackLabel = "Foto" }: { readonly large?: boolean; readonly product?: Product; readonly image?: ProductImage | null; readonly fallbackLabel?: string }) {
  const resolvedImage = image ?? product?.primaryImage ?? null;
  if (!resolvedImage) {
    return (
      <span className={large ? "product-thumb large no-media" : "product-thumb no-media"}>
        <span className="product-thumb-fallback">
          <GlassWater aria-hidden="true" size={large ? 16 : 12} />
          <span>{fallbackLabel}</span>
        </span>
      </span>
    );
  }

  return (
    <span className={large ? "product-thumb large has-image" : "product-thumb has-image"}>
      <img alt={resolvedImage.altText} height={resolvedImage.height} loading={large ? "eager" : "lazy"} onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.closest(".product-thumb")?.classList.add("no-media"); event.currentTarget.closest(".product-thumb")?.classList.remove("has-image"); event.currentTarget.closest(".product-thumb")?.querySelector(".product-thumb-fallback")?.remove(); }} src={resolvedImage.url} width={resolvedImage.width} />
      <span className="product-thumb-fallback">
        <GlassWater aria-hidden="true" size={large ? 16 : 12} />
        <span>{fallbackLabel}</span>
      </span>
    </span>
  );
}
